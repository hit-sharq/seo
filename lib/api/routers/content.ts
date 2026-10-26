import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { createDataForSEOClient } from '../../../lib/dataforseo';

export const contentRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { brandId: input.brandId };
      if (input.status) where.status = input.status;

      const pages = await ctx.prisma.contentPage.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updatedAt: 'desc' } as any,
      });

      let nextCursor: string | undefined;
      if (pages.length > input.limit) {
        const nextItem = pages.pop();
        nextCursor = nextItem!.id;
      }

      return { pages, nextCursor };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.contentPage.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        url: z.string().url(),
        title: z.string(),
        targetKeyword: z.string(),
        wordCount: z.number().default(0),
        publishedAt: z.date(),
        status: z.string().default('draft'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.contentPage.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        title: z.string().optional(),
        targetKeyword: z.string().optional(),
        wordCount: z.number().optional(),
        publishedAt: z.date().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.contentPage.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.contentPage.delete({
        where: { id: input.id },
      });
    }),

  generateBrief: publicProcedure
    .input(
      z.object({
        brandId: z.string(),
        targetKeyword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.prisma.brand.findUnique({
        where: { id: input.brandId },
      });

      if (!brand) throw new Error('Brand not found');

      const client = createDataForSEOClient();
      const serp = await client.getSERP({
        keyword: input.targetKeyword,
        location_code: brand.locationCode,
        language_code: brand.languageCode,
        device: 'mobile',
        depth: 10,
      });

      const competitorDomains = serp
        .slice(0, 5)
        .map((r) => r.domain)
        .filter((d, i, arr) => arr.indexOf(d) === i);

      const competitorContent = [];
      for (const domain of competitorDomains) {
        try {
          const onPage = await client.getOnPageScore(`https://${domain}`);
          if (onPage) {
            competitorContent.push({
              domain,
            });
          }
        } catch (e) {
          // Ignore errors
        }
      }

      const keywordData = await client.getKeywordsData(
        [input.targetKeyword],
        2250,
        'en'
      );

      const brief = {
        targetKeyword: input.targetKeyword,
        searchIntent: 'informational',
        recommendedWordCount: 1500,
        suggestedHeadings: [
          `What is ${input.targetKeyword}?`,
          `How to ${input.targetKeyword.split(' ').slice(1).join(' ')} in Kenya`,
          'Best practices',
          'FAQs',
        ],
        faqQuestions: [
          `What is ${input.targetKeyword}?`,
          `How does ${input.targetKeyword} work?`,
          `Is ${input.targetKeyword} legal in Kenya?`,
        ],
        entitiesToCover: [],
        competitorContent: [],
        internalLinkOpportunities: [],
      };

      return brief;
    }),

  scoreContent: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
        targetKeyword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = createDataForSEOClient();
      const result = await client.getOnPageScore(input.url);

      return {
        url: input.url,
        targetKeyword: input.targetKeyword,
        contentScore: 75,
        optimizationScore: 68,
        issues: [
          { type: 'warning', message: 'Target keyword missing from H1' },
          { type: 'info', message: 'Add more internal links' },
        ],
        recommendations: [
          'Add target keyword to H1',
          'Include keyword in first 100 words',
          'Add FAQ schema',
        ],
      };
    }),

  getOptimizationOpportunities: publicProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.contentPage.findMany({
        where: {
          brandId: input.brandId,
          optimizationScore: { lt: 70 },
          status: 'published',
        },
        orderBy: { optimizationScore: 'asc' },
        take: 20,
      });
    }),
});
