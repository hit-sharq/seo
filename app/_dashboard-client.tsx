'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { BrandSelector } from '@/components/BrandSelector';
import { OverviewCards } from '@/components/OverviewCards';
import { KeywordTable } from '@/components/KeywordTable';
import { CompetitorView } from '@/components/CompetitorView';
import { CWVChart } from '@/components/charts/CWVChart';
import { PositionChart } from '@/components/charts/PositionChart';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function DashboardClient() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-6 transition-all duration-300`}>
          <BrandSelector onChange={setSelectedBrandId} />
          {selectedBrandId ? (
            <div className="space-y-6">
              <OverviewCards brandId={selectedBrandId} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PositionChart brandId={selectedBrandId} />
                <CWVChart brandId={selectedBrandId} />
              </div>
              <KeywordTable brandId={selectedBrandId} />
              <CompetitorView brandId={selectedBrandId} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a brand to view dashboard
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
