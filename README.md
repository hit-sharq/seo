# SEO Command Center

Unified SEO intelligence platform for **Pakakumi** and **Betkumi** brands. Automates keyword tracking, competitor analysis, backlink monitoring, technical audits, and content optimization.

## Architecture

```
seo-command-center/
├── packages/
│   ├── api/           # Next.js 14 + tRPC API (port 3001)
│   ├── web/           # Next.js 14 Dashboard (port 3000)
│   ├── worker/        # BullMQ background jobs
│   ├── shared/        # Types, DataForSEO client, utilities
│   └── database/      # Prisma + PostgreSQL schema
├── docker-compose.yml
└── turbo.json
```

## Features

### Automated (Runs on Schedule)
| Job | Schedule | Description |
|-----|----------|-------------|
| Keyword Position Check | Daily 6:00 AM | Checks SERP positions for all tracked keywords |
| Competitor Keyword Fetch | Daily 7:00 AM | Gets all keywords competitors rank for |
| Backlink Fetch | Weekly (Wed) | Fetches new/lost backlinks, toxicity |
| Technical Audit | Weekly (Mon) | CWV, crawl errors, indexation, schema |
| Content Gap Analysis | Monthly 1st | Keywords competitors rank for but you don't |

### On-Demand (via Dashboard)
- **Keyword Research**: Volume, KD, CPC, intent, clusters
- **Competitor Gap Analysis**: Keywords they rank for, you don't
- **Content Brief Generator**: SERP analysis, headings, FAQs, entities
- **Content Scorer**: Real-time optimization score (0-100)
- **Backlink Audit**: Toxicity, anchor distribution, referring domains
- **Technical Audit**: CWV, crawl errors, indexation, schema
- **Scheduled Reports**: Weekly/Monthly PDF summaries

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- DataForSEO API credentials

### Local Development

```bash
# 1. Clone and install
cd seo-command-center
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start infrastructure
docker-compose up -d postgres redis

# 4. Setup database
cd packages/database
npm run db:push
npm run db:generate

# 5. Start all services
cd ../..
npm run dev
```

### Docker Production

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f api
docker-compose logs -f worker
```

## Brand Configuration

Add brands via API or dashboard:

```json
{
  "name": "Pakakumi",
  "domain": "pakakumi.com",
  "blogDomain": "blog.pakakumi.com",
  "targetKeywords": [
    "pakakumi",
    "pakakumi aviator",
    "pakakumi crash",
    "crash game kenya",
    "aviator game kenya"
  ],
  "competitors": [
    "betika.co.ke",
    "sportpesa.co.ke",
    "odibets.com",
    "betkumi.com"
  ],
  "locationCode": 2250,
  "languageCode": "en"
}
```

## DataForSEO Endpoints Used

| Feature | Endpoint |
|---------|----------|
| SERP Positions | `/v3/serp/google/organic/live/advanced` |
| Competitor Keywords | `/v3/dataforseo_labs/google/ranked_keywords/live` |
| Keyword Gaps | `/v3/dataforseo_labs/google/domain_intersection/live` |
| Competitor Overview | `/v3/dataforseo_labs/google/domain_rank_overview/live` |
| Keyword Data (Volume/CPC/KD) | `/v3/keywords_data/google_ads/search_volume/live` |
| Backlinks | `/v3/backlinks/backlinks/live` |
| On-Page Score | `/v3/on_page/live` |
| Technical Audit | `/v3/on_page/summary/live` |

## Dashboard Pages

| Page | Path | Description |
|------|------|-------------|
| Overview | `/` | KPI cards, position trend, CWV trend |
| Keywords | `/keywords` | Filterable table, position history, gap analysis |
| Competitors | `/competitors` | Side-by-side comparison, keyword overlap |
| Backlinks | `/backlinks` | New/lost, toxicity, anchors, referring domains |
| Content | `/content` | Page scores, optimization opportunities, briefs |
| Technical | `/technical` | CWV trends, crawl errors, schema coverage |
| Reports | `/reports` | Scheduled + ad-hoc report generation |

## API Endpoints (tRPC)

All endpoints are type-safe via tRPC:

```typescript
// Keywords
trpc.keyword.getAll.useQuery({ brandId, limit: 50 })
trpc.keyword.getPositionHistory.useQuery({ keywordId, days: 30 })
trpc.keyword.checkPositions.mutate({ brandId })
trpc.keyword.getGaps.mutate({ brandId, competitorDomain })
trpc.keyword.enrichKeywords.mutate({ brandId, keywords: ['aviator kenya'] })

// Competitors
trpc.brand.fetchCompetitorKeywords.mutate({ brandId, competitorDomain })
trpc.brand.getKeywordGaps.mutate({ brandId, competitorDomain })
trpc.brand.getCompetitorOverview.mutate({ brandId, competitorDomain })

// Content
trpc.content.getBrief.mutate({ brandId, targetKeyword: 'aviator kenya' })
trpc.content.scoreContent.mutate({ url, targetKeyword })

// Technical
trpc.technical.runAudit.mutate({ brandId })
trpc.technical.getCWVTrends.useQuery({ brandId, days: 30 })

// Backlinks
trpc.backlinks.fetchBacklinks.mutate({ brandId })
trpc.backlinks.getToxicLinks.useQuery({ brandId, threshold: 50 })

// Reports
trpc.reports.generateWeekly.mutate({ brandId })
```

## Worker Jobs

| Queue | Job | Concurrency |
|-------|-----|-------------|
| `keyword-check` | Daily SERP position checks | 3 |
| `competitor-fetch` | Competitor keyword fetching | 2 |
| `backlink-fetch` | Backlink profile scans | 1 |
| `technical-audit` | CWV + technical audits | 1 |

## Environment Variables

```env
DATAFORSEO_LOGIN=your_login
DATAFORSEO_PASSWORD=your_password
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Cost Estimate

| Component | Monthly Cost |
|-----------|--------------|
| DataForSEO API | ~$50-150 (depends on volume) |
| VPS (4GB RAM, 2 CPU) | ~$20-40 |
| PostgreSQL + Redis (managed) | ~$15-30 |
| **Total** | **~$85-220/mo** |

*Replaces Ahrefs/SEMrush ($200-400/mo per seat)*

## Deployment

### Single Server (Docker Compose)
```bash
docker-compose up -d --build
```

### Kubernetes (Helm)
```bash
# TODO: Add Helm charts
```

## Monitoring

- **Worker health**: BullMQ dashboard at `/admin/queues`
- **API health**: `GET /api/health`
- **Database**: Prisma Studio `npm run db:studio`
- **Logs**: `docker-compose logs -f worker`

## License

MIT - Built for Pakakumi & Betkumi SEO teams.# seo
