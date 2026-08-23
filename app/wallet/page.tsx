'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { evaluateSpendingPolicy, DEFAULT_AGENT_POLICY } from '@/lib/policy/spendingPolicy';
import {
  ShieldCheck,
  Sliders,
  Check,
} from 'lucide-react';

const WalletClientContent = dynamic(
  () => import('@/components/WalletClientContent').then((m) => ({ default: m.WalletClientContent })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl text-center font-mono text-xs text-slate-500">
        Loading wallet parameters...
      </div>
    ),
  }
);

export default function WalletPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [policy, setPolicy] = useState(DEFAULT_AGENT_POLICY);
  const [testPrice, setTestPrice] = useState(0.05);

  const evaluation = evaluateSpendingPolicy(testPrice, 5.00, 'CodeShield', policy);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="Wallet & Spending Policy"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Client-only dynamic wallet content */}
          <WalletClientContent remainingDailyBudget={evaluation.remainingDailyBudget} />

          {/* Policy Controls & Evaluator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Spending Policy Controls */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Agent Spending Limits</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">
                    Maximum Per Transaction (USDC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={policy.maxPerTransactionUsdc}
                    onChange={(e) => setPolicy({ ...policy, maxPerTransactionUsdc: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">
                    Daily Spending Limit (USDC)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={policy.dailySpendingLimitUsdc}
                    onChange={(e) => setPolicy({ ...policy, dailySpendingLimitUsdc: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Approved Service Providers */}
                <div>
                  <label className="text-slate-400 font-medium block mb-2">Approved Service Providers</label>
                  <div className="space-y-2">
                    {policy.approvedProviders.map((prov, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="font-mono text-slate-200 flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{prov}</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          APPROVED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Policy Decision Evaluator */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Live Policy Evaluator Test</h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Test Audit Price:</span>
                  <span className="font-mono font-bold text-emerald-400">${testPrice.toFixed(2)} USDC</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Balance Available ($5.00 USDC)</span>
                    <span className={evaluation.checks.balanceSufficient ? 'text-emerald-400' : 'text-rose-400'}>
                      {evaluation.checks.balanceSufficient ? 'PASS ✓' : 'FAIL ✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Max Per Transaction (${policy.maxPerTransactionUsdc} USDC)</span>
                    <span className={evaluation.checks.belowMaxPerTx ? 'text-emerald-400' : 'text-rose-400'}>
                      {evaluation.checks.belowMaxPerTx ? 'PASS ✓' : 'FAIL ✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Daily Limit (${evaluation.remainingDailyBudget.toFixed(2)} USDC Left)</span>
                    <span className={evaluation.checks.belowDailyLimit ? 'text-emerald-400' : 'text-rose-400'}>
                      {evaluation.checks.belowDailyLimit ? 'PASS ✓' : 'FAIL ✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Provider Trusted (CodeShield)</span>
                    <span className={evaluation.checks.providerTrusted ? 'text-emerald-400' : 'text-rose-400'}>
                      {evaluation.checks.providerTrusted ? 'PASS ✓' : 'FAIL ✗'}
                    </span>
                  </div>
                </div>

                {/* Final Decision Box */}
                <div className={`p-3.5 rounded-xl border text-center font-mono font-bold ${
                  evaluation.allowed
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}>
                  <div className="text-[10px] uppercase opacity-70">Policy Decision</div>
                  <div className="text-sm mt-0.5">{evaluation.reason}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
