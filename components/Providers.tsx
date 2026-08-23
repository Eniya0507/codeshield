'use client';

import React, { useState, useEffect } from 'react';
import { WalletManager, WalletProvider } from '@txnlab/use-wallet-react';
import { pera } from '@txnlab/use-wallet-pera';
import { defly } from '@txnlab/use-wallet-defly';

function createWalletManager() {
  return new WalletManager({
    wallets: [
      pera(),
      defly(),
    ],
    defaultNetwork: 'testnet',
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<WalletManager | null>(null);

  useEffect(() => {
    const mgr = createWalletManager();

    // Silently handle expired mobile sessions so console stays clean
    mgr.on('error', ({ walletId, error }) => {
      const isStaleSession =
        error?.message?.toLowerCase().includes('no accounts found') ||
        error?.message?.toLowerCase().includes('session');
      if (isStaleSession) {
        console.info(`[CodeShield] Ready to connect ${walletId ?? 'wallet'}.`);
      } else {
        console.warn(`[Wallet:${walletId ?? 'unknown'}]`, error?.message);
      }
    });

    setManager(mgr);
  }, []);

  if (!manager) {
    // Don't render children until WalletProvider is ready.
    // This ensures useWallet() is always called inside WalletProvider.
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm font-mono animate-pulse">Initializing wallet...</div>
      </div>
    );
  }

  return (
    <WalletProvider manager={manager}>
      {children}
    </WalletProvider>
  );
}
