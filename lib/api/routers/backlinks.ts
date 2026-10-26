import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { createDataForSEOClient } from '../../../lib/dataforseo';

export const backlinksRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
        filter: z
          .object({
            isNew: z.boolean().optional(),
            isLost: z.boolean().optional(),
            toxicityMin: z.number().optional(),
            linkType: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { brandId: input.brandId };
      if (input.filter) {
        if (input.filter.isNew !== undefined) where.isNew = input.filter.isNew;
        if (input.filter.isLost !== undefined) where.isLost = input.filter.isLost;
        if (input.filter.toxicityMin)
          where.toxicityScore = { gte: input.filter.toxicityMin };
        if (input.filter.linkType) where.linkType = input.filter.linkType;
      }

      const backlinks = await ctx.prisma.backlink.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { firstSeen: 'desc' },
      });

      let nextCursor: string | undefined;
      if (backlinks.length > input.limit) {
        const nextItem = backlinks.pop();
        nextCursor = nextItem!.id;
      }

      return { backlinks, nextCursor };
    }),

  getSummary: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [total, newCount, lostCount, toxicCount, avgDR] =
        await Promise.all([
          ctx.prisma.backlink.count({ where: { brandId: input.brandId } }),
          ctx.prisma.backlink.count({
            where: { brandId: input.brandId, isNew: true },
          }),
          ctx.prisma.backlink.count({
            where: { brandId: input.brandId, isLost: true },
          }),
          ctx.prisma.backlink.count({
            where: { brandId: input.brandId, toxicityScore: { gte: 50 } },
          }),
          ctx.prisma.backlink.aggregate({
            where: { brandId: input.brandId },
            _avg: { domainRating: true },
          }),
        ]);

      return {
        total,
        new: newCount,
        lost: lostCount,
        toxic: toxicCount,
        avgDomainRating: avgDR._avg.domainRating || 0,
      };
    }),

  fetchBacklinks: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        limit: z.number().default(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) throw new Error('Brand not found');

      const client = createDataForSEOClient();
      const backlinks = await client.getBacklinks(brand.domain, input.limit);

      let newCount = 0;
      let updatedCount = 0;

      for (const bl of backlinks) {
        const existing = await ctx.prisma.backlink.findFirst({
          where: {
            brandId: input.brandId,
            sourceUrl: bl.source_url,
            targetUrl: bl.target_url,
          },
        });

        if (existing) {
          await ctx.prisma.backlink.update({
            where: { id: existing.id },
            data: {
              anchor: bl.anchor || '',
              domainRating: bl.domain_rating || 0,
              pageRating: bl.page_rating || 0,
              toxicityScore: bl.toxicity_score || 0,
              linkType: bl.link_type || 'dofollow',
              lastSeen: new Date(),
              isLost: false,
            },
          });
        } else {
          await ctx.prisma.backlink.create({
            data: {
              brandId: input.brandId,
              sourceUrl: bl.source_url || '',
              targetUrl: bl.target_url || '',
              anchor: bl.anchor || '',
              domainRating: bl.domain_rating || 0,
              pageRating: bl.page_rating || 0,
              toxicityScore: bl.toxicity_score || 0,
              linkType: bl.link_type || 'dofollow',
              firstSeen: new Date(bl.first_seen || Date.now()),
              lastSeen: new Date(),
              isNew: true,
            },
          });
          newCount++;
        }
      }

      const lostCount = await ctx.prisma.backlink.updateMany({
        where: {
          brandId: input.brandId,
          lastSeen: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          isLost: false,
        },
        data: { isLost: true },
      });

      return {
        newCount,
        updatedCount: newCount,
        lostCount: lostCount.count,
      };
    }),

  getToxicLinks: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        threshold: z.number().default(50),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.backlink.findMany({
        where: {
          brandId: input.brandId,
          toxicityScore: { gte: input.threshold },
        },
        orderBy: { toxicityScore: 'desc' },
        take: input.limit,
      });
    }),

  getAnchorDistribution: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ ctx, input }) => {
      const backlinks = await ctx.prisma.backlink.findMany({
        where: { brandId: input.brandId },
        select: { anchor: true },
      });

      const distribution: Record<string, number> = {};
      for (const bl of backlinks) {
        const anchor = bl.anchor.toLowerCase().trim();
        distribution[anchor] = (distribution[anchor] || 0) + 1;
      }

      return Object.entries(distribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([anchor, count]) => ({ anchor, count }));
    }),

  getReferringDomains: publicProcedure
    .input(
      z.object({ brandId: z.string(), limit: z.number().default(50) })
    )
    .query(async ({ ctx, input }) => {
      const backlinks = await ctx.prisma.backlink.findMany({
        where: { brandId: input.brandId },
        select: { sourceUrl: true, domainRating: true },
      });

      const domains: Record<string, { count: number; totalDR: number }> = {};
      for (const bl of backlinks) {
        try {
          const url = new URL(bl.sourceUrl);
          const domain = url.hostname.replace('www.', '');
          if (!domains[domain]) {
            domains[domain] = { count: 0, totalDR: 0 };
          }
          domains[domain].count++;
          domains[domain].totalDR += bl.domainRating;
        } catch (e) {
          // Ignore invalid URLs
        }
      }

      return Object.entries(domains)
        .map(([domain, data]) => ({
          domain,
          backlinks: data.count,
          avgDR: Math.round(data.totalDR / data.count),
        }))
        .sort((a, b) => b.backlinks - a.backlinks)
        .slice(0, input.limit);
    }),
});
