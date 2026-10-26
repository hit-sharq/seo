import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../lib/trpc';

export const reportsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      brandId: z.string(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.report.findMany({
        where: { brandId: input.brandId },
        take: input.limit,
        orderBy: { generatedAt: 'desc' },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.report.findUnique({
        where: { id: input.id },
      });
    }),

  generateWeekly: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // This would aggregate data from the past week
      // For now, create a placeholder report
      const report = await ctx.prisma.report.create({
        data: {
          brandId: input.brandId,
          type: 'weekly',
          status: 'generating',
          data: {
            period: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              end: new Date(),
            },
            summary: {
              totalKeywords: 0,
              avgPosition: 0,
              trafficEstimate: 0,
              newBacklinks: 0,
              lostBacklinks: 0,
            },
          },
        },
      });

      // In real implementation, this would be async with a job queue
      // For now, mark as ready with placeholder data
      await ctx.prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'ready',
          data: {
            period: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              end: new Date(),
            },
            summary: {
              totalKeywords: 150,
              avgPosition: 12.5,
              trafficEstimate: 45000,
              newBacklinks: 12,
              lostBacklinks: 3,
            },
            topGainers: [],
            topLosers: [],
            newBacklinks: [],
            lostBacklinks: [],
            cwvChanges: [],
          },
        },
      });

      return ctx.prisma.report.findUnique({ where: { id: report.id } });
    }),

  generateMonthly: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.create({
        data: {
          brandId: input.brandId,
          type: 'monthly',
          status: 'ready',
          data: {
            period: {
              start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              end: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
            },
            summary: {
              totalKeywords: 200,
              avgPosition: 10.2,
              trafficEstimate: 180000,
              newBacklinks: 45,
              lostBacklinks: 8,
            },
          },
        },
      });

      return report;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.report.delete({
        where: { id: input.id },
      });
    }),
});