import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { createDataForSEOClient } from '../../../lib/dataforseo';

export const brandRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { keywords: true, backlinks: true },
        },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.brand.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              keywords: true,
              backlinks: true,
              contentPages: true,
            },
          },
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        domain: z.string().url(),
        blogDomain: z.string().url().optional().nullable(),
        targetKeywords: z.array(z.string()).default([]),
        competitors: z.array(z.string().url()).default([]),
        gscProperty: z.string().url().optional().nullable(),
        ga4Property: z.string().optional().nullable(),
        locationCode: z.number().default(2250),
        languageCode: z.string().default('en'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brand.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        domain: z.string().url().optional(),
        blogDomain: z.string().url().optional().nullable(),
        targetKeywords: z.array(z.string()).optional(),
        competitors: z.array(z.string().url()).optional(),
        gscProperty: z.string().url().optional().nullable(),
        ga4Property: z.string().optional().nullable(),
        locationCode: z.number().optional(),
        languageCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.brand.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brand.delete({
        where: { id: input.id },
      });
    }),

  fetchCompetitorKeywords: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        competitorDomain: z.string(),
        limit: z.number().default(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.competitorDomain },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const client = createDataForSEOClient();
      const result = await client.getRankedKeywords(
        input.competitorDomain,
        brand.locationCode,
        brand.languageCode,
        input.limit
      );

      await ctx.prisma.competitorSnapshot.create({
        data: {
          brandId: input.brandId,
          competitorDomain: input.competitorDomain,
          totalKeywords: result.total_count,
          estimatedTraffic: result.items.reduce(
            (sum, k) => sum + (k.trafficEstimate || 0),
            0
          ),
          topPages: result.items.slice(0, 10).map((k) => ({
            url: k.url,
            estimatedTraffic: k.trafficEstimate || 0,
          })),
          keywords: result.items.slice(0, 100) as any,
        },
      });

      return {
        totalKeywords: result.total_count,
        estimatedTraffic: result.items.reduce(
          (sum, k) => sum + (k.trafficEstimate || 0),
          0
        ),
        keywords: result.items.slice(0, 50),
      };
    }),

  getKeywordGaps: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        competitorDomain: z.string(),
        limit: z.number().default(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const client = createDataForSEOClient();
      const result = await client.getDomainIntersection(
        brand.domain,
        input.competitorDomain,
        brand.locationCode,
        brand.languageCode,
        input.limit
      );

      return {
        target1: brand.domain,
        target2: input.competitorDomain,
        intersection: result.intersection.slice(0, 100),
        totalIntersection: result.intersection.length,
      };
    }),

  getCompetitorOverview: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        competitorDomain: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const client = createDataForSEOClient();
      const result = await client.getDomainRankOverview(
        input.competitorDomain,
        brand.locationCode,
        brand.languageCode
      );

      await ctx.prisma.competitorSnapshot.create({
        data: {
          brandId: input.brandId,
          competitorDomain: input.competitorDomain,
          totalKeywords: result.total_keywords,
          estimatedTraffic: result.estimated_traffic,
              topPages: result.top_pages as any,
          keywords: [],
        },
      });

      return {
        domain: result.target,
        totalKeywords: result.total_keywords,
        estimatedTraffic: result.estimated_traffic,
        topPages: result.top_pages,
      };
    }),

  getCompetitorsOverview: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        competitorDomains: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const client = createDataForSEOClient();
      const results = await Promise.all(
        input.competitorDomains.map(async (domain) => {
          try {
            const result = await client.getDomainRankOverview(
              domain,
              brand.locationCode,
              brand.languageCode
            );

            await ctx.prisma.competitorSnapshot.create({
              data: {
                brandId: input.brandId,
                competitorDomain: domain,
                totalKeywords: result.total_keywords,
                estimatedTraffic: result.estimated_traffic,
          topPages: result.top_pages as any,
                keywords: [],
              },
            });

            return {
              domain: result.target,
              totalKeywords: result.total_keywords,
              estimatedTraffic: result.estimated_traffic,
              topPages: result.top_pages as any,
            };
          } catch (e) {
            return {
              domain,
              totalKeywords: 0,
              estimatedTraffic: 0,
              topPages: [],
            };
          }
        })
      );

      return results;
    }),
});
