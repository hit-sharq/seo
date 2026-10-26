import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { createDataForSEOClient } from '../../../lib/dataforseo';

export const keywordRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
        filter: z
          .object({
            position: z
              .object({
                min: z.number().optional(),
                max: z.number().optional(),
              })
              .optional(),
            volume: z
              .object({
                min: z.number().optional(),
                max: z.number().optional(),
              })
              .optional(),
            difficulty: z
              .object({
                min: z.number().optional(),
                max: z.number().optional(),
              })
              .optional(),
            intent: z.string().optional(),
            status: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { brandId: input.brandId };

      if (input.filter) {
        if (input.filter.position) {
          where.positions = {
            some: {
              position: {
                gte: input.filter.position.min,
                lte: input.filter.position.max,
              },
            },
          };
        }
        if (input.filter.volume) {
          where.volume = {
            gte: input.filter.volume.min,
            lte: input.filter.volume.max,
          };
        }
        if (input.filter.difficulty) {
          where.difficulty = {
            gte: input.filter.difficulty.min,
            lte: input.filter.difficulty.max,
          };
        }
        if (input.filter.intent) {
          where.intent = input.filter.intent;
        }
      }

      const keywords = (await ctx.prisma.keyword.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
          positions: {
            orderBy: { checkedAt: 'desc' },
            take: 1,
          },
        },
      })) as any;

      let nextCursor: string | undefined;
      if (keywords.length > input.limit) {
        const nextItem = keywords.pop();
        nextCursor = nextItem!.id;
      }

      return {
        keywords: keywords.map((k: any) => ({
          ...k,
          currentPosition: k.positions[0]?.position || null,
          previousPosition: k.positions[0]?.previousPosition || null,
          lastChecked: k.positions[0]?.checkedAt || null,
        })),
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.keyword.findUnique({
        where: { id: input.id },
        include: {
          positions: {
            orderBy: { checkedAt: 'desc' },
            take: 30,
          },
        },
      });
    }),

  getPositionHistory: publicProcedure
    .input(
      z.object({ keywordId: z.string(), days: z.number().default(90) })
    )
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      return ctx.prisma.keywordPosition.findMany({
        where: {
          keywordId: input.keywordId,
          checkedAt: { gte: since },
        },
        orderBy: { checkedAt: 'asc' },
      });
    }),

  enrichKeywords: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        keywords: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) throw new Error('Brand not found');

      const client = createDataForSEOClient();
      const results = await client.getKeywordsData(
        input.keywords,
        brand.locationCode,
        brand.languageCode
      );

      for (const r of results) {
        await ctx.prisma.keyword.upsert({
          where: {
            brandId_keyword: { brandId: input.brandId, keyword: r.keyword },
          },
          update: {
            volume: r.searchVolume || 0,
            cpc: r.cpc || 0,
            difficulty: r.keywordDifficulty || 0,
          },
          create: {
            brandId: input.brandId,
            keyword: r.keyword,
            volume: r.searchVolume || 0,
            cpc: r.cpc || 0,
            difficulty: r.keywordDifficulty || 0,
          },
        });
      }

      return { processed: results.length };
    }),

  checkPositions: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) throw new Error('Brand not found');

      const keywords = await ctx.prisma.keyword.findMany({
        where: { brandId: input.brandId },
        include: { positions: { orderBy: { checkedAt: 'desc' }, take: 1 } },
      });

      const client = createDataForSEOClient();
      const serpRequests = keywords.map((kw) => ({
        keyword: kw.keyword,
        location_code: brand.locationCode,
        language_code: brand.languageCode,
        device: 'mobile' as const,
        depth: 100,
      }));

      const serpResults = await client.getBulkSERP(serpRequests);

      for (const kw of keywords) {
        const serp = serpResults.get(kw.keyword) || [];
        const ourResult = serp.find(
          (r) =>
            r.domain === brand.domain ||
            r.domain.includes(brand.domain.replace('www.', ''))
        );

        const previousPosition = kw.positions?.[0]?.position || null;
        const position = ourResult?.rank_absolute || null;

        await ctx.prisma.keywordPosition.create({
          data: {
            keywordId: kw.id,
            brandId: input.brandId,
            position,
            previousPosition,
            url: ourResult?.url || '',
            title: ourResult?.title || '',
            snippet: ourResult?.description || '',
            searchVolume: kw.volume,
            keywordDifficulty: kw.difficulty,
            checkedAt: new Date(),
          },
        });
      }

      return { processed: keywords.length };
    }),

  createCluster: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        name: z.string(),
        keywords: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.keywordCluster.create({
        data: input,
      });
    }),

  getAggregatePositionHistory: publicProcedure
    .input(
      z.object({ brandId: z.string(), days: z.number().default(30) })
    )
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const positions = await ctx.prisma.keywordPosition.findMany({
        where: {
          brandId: input.brandId,
          checkedAt: { gte: since },
          position: { not: null },
        },
        select: {
          position: true,
          checkedAt: true,
        },
        orderBy: { checkedAt: 'asc' },
      });

      const byDate: Record<string, { sum: number; count: number }> = {};
      for (const p of positions) {
        const date = p.checkedAt.toISOString().split('T')[0];
        if (!byDate[date]) byDate[date] = { sum: 0, count: 0 };
        if (p.position !== null) {
          byDate[date].sum += p.position;
          byDate[date].count += 1;
        }
      }

      return Object.entries(byDate)
        .map(([date, stats]) => ({
          date,
          avgPosition: Math.round((stats.sum / stats.count) * 10) / 10,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }),

  getDomainKeywords: publicProcedure
    .input(
      z.object({
        domain: z.string(),
        locationCode: z.number().default(2250),
        languageCode: z.string().default('en'),
        limit: z.number().default(500),
      })
    )
    .query(async ({ input }) => {
      const client = createDataForSEOClient();
      const result = await client.getRankedKeywords(
        input.domain,
        input.locationCode,
        input.languageCode,
        input.limit
      );

      return {
        domain: result.target,
        totalKeywords: result.total_count,
        keywords: result.items.map((k) => ({
          keyword: k.keyword,
          position: k.position,
          url: k.url,
          searchVolume: k.searchVolume,
          keywordDifficulty: k.keywordDifficulty,
          cpc: k.cpc,
          intent: k.intent,
          trafficEstimate: k.trafficEstimate,
        })),
      };
    }),
});
