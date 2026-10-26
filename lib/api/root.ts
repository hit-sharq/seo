import { createTRPCRouter } from './trpc';
import { brandRouter } from './routers/brand';
import { keywordRouter } from './routers/keyword';
import { contentRouter } from './routers/content';
import { technicalRouter } from './routers/technical';
import { backlinksRouter } from './routers/backlinks';
import { reportsRouter } from './routers/reports';

export const appRouter = createTRPCRouter({
  brand: brandRouter,
  keyword: keywordRouter,
  content: contentRouter,
  technical: technicalRouter,
  backlinks: backlinksRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
