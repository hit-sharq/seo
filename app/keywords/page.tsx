'use client';

import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Card';

const LOCATIONS = [
  { code: 2250, name: 'Kenya', language: 'en' },
  { code: 2840, name: 'United States', language: 'en' },
  { code: 2140, name: 'United Kingdom', language: 'en' },
  { code: 2124, name: 'Nigeria', language: 'en' },
  { code: 2236, name: 'Ghana', language: 'en' },
];

interface KeywordRow {
  keyword: string;
  position: number | null;
  url: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
  intent: string;
  trafficEstimate: number;
}

export default function KeywordsPage() {
  const [mounted, setMounted] = useState(false);
  const [domain, setDomain] = useState('');
  const [locationCode, setLocationCode] = useState(2250);
  const [languageCode, setLanguageCode] = useState('en');
  const [limit, setLimit] = useState(500);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  const { data, isLoading } = trpc.keyword.getDomainKeywords.useQuery(
    { domain, locationCode, languageCode, limit },
    { enabled: !!domain && !isFetching }
  );

  const handleFetch = () => {
    const trimmed = domain.trim();
    if (!trimmed) return;
    setIsFetching(true);
    setError(null);
  };

  const keywords: KeywordRow[] = data?.keywords || [];
  const totalKeywords = data?.totalKeywords || 0;

  if (isLoading || isFetching) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Keyword Lookup</h1>
          <p className="text-gray-600">Enter any domain to see all keywords it ranks for.</p>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="e.g. marakumi.bet"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="input flex-1"
          />
          <button onClick={handleFetch} className="btn btn-primary">
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" /> Fetch Keywords
          </button>
        </div>
        <Card className="p-6">
          <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Keyword Lookup</h1>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Keyword Lookup</h1>
        <p className="text-gray-600">Enter any domain to see all keywords it ranks for.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
        <div className="flex-1">
          <label className="label">Domain</label>
          <input
            type="text"
            placeholder="e.g. marakumi.bet"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="md:w-48">
          <label className="label">Location</label>
          <select
            value={locationCode}
            onChange={(e) => {
              const loc = LOCATIONS.find((l) => l.code === Number(e.target.value));
              setLocationCode(Number(e.target.value));
              setLanguageCode(loc?.language || 'en');
            }}
            className="input w-full"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:w-48">
          <label className="label">Limit</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="input w-full"
          >
            {[100, 250, 500, 1000].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFetch}
          disabled={!domain.trim()}
          className="btn btn-primary"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" /> Fetch Keywords
        </button>
      </div>

      {data && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Results for {data.domain} ({totalKeywords.toLocaleString()} total keywords)
          </h2>
          <p className="text-sm text-gray-500">Showing {keywords.length} keywords</p>
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Keyword</TableHeaderCell>
              <TableHeaderCell className="text-right">Position</TableHeaderCell>
              <TableHeaderCell className="text-right">Volume</TableHeaderCell>
              <TableHeaderCell className="text-right">Difficulty</TableHeaderCell>
              <TableHeaderCell className="text-right">CPC</TableHeaderCell>
              <TableHeaderCell>Intent</TableHeaderCell>
              <TableHeaderCell>URL</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No keywords found. Enter a domain and click Fetch Keywords.
                </TableCell>
              </TableRow>
            ) : (
              keywords.map((kw: KeywordRow) => (
                <TableRow key={kw.keyword} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900 max-w-xs truncate">
                    {kw.keyword}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {kw.position !== null ? kw.position : '—'}
                  </TableCell>
                  <TableCell className="text-right text-gray-600 font-mono">
                    {(kw.searchVolume ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {kw.keywordDifficulty?.toFixed(1) || '—'}
                  </TableCell>
                  <TableCell className="text-right text-gray-600 font-mono">
                    ${(kw.cpc ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className="badge badge-info">{kw.intent}</span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm max-w-xs truncate">
                    {kw.url || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
