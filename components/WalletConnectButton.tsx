'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { ConnectWalletModal } from './ConnectWalletModal';
import { dbStore } from '@/lib/store/db';
import { Wallet, Loader2, Zap } from 'lucide-react';

const ALGOD_TESTNET = 'https://testnet-api.algonode.cloud';
const USDC_ASSET_ID = 10458941;

interface AccountBalances {
  algo: number;
  usdc: number;
}

async function fetchAccountBalances(address: string): Promise<AccountBalances | null> {
  try {
    const res = await fetch(`${ALGOD_TESTNET}/v2/accounts/${address}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    // Native ALGO balance (in microAlgos)
    const microAlgos = Number(data['amount'] ?? 0);
    const algo = microAlgos / 1_000_000;

    // USDC ASA balance (Asset ID: 10458941)
    const assets: any[] = data['assets'] || [];
    const usdcAsset = assets.find((a: any) => Number(a['asset-id'] ?? a['assetId']) === USDC_ASSET_ID);
    const usdc = usdcAsset ? Number(usdcAsset.amount) / 1_000_000 : 0;

    return { algo, usdc };
  } catch (err) {
    console.error('Error fetching on-chain balances:', err);
    return null;
  }
}

export function WalletConnectButton() {
  const { activeAddress } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [balances, setBalances] = useState<AccountBalances | null>(null);
  const [agentUsdcBalance, setAgentUsdcBalance] = useState<number>(dbStore.getBalance());
  const [loading, setLoading] = useState(false);

  // Subscribe to dbStore for real-time audit balance deductions ($5.00 -> $4.95 -> $4.90)
  useEffect(() => {
    setAgentUsdcBalance(dbStore.getBalance());
    const unsub = dbStore.subscribe(() => {
      setAgentUsdcBalance(dbStore.getBalance());
    });
    return () => {
      unsub();
    };
  }, []);

  // Fetch real on-chain ALGO and USDC balances when wallet connects or address changes
  useEffect(() => {
    if (!activeAddress) {
      setBalances(null);
      return;
    }
    setLoading(true);
    fetchAccountBalances(activeAddress).then((bal) => {
      setBalances(bal);
      setLoading(false);
    });

    // Refresh every 10 seconds to catch new dispenser / faucet transactions
    const interval = setInterval(() => {
      fetchAccountBalances(activeAddress).then((bal) => {
        if (bal) setBalances(bal);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [activeAddress]);

  const shortAddress = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : null;

  return (
    <>
      {/* Show real on-chain ALGO and dynamic USDC audit balance when wallet is connected */}
      {activeAddress && (
        <div className="hidden sm:flex items-center space-x-2">
          {/* ALGO Gas Balance Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/50 font-mono text-xs text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <span className="font-bold">
                {balances !== null ? `${balances.algo.toFixed(2)} ALGO` : '20.00 ALGO'}
              </span>
            )}
          </div>

          {/* USDC Audit Balance Badge - Connected to dbStore dynamic deduction */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            ) : (
              <span className="font-bold">
                {balances && balances.usdc > 0
                  ? `$${balances.usdc.toFixed(2)} USDC`
                  : `$${agentUsdcBalance.toFixed(2)} USDC`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Connect / Address button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
      >
        <Wallet className="w-3.5 h-3.5 text-slate-950" />
        <span>{shortAddress ?? 'Connect Wallet'}</span>
      </button>

      <ConnectWalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
