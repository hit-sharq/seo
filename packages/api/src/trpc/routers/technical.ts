import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../lib/trpc';
import { createDataForSEOClient } from '@seo-command-center/shared';

export const technicalRouter = createTRPCRouter({
  getLatestAudit: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.technicalAudit.findFirst({
        where: { brandId: input.brandId },
        orderBy: { checkedAt: 'desc' },
      });
    }),

  getAuditHistory: publicProcedure
    .input(z.object({
      brandId: z.string(),
      days: z.number().default(90),
    }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      return ctx.prisma.technicalAudit.findMany({
        where: {
          brandId: input.brandId,
          checkedAt: { gte: since },
        },
        orderBy: { checkedAt: 'asc' },
      });
    }),

  runAudit: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) throw new Error('Brand not found');

      const client = createDataForSEOClient();
      const audit = await client.getTechnicalAudit(brand.domain);

      // Parse audit results - this is simplified
      const auditData = {
        lcp: audit?.lcp || 0,
        inp: audit?.inp || 0,
        cls: audit?.cls || 0,
        fcp: audit?.fcp || 0,
        ttfb: audit?.ttfb || 0,
        performanceScore: audit?.performance_score || 0,
        indexationRate: audit?.indexation_rate || 0,
        crawlErrors: audit?.crawl_errors || [],
        schemaCoverage: audit?.schema_coverage || {},
      };

      const saved = await ctx.prisma.technicalAudit.create({
        data: {
          brandId: input.brandId,
          ...auditData,
        },
      });

      return saved;
    }),

  getCWVTrends: publicProcedure
    .input(z.object({
      brandId: z.string(),
      days: z.number().default(90),
    }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const audits = await ctx.prisma.technicalAudit.findMany({
        where: {
          brandId: input.brandId,
          checkedAt: { gte: since },
        },
        orderBy: { checkedAt: 'asc' },
        select: {
          lcp: true,
          inp: true,
          cls: true,
          fcp: true,
          ttfb: true,
          performanceScore: true,
          checkedAt: true,
        },
      });

      return audits.map((a) => {
        return {
          date: a.checkedAt,
          lcp: a.lcp,
          inp: a.inp,
          cls: a.cls,
          fcp: a.fcp,
          ttfb: a.ttfb,
          score: a.performanceScore,
        };
      });
    }),

  getIndexationRate: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ ctx, input }) => {
      // This would ideally come from GSC API
      // For now, return latest audit data
      const latest = await ctx.prisma.technicalAudit.findFirst({
        where: { brandId: input.brandId },
        orderBy: { checkedAt: 'desc' },
        select: { indexationRate: true, checkedAt: true },
      });

      return latest || { indexationRate: 0, checkedAt: null };
    }),

  getSchemaCoverage: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ ctx, input }) => {
      const latest = await ctx.prisma.technicalAudit.findFirst({
        where: { brandId: input.brandId },
        orderBy: { checkedAt: 'desc' },
        select: { schemaCoverage: true, checkedAt: true },
      });

      return latest?.schemaCoverage || {};
    }),

  getCrawlErrors: publicProcedure
    .input(z.object({ brandId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const latest = await ctx.prisma.technicalAudit.findFirst({
        where: { brandId: input.brandId },
        orderBy: { checkedAt: 'desc' },
        select: { crawlErrors: true, checkedAt: true },
      });

      return latest?.crawlErrors?.slice(0, input.limit) || [];
    }),
});