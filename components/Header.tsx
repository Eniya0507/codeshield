'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Zap, Wallet, Bot, Menu, CheckCircle2 } from 'lucide-react';

// Load wallet button only on client (never SSR) to avoid "useWallet must be inside WalletProvider" error
const WalletConnectButton = dynamic(
  () => import('./WalletConnectButton').then((m) => ({ default: m.WalletConnectButton })),
  {
    ssr: false,
    loading: () => (
      <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/50 text-slate-950 font-bold text-xs flex items-center space-x-1.5 opacity-60">
        <Wallet className="w-3.5 h-3.5" />
        <span>Connect Wallet</span>
      </div>
    ),
  }
);

interface HeaderProps {
  title?: string;
  onMobileMenuToggle?: () => void;
  network?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Agent Workspace',
  onMobileMenuToggle,
  network = 'Algorand Testnet',
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Title / Mobile Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 md:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="font-extrabold text-sm sm:text-base text-slate-100 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Header Status Indicators */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
        {/* Network Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{network}</span>
        </div>

        {/* Wallet connect button — shows real balance only after wallet is connected */}
        <WalletConnectButton />

        {/* Agent Status Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono">
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">Autonomous Agent</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
