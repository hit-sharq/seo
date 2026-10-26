'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  LinkIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Overview', href: '/', icon: HomeIcon },
  { name: 'Keywords', href: '/keywords', icon: MagnifyingGlassIcon },
  { name: 'Competitors', href: '/competitors', icon: ChartBarIcon },
  { name: 'Backlinks', href: '/backlinks', icon: LinkIcon },
  { name: 'Content', href: '/content', icon: DocumentChartBarIcon },
  { name: 'Technical', href: '/technical', icon: Cog6ToothIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 transition-opacity lg:hidden ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar"
      >
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-primary-600">SEO Command Center</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">SEO Command Center v0.1</p>
        </div>
      </aside>
    </>
  );
}
