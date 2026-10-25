import axios, { AxiosInstance } from 'axios';
import { DataForSEOConfig, SERPRequest, SERPResult, RankedKeywordsResponse, DomainIntersectionResponse, DomainRankOverviewResponse } from './types';

export class DataForSEOClient {
  private client: AxiosInstance;
  private config: DataForSEOConfig;

  constructor(config: DataForSEOConfig) {
    this.config = config;
    const auth = Buffer.from(`${config.login}:${config.password}`).toString('base64');
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.dataforseo.com/v3',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('DataForSEO API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  async getSERP(request: SERPRequest): Promise<SERPResult[]> {
    const response: any = await this.client.post('/serp/google/organic/live/advanced', [{
      keyword: request.keyword,
      location_code: request.location_code,
      language_code: request.language_code,
      device: request.device,
      depth: request.depth || 100,
    }]);
    return response.tasks?.[0]?.result?.[0]?.items || [];
  }

  async getBulkSERP(requests: SERPRequest[]): Promise<Map<string, SERPResult[]>> {
    const results = new Map<string, SERPResult[]>();
    
    for (let i = 0; i < requests.length; i += 20) {
      const batch = requests.slice(i, i + 20);
      const payload = batch.map(r => ({
        keyword: r.keyword,
        location_code: r.location_code,
        language_code: r.language_code,
        device: r.device,
        depth: r.depth || 100,
      }));
      
      const response: any = await this.client.post('/serp/google/organic/live/advanced', payload);
      const tasks = response.tasks || [];
      
      tasks.forEach((task: any, idx: number) => {
        const keyword = batch[idx]?.keyword;
        if (keyword && task.result?.[0]?.items) {
          results.set(keyword, task.result[0].items);
        }
      });
    }
    return results;
  }

  async getRankedKeywords(
    domain: string,
    locationCode: number,
    languageCode: string,
    limit = 1000
  ): Promise<RankedKeywordsResponse> {
    const response: any = await this.client.post('/dataforseo_labs/google/ranked_keywords/live', [{
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      filters: [['rank_group', '<=', 100]],
    }]);
    return response.tasks?.[0]?.result?.[0] || { target: domain, location_code: locationCode, language_code: languageCode, total_count: 0, items: [] };
  }

  async getDomainIntersection(
    target1: string,
    target2: string,
    locationCode: number,
    languageCode: string,
    limit = 500
  ): Promise<DomainIntersectionResponse> {
    const response: any = await this.client.post('/dataforseo_labs/google/domain_intersection/live', [{
      target1,
      target2,
      location_code: locationCode,
      language_code: languageCode,
      limit,
    }]);
    return response.tasks?.[0]?.result?.[0] || { target1, target2, intersection: [] };
  }

  async getDomainRankOverview(
    domain: string,
    locationCode: number,
    languageCode: string
  ): Promise<DomainRankOverviewResponse> {
    const response: any = await this.client.post('/dataforseo_labs/google/domain_rank_overview/live', [{
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
    }]);
    return response.tasks?.[0]?.result?.[0] || { target: domain, total_keywords: 0, estimated_traffic: 0, top_pages: [] };
  }

  async getKeywordsData(
    keywords: string[],
    locationCode: number,
    languageCode: string
  ): Promise<any[]> {
    const response: any = await this.client.post('/keywords_data/google_ads/search_volume/live', [{
      keywords,
      location_code: locationCode,
      language_code: languageCode,
    }]);
    return response.tasks?.[0]?.result?.[0]?.items || [];
  }

  async getBacklinks(
    domain: string,
    limit = 1000
  ): Promise<any[]> {
    const response: any = await this.client.post('/backlinks/backlinks/live', [{
      target: domain,
      limit,
      order_by: ['first_seen,desc'],
    }]);
    return response.tasks?.[0]?.result?.[0]?.items || [];
  }

  async getBacklinksSummary(domain: string): Promise<any> {
    const response: any = await this.client.post('/backlinks/summary/live', [{
      target: domain,
    }]);
    return response.tasks?.[0]?.result?.[0];
  }

  async getOnPageScore(url: string): Promise<any> {
    const response: any = await this.client.post('/on_page/live', [{
      url,
      load_resources: true,
      enable_javascript: true,
      enable_browser_rendering: true,
    }]);
    return response.tasks?.[0]?.result?.[0];
  }

  async getTechnicalAudit(domain: string): Promise<any> {
    const response: any = await this.client.post('/on_page/summary/live', [{
      target: domain,
    }]);
    return response.tasks?.[0]?.result?.[0];
  }
}

export function createDataForSEOClient(): DataForSEOClient {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  
  if (!login || !password) {
    throw new Error('DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set in environment');
  }
  
  return new DataForSEOClient({ login, password, baseUrl: 'https://api.dataforseo.com/v3' });
}