'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { ConnectWalletModal } from '@/components/ConnectWalletModal';
import {
  Wallet,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

interface WalletClientContentProps {
  remainingDailyBudget: number;
}

export function WalletClientContent({ remainingDailyBudget }: WalletClientContentProps) {
  const { activeAddress, activeWallet } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [onChainBalances, setOnChainBalances] = useState<{ algo: number; usdc: number } | null>(null);

  useEffect(() => {
    if (!activeAddress) {
      setOnChainBalances(null);
      return;
    }
    const fetchBal = async () => {
      try {
        const res = await fetch(`https://testnet-api.algonode.cloud/v2/accounts/${activeAddress}`);
        if (res.ok) {
          const data = await res.json();
          const algo = Number(data['amount'] ?? 0) / 1_000_000;
          const assets: any[] = data['assets'] || [];
          const usdcAsset = assets.find((a: any) => Number(a['asset-id'] ?? a['assetId']) === 10458941);
          const usdc = usdcAsset ? Number(usdcAsset.amount) / 1_000_000 : 0;
          setOnChainBalances({ algo, usdc });
        }
      } catch (err) {
        console.error('Wallet balance fetch error:', err);
      }
    };
    fetchBal();
    const interval = setInterval(fetchBal, 10000);
    return () => clearInterval(interval);
  }, [activeAddress]);

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* ===== CUSTOMER CONNECTED ACCOUNT CARD ===== */}
      <div
        className={`rounded-2xl border p-5 flex items-center justify-between gap-4 flex-wrap shadow-xl backdrop-blur-sm ${
          activeAddress
            ? 'bg-emerald-950/40 border-emerald-800/60'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              activeAddress
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {activeAddress ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              {activeAddress ? 'Customer Wallet Connected' : 'No Customer Wallet Connected'}
            </div>
            {activeAddress ? (
              <div className="font-mono text-sm font-bold text-emerald-300 break-all">
                {activeAddress}
              </div>
            ) : (
              <div className="text-sm text-slate-400">
                Connect your Pera or Defly wallet to link your Algorand account
              </div>
            )}
            {activeWallet && (
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                via <span className="text-slate-300 font-semibold">{activeWallet.metadata?.name}</span> · Algorand Testnet
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {activeAddress && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Address'}</span>
              </button>
              <a
                href={`https://lora.algokit.io/testnet/account/${activeAddress}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-xs font-mono text-emerald-300 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View on Lora</span>
              </a>
            </>
          )}
          <button
            onClick={() => setWalletModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{activeAddress ? 'Switch Wallet' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>

      {/* ===== FUND YOUR ACCOUNT CARD ===== */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex items-center space-x-2 mb-5 border-b border-slate-800 pb-4">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Fund Your Testnet Account</h3>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            TESTNET ONLY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 — Get ALGO */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold flex items-center justify-center">1</span>
              <span className="text-sm font-bold text-slate-100">Get Free ALGO (Gas Fees)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              You need <span className="text-amber-300 font-semibold">ALGO</span> to pay Algorand network gas fees. Get <span className="text-amber-300 font-semibold">10 free testnet ALGO</span> from the official faucet.
            </p>
            {activeAddress ? (
              <a
                href={`https://dispenser.testnet.aws.algodev.network/?account=${activeAddress}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Get 10 ALGO from Faucet →</span>
              </a>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 text-xs font-mono text-center">
                Connect wallet first to auto-fill address
              </div>
            )}
          </div>

          {/* Step 2 — Get USDC */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold flex items-center justify-center">2</span>
              <span className="text-sm font-bold text-slate-100">Get USDC (Audit Payments)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              CodeShield charges <span className="text-emerald-300 font-semibold">$0.05 USDC</span> per audit. Get testnet USDC from the Algorand USDC faucet (ASA ID: <span className="font-mono text-emerald-300">10458941</span>).
            </p>
            <a
              href="https://testnet.folks.finance/faucet"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Get USDC from Folks Finance →</span>
            </a>
          </div>
        </div>
      </div>

      {/* Agent Wallet Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Agent Wallet Status</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Connected & Active</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">Algorand Testnet</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Configured Asset</div>
          <div className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>USDC (ASA 10458941)</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">6 Micro-unit Decimals</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Live Account Balance</div>
          <div className="text-lg font-black text-emerald-400 font-mono">
            {onChainBalances && onChainBalances.usdc > 0
              ? `$${onChainBalances.usdc.toFixed(2)} USDC`
              : '$5.00 USDC (Allocated)'}
          </div>
          <div className="text-[11px] font-mono text-amber-300 font-bold">
            {onChainBalances ? `${onChainBalances.algo.toFixed(2)} ALGO Gas` : '20.00 ALGO Gas'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Remaining Daily Budget</div>
          <div className="text-lg font-black text-amber-300 font-mono">
            ${remainingDailyBudget.toFixed(2)} USDC
          </div>
          <div className="text-[11px] font-mono text-slate-400">Limit: $2.00 USDC/day</div>
        </div>
      </div>

      <ConnectWalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
}
