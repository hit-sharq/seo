import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { createDataForSEOClient } from '@seo-command-center/shared';
import { prisma } from '@seo-command-center/database';

// Redis connection
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Queues
export const keywordQueue = new Queue('keyword-check', { connection: redis });
export const competitorQueue = new Queue('competitor-fetch', { connection: redis });
export const backlinkQueue = new Queue('backlink-fetch', { connection: redis });
export const technicalQueue = new Queue('technical-audit', { connection: redis });
export const contentQueue = new Queue('content-brief', { connection: redis });
export const reportQueue = new Queue('report-generation', { connection: redis });

// Queue events for monitoring
export const keywordQueueEvents = new QueueEvents('keyword-check', { connection: redis });
export const competitorQueueEvents = new QueueEvents('competitor-fetch', { connection: redis });

keywordQueueEvents.on('completed', ({ jobId }) => {
  console.log(`Keyword job ${jobId} completed`);
});

keywordQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Keyword job ${jobId} failed:`, failedReason);
});

// Job processors
export async function processKeywordCheck(job: any) {
  const { brandId, keywordIds } = job.data;
  
  // Import here to avoid circular deps
  const { createDataForSEOClient } = await import('@seo-command-center/shared');
  const { default: prisma } = await import('@seo-command-center/database');
  
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) throw new Error('Brand not found');

  const keywords = keywordIds 
    ? await prisma.keyword.findMany({ where: { id: { in: keywordIds } } })
    : await prisma.keyword.findMany({ where: { brandId } });

  const client = createDataForSEOClient();
  const serpRequests = keywords.map(kw => ({
    keyword: kw.keyword,
    location_code: brand.locationCode,
    language_code: brand.languageCode,
    device: 'mobile' as const,
    depth: 100,
  }));

  const serpResults = await client.getBulkSERP(serpRequests);

  for (const kw of keywords) {
    const serp = serpResults.get(kw.keyword) || [];
    const ourResult = serp.find(r => r.domain === brand.domain || r.domain.includes(brand.domain.replace('www.', '')));
    
    const previousPosition = kw.positions?.[0]?.position || null;
    const position = ourResult?.rank_absolute || null;
    
    await prisma.keywordPosition.create({
      data: {
        keywordId: kw.id,
        brandId,
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
}

export async function processCompetitorFetch(job: any) {
  const { brandId, competitorDomain } = job.data;
  
  const { createDataForSEOClient } = await import('@seo-command-center/shared');
  const { default: prisma } = await import('@seo-command-center/database');
  
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) throw new Error('Brand not found');

  const client = createDataForSEOClient();
  
  // Get ranked keywords
  const rankedKeywords = await client.getRankedKeywords(
    job.data.competitorDomain,
    brand.locationCode,
    brand.languageCode,
    1000
  );

  // Store snapshot
  await prisma.competitorSnapshot.create({
    data: {
      brandId,
      competitorDomain: job.data.competitorDomain,
      totalKeywords: rankedKeywords.total_count,
      estimatedTraffic: rankedKeywords.items.reduce((sum, k) => sum + (k.trafficEstimate || 0), 0),
      topPages: rankedKeywords.items.slice(0, 10).map(k => ({ url: k.url, estimatedTraffic: k.trafficEstimate || 0 })),
      keywords: rankedKeywords.items.slice(0, 100),
    },
  });

  // Get domain intersection (gap analysis)
  const intersection = await client.getDomainIntersection(
    brand.domain,
    job.data.competitorDomain,
    brand.locationCode,
    brand.languageCode,
    500
  );

  return {
    totalKeywords: rankedKeywords.total_count,
    intersection: intersection.intersection.length,
  };
}

export async function processBacklinkFetch(job: any) {
  const { brandId } = job.data;
  
  const { createDataForSEOClient } = await import('@seo-command-center/shared');
  const { default: prisma } = await import('@seo-command-center/database');
  
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) throw new Error('Brand not found');

  const client = createDataForSEOClient();
  const backlinks = await client.getBacklinks(brand.domain, 1000);

  let newCount = 0;
  for (const bl of backlinks) {
    const existing = await prisma.backlink.findFirst({
      where: {
        brandId,
        sourceUrl: bl.source_url,
        targetUrl: bl.target_url,
      },
    });

    if (existing) {
      await prisma.backlink.update({
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
      await prisma.backlink.create({
        data: {
          brandId,
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
    }
  }

  return { processed: backlinks.length };
}

export async function processTechnicalAudit(job: any) {
  const { brandId } = job.data;
  
  const { createDataForSEOClient } = await import('@seo-command-center/shared');
  const { default: prisma } = await import('@seo-command-center/database');
  
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) throw new Error('Brand not found');

  const client = createDataForSEOClient();
  const audit = await client.getTechnicalAudit(brand.domain);

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

  await prisma.technicalAudit.create({
    data: {
      brandId,
      ...auditData,
    },
  });

  return auditData;
}

// Worker setup
function createWorkers() {
  new Worker('keyword-check', processKeywordCheck, { 
    connection: redis,
    concurrency: 3,
  });

  new Worker('competitor-fetch', processCompetitorFetch, { 
    connection: redis,
    concurrency: 2,
  });

  new Worker('backlink-fetch', processBacklinkFetch, { 
    connection: redis,
    concurrency: 1,
  });

  new Worker('technical-audit', async (job) => {
    const { processTechnicalAudit } = await import('./index');
    return processTechnicalAudit(job);
  }, { 
    connection: redis,
    concurrency: 1,
  });

  console.log('Workers started');
}

export async function scheduleJobs() {
  // Daily keyword checks at 6 AM
  await keywordQueue.add('daily-keyword-check', { brandId: 'all' }, {
    repeat: { pattern: '0 6 * * *' },
    jobId: 'daily-keyword-check',
  });

  // Daily competitor checks at 7 AM
  // This would be per brand per competitor
  
  // Weekly technical audit on Mondays
  // Weekly backlink fetch on Wednesdays
  
  console.log('Scheduled jobs registered');
}

export async function startWorker() {
  console.log('Starting SEO worker...');
  createWorkers();
  await scheduleJobs();
  console.log('Worker started successfully');
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await redis.quit();
  process.exit(0);
});

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startWorker().catch(console.error);
}

export { redis };