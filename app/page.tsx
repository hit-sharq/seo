'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { BrandSelector } from '@/components/BrandSelector';
import { OverviewCards } from '@/components/OverviewCards';
import { KeywordTable } from '@/components/KeywordTable';
import { CompetitorView } from '@/components/CompetitorView';
import { CWVChart } from '@/components/charts/CWVChart';
import { PositionChart } from '@/components/charts/PositionChart';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 animate-pulse h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} min-h-[calc(100vh-4rem)] transition-all duration-300`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <BrandSelector onChange={setSelectedBrandId} />
            {selectedBrandId ? (
              <div className="space-y-8">
                <OverviewCards brandId={selectedBrandId} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PositionChart brandId={selectedBrandId} />
                  <CWVChart brandId={selectedBrandId} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <KeywordTable brandId={selectedBrandId} className="lg:col-span-2" />
                  <CompetitorView brandId={selectedBrandId} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a brand to view dashboard</h3>
                <p className="text-gray-500">Choose a brand from the selector above to see your SEO data.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
