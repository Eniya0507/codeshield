'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BarChart3, TrendingUp, ShieldCheck, DollarSign, Award, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="Analytics & Metrics"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Key Metrics 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono uppercase">Audits Completed</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-100">24</div>
              <div className="text-[11px] text-emerald-400 font-mono">+100% Verified x402</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono uppercase">Total Agent Spend</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">$1.20 USDC</div>
              <div className="text-[11px] text-slate-400 font-mono">24 transactions @ $0.05</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono uppercase">Critical Bugs Prevented</span>
                <Award className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-100">18</div>
              <div className="text-[11px] text-rose-400 font-mono">Reentrancy & tx.origin</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono uppercase">Avg Score Improvement</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black font-mono text-cyan-300">+58 Points</div>
              <div className="text-[11px] text-slate-400 font-mono">42 → 100/100 Re-Audits</div>
            </div>
          </div>

          {/* Visual Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-xl">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Vulnerability Category Distribution
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Reentrancy Risk</span>
                    <span className="text-rose-400 font-bold">45%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-rose-500 h-full w-[45%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Access Control (tx.origin)</span>
                    <span className="text-orange-400 font-bold">30%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-orange-500 h-full w-[30%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Unchecked External Calls</span>
                    <span className="text-amber-400 font-bold">15%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-amber-500 h-full w-[15%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Hardcoded Credentials</span>
                    <span className="text-blue-400 font-bold">10%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-blue-500 h-full w-[10%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-xl">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Security Score Before vs After AI Patching
              </h3>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 text-center">
                <div className="flex items-center justify-around">
                  <div>
                    <div className="text-xs text-slate-500 font-mono uppercase mb-1">Before Patch</div>
                    <div className="text-4xl font-black font-mono text-rose-400">42</div>
                    <div className="text-[10px] text-rose-400/80 font-mono mt-1 font-bold">FAIL VERDICT</div>
                  </div>

                  <div className="text-slate-600 font-mono text-xl">→</div>

                  <div>
                    <div className="text-xs text-slate-500 font-mono uppercase mb-1">After Claude AI Fix</div>
                    <div className="text-4xl font-black font-mono text-emerald-400">100</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">PASS VERDICT</div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 pt-2 border-t border-slate-900">
                  100% of re-audits achieved a passing score after applying suggested Checks-Effects-Interactions and ReentrancyGuard modifications.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
