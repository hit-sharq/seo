-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "blogDomain" TEXT,
    "targetKeywords" TEXT[],
    "competitors" TEXT[],
    "gscProperty" TEXT,
    "ga4Property" TEXT,
    "locationCode" INTEGER NOT NULL DEFAULT 2250,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "intent" TEXT NOT NULL DEFAULT 'informational',
    "clusterId" TEXT,
    "targetUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordPosition" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "position" INTEGER,
    "previousPosition" INTEGER,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "searchVolume" INTEGER NOT NULL DEFAULT 0,
    "keywordDifficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorSnapshot" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "competitorDomain" TEXT NOT NULL,
    "totalKeywords" INTEGER NOT NULL DEFAULT 0,
    "estimatedTraffic" INTEGER NOT NULL DEFAULT 0,
    "topPages" JSONB NOT NULL,
    "keywords" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backlink" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "domainRating" INTEGER NOT NULL DEFAULT 0,
    "pageRating" INTEGER NOT NULL DEFAULT 0,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false,
    "toxicityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "linkType" TEXT NOT NULL DEFAULT 'dofollow',
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backlink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalAudit" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lcp" DOUBLE PRECISION NOT NULL,
    "inp" DOUBLE PRECISION NOT NULL,
    "cls" DOUBLE PRECISION NOT NULL,
    "fcp" DOUBLE PRECISION NOT NULL,
    "ttfb" DOUBLE PRECISION NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "indexationRate" DOUBLE PRECISION NOT NULL,
    "crawlErrors" JSONB NOT NULL,
    "schemaCoverage" JSONB NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechnicalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPage" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetKeyword" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "contentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "optimizationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastOptimizedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBrief" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "targetKeyword" TEXT NOT NULL,
    "searchIntent" TEXT NOT NULL,
    "recommendedWordCount" INTEGER NOT NULL,
    "suggestedHeadings" TEXT[],
    "faqQuestions" TEXT[],
    "entitiesToCover" TEXT[],
    "competitorContent" JSONB NOT NULL,
    "internalLinkOpportunities" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordCluster" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cron" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandConfig" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "gscEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ga4Enabled" BOOLEAN NOT NULL DEFAULT false,
    "dataforseoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "alertWebhook" TEXT,
    "alertEmail" TEXT,
    "slackWebhook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_domain_key" ON "Brand"("domain");

-- CreateIndex
CREATE INDEX "Brand_domain_idx" ON "Brand"("domain");

-- CreateIndex
CREATE INDEX "Keyword_brandId_idx" ON "Keyword"("brandId");

-- CreateIndex
CREATE INDEX "Keyword_clusterId_idx" ON "Keyword"("clusterId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_brandId_keyword_key" ON "Keyword"("brandId", "keyword");

-- CreateIndex
CREATE INDEX "KeywordPosition_keywordId_idx" ON "KeywordPosition"("keywordId");

-- CreateIndex
CREATE INDEX "KeywordPosition_brandId_checkedAt_idx" ON "KeywordPosition"("brandId", "checkedAt");

-- CreateIndex
CREATE INDEX "KeywordPosition_checkedAt_idx" ON "KeywordPosition"("checkedAt");

-- CreateIndex
CREATE INDEX "CompetitorSnapshot_brandId_competitorDomain_capturedAt_idx" ON "CompetitorSnapshot"("brandId", "competitorDomain", "capturedAt");

-- CreateIndex
CREATE INDEX "Backlink_brandId_idx" ON "Backlink"("brandId");

-- CreateIndex
CREATE INDEX "Backlink_targetUrl_idx" ON "Backlink"("targetUrl");

-- CreateIndex
CREATE INDEX "Backlink_firstSeen_idx" ON "Backlink"("firstSeen");

-- CreateIndex
CREATE INDEX "Backlink_isNew_isLost_idx" ON "Backlink"("isNew", "isLost");

-- CreateIndex
CREATE INDEX "TechnicalAudit_brandId_checkedAt_idx" ON "TechnicalAudit"("brandId", "checkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPage_url_key" ON "ContentPage"("url");

-- CreateIndex
CREATE INDEX "ContentPage_brandId_idx" ON "ContentPage"("brandId");

-- CreateIndex
CREATE INDEX "ContentPage_targetKeyword_idx" ON "ContentPage"("targetKeyword");

-- CreateIndex
CREATE INDEX "ContentPage_status_idx" ON "ContentPage"("status");

-- CreateIndex
CREATE INDEX "ContentBrief_brandId_targetKeyword_idx" ON "ContentBrief"("brandId", "targetKeyword");

-- CreateIndex
CREATE INDEX "Report_brandId_generatedAt_idx" ON "Report"("brandId", "generatedAt");

-- CreateIndex
CREATE INDEX "Alert_brandId_createdAt_idx" ON "Alert"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_acknowledged_idx" ON "Alert"("acknowledged");

-- CreateIndex
CREATE INDEX "KeywordCluster_brandId_idx" ON "KeywordCluster"("brandId");

-- CreateIndex
CREATE INDEX "ScheduledTask_enabled_nextRun_idx" ON "ScheduledTask"("enabled", "nextRun");

-- CreateIndex
CREATE UNIQUE INDEX "BrandConfig_brandId_key" ON "BrandConfig"("brandId");

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordPosition" ADD CONSTRAINT "KeywordPosition_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordPosition" ADD CONSTRAINT "KeywordPosition_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlink" ADD CONSTRAINT "Backlink_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalAudit" ADD CONSTRAINT "TechnicalAudit_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPage" ADD CONSTRAINT "ContentPage_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

