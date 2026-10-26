import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../lib/trpc';
import { createDataForSEOClient } from '../../../lib/dataforseo';

export const keywordRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      brandId: z.string(),
      limit: z.number().default(50),
      cursor: z.string().optional(),
      filter: z.object({
        position: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
        volume: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
        difficulty: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
        intent: z.string().optional(),
        status: z.string().optional(),
      }).optional(),
    })
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

      const keywords = await ctx.prisma.keyword.findMany({
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
      });

      let nextCursor: string | undefined;
      if (keywords.length > input.limit) {
        const nextItem = keywords.pop();
        nextCursor = nextItem!.id;
      }

      return {
        keywords: keywords.map(k => ({
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

  // Get position history for a keyword
  getPositionHistory: publicProcedure
    .input(z.object({ keywordId: z.string(), days: z.number().default(90) }))
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

  // Create or update keywords from research
  upsertKeywords: publicProcedure
    .input(z.object({
      brandId: z.string(),
      keywords: z.array(z.object({
        keyword: z.string(),
        volume: z.number().default(0),
        cpc: z.number().default(0),
        difficulty: z.number().default(0),
        intent: z.string().default('informational'),
        targetUrl: z.string().url().optional().nullable(),
      })),
    })
    .mutation(async ({ ctx, input }) => {
      const results = [];
      for (const kw of input.keywords) {
        const result = await ctx.prisma.keyword.upsert({
          where: {
            brandId_keyword: {
              brandId: input.brandId,
              keyword: kw.keyword,
            },
          },
          update: {
            volume: kw.volume,
            cpc: kw.cpc,
            difficulty: kw.difficulty,
            intent: kw.intent,
            targetUrl: kw.targetUrl,
          },
          create: {
            brandId: input.brandId,
            keyword: kw.keyword,
            volume: kw.volume,
            cpc: kw.cpc,
            difficulty: kw.difficulty,
            intent: kw.intent,
            targetUrl: kw.targetUrl,
          },
        });
        results.push(result);
      }
      return results;
    }),

  // Fetch keyword data (volume, CPC, difficulty) from DataForSEO
  enrichKeywords: publicProcedure
    .input(z.object({
      brandId: z.string(),
      keywords: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const client = createDataForSEOClient();
      const keywordData = await client.getKeywordsData(
        input.keywords,
        brand.locationCode,
        brand.languageCode
      );

      const results = [];
      for (const kd of keywordData) {
        const result = await ctx.prisma.keyword.upsert({
          where: {
            brandId_keyword: {
              brandId: input.brandId,
              keyword: kd.keyword,
            },
          },
          update: {
            volume: kd.search_volume || 0,
            cpc: kd.cpc || 0,
            difficulty: kd.keyword_difficulty || 0,
            intent: kd.intent || 'informational',
          },
          create: {
            brandId: input.brandId,
            keyword: kd.keyword,
            volume: kd.search_volume || 0,
            cpc: kd.cpc || 0,
            difficulty: kd.keyword_difficulty || 0,
            intent: kd.intent || 'informational',
          },
        });
        results.push(result);
      }

      return results;
    }),

  // Daily position check for all tracked keywords
  checkPositions: publicProcedure
    .input(z.object({ brandId: z.string(), keywordIds: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const keywords = input.keywordIds 
        ? await ctx.prisma.keyword.findMany({ where: { id: { in: input.keywordIds } } })
        : await ctx.prisma.keyword.findMany({ where: { brandId: input.brandId } });

      const client = createDataForSEOClient();
      const serpRequests = keywords.map(kw => ({
        keyword: kw.keyword,
        location_code: brand.locationCode,
        language_code: brand.languageCode,
        device: 'mobile' as const,
        depth: 100,
      }));

      const serpResults = await client.getBulkSERP(serpRequests);

      const results = [];
      for (const kw of keywords) {
        const serp = serpResults.get(kw.keyword) || [];
        const ourResult = serp.find(r => r.domain === brand.domain || r.domain.includes(brand.domain.replace('www.', '')));
        
        const previousPosition = kw.positions[0]?.position || null;
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

        // Update keyword with latest position
        await ctx.prisma.keyword.update({
          where: { id: kw.id },
          data: {
            // We could store last known position here if needed
          },
        });

        results.push({
          keyword: kw.keyword,
          position,
          previousPosition,
          change: previousPosition && position ? previousPosition - position : null,
        });
      }

      return results;
    }),

  // Get keyword gaps vs competitor
  getGaps: publicProcedure
    .input(z.object({
      brandId: z.string(),
      competitorDomain: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) throw new Error('Brand not found');

      const client = createDataForSEOClient();
      const result = await client.getDomainIntersection(
        brand.domain,
        input.competitorDomain,
        brand.locationCode,
        brand.languageCode,
        500
      );

      // Get our keywords for comparison
      const ourKeywords = await ctx.prisma.keyword.findMany({
        where: { brandId: input.brandId },
        select: { keyword: true, id: true },
      });
      const ourKeywordSet = new Set(ourKeywords.map(k => k.keyword.toLowerCase()));

      const gaps = result.intersection
        .filter(k => !ourKeywordSet.has(k.keyword.toLowerCase()))
        .map(k => ({
          keyword: k.keyword,
          competitorPosition: k.position,
          competitorUrl: k.url,
          volume: k.searchVolume,
          difficulty: k.keywordDifficulty,
          intent: k.intent,
          cpc: k.cpc,
        }))
        .slice(0, 100);

      return {
        competitor: input.competitorDomain,
        totalIntersection: result.intersection.length,
        gaps: gaps.length,
        opportunities: gaps,
      };
    }),

  // Get keyword clusters
  getClusters: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.keywordCluster.findMany({
        where: { brandId: input.brandId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  createCluster: publicProcedure
    .input(z.object({
      brandId: z.string(),
      name: z.string(),
      keywords: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.keywordCluster.create({
        data: input,
      });
    }),

  // Aggregate position history across all tracked keywords for a brand
  getAggregatePositionHistory: publicProcedure
    .input(z.object({ brandId: z.string(), days: z.number().default(30) }))
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

      // Group by date and compute average position
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

  // Fetch all keywords a domain ranks for (standalone lookup, no brand required)
  getDomainKeywords: publicProcedure
    .input(z.object({
      domain: z.string(),
      locationCode: z.number().default(2250),
      languageCode: z.string().default('en'),
      limit: z.number().default(500),
    }))
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
        keywords: result.items.map(k => ({
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