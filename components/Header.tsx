'use client';

import { MinusIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="Open menu"
          >
            <MinusIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="lg:hidden ml-2 flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600 tracking-tight">SEO Command Center</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors relative"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-in">
                <p className="px-4 py-2 text-sm font-semibold text-gray-900">Notifications</p>
                <div className="border-t border-gray-50">
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    New keyword opportunity: "aviator kenya"
                  </a>
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Position drop detected for "crash game kenya"
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <UserCircleIcon className="h-7 w-7 text-gray-400 group-hover:text-primary-600" aria-hidden="true" />
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-slide-in">
                <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Settings
                </a>
                <hr className="my-1 border-gray-50" />
                <a href="#" className="block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
