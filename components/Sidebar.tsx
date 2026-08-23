'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Wallet,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  Home,
  Terminal,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/workspace', label: 'Agent Workspace', icon: LayoutDashboard },
    { href: '/explorer', label: 'API Explorer (x402)', icon: Terminal },
    { href: '/activity', label: 'Live Activity', icon: Activity },
    { href: '/audit', label: 'CodeShield Audit', icon: ShieldAlert },
    { href: '/wallet', label: 'Wallet & Budget', icon: Wallet },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
    { href: '/reports', label: 'Security Reports', icon: FileText },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base text-slate-100 tracking-tight flex items-center gap-1.5">
                <span>CodeShield</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  x402
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Autonomous Gateway</p>
            </div>
          </Link>

          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Agent Command Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 shadow-md shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Agent Mode</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Network: <span className="text-amber-300">Algorand Testnet</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
