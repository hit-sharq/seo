import { createTRPCRouter } from '../lib/trpc';
import { brandRouter } from './brand';
import { keywordRouter } from './keyword';
import { contentRouter } from './content';
import { technicalRouter } from './technical';
import { backlinksRouter } from './backlinks';
import { reportsRouter } from './reports';

export const appRouter = createTRPCRouter({
  brand: brandRouter,
  keyword: keywordRouter,
  content: contentRouter,
  technical: technicalRouter,
  backlinks: backlinksRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;