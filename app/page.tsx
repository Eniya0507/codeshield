'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  DollarSign,
  CheckCircle2,
  FileCode2,
  Lock,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Global Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="Overview"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
            {/* Background Radial Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-3xl space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Agent-Native x402 Security Infrastructure · Algorand Testnet</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100 leading-tight">
                Secure Autonomous Code <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Before It Deploys.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                CodeShield gives AI coding agents on-demand smart contract security audits through x402-powered, pay-per-use payment infrastructure settled on Algorand.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/workspace"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2 active:scale-95"
                >
                  <Bot className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Launch Agent Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/audit"
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm px-5 py-3 rounded-xl transition-all flex items-center space-x-2 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Explore API</span>
                </Link>
              </div>
            </div>

            {/* Architecture Visualization Flow Diagram */}
            <div className="mt-12 pt-8 border-t border-slate-800/80">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase mb-4 tracking-wider">
                Autonomous x402 Architecture Workflow
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { step: '1. AI Agent', desc: 'Generates code & detects risk', icon: Bot, color: 'text-cyan-400 border-cyan-500/30' },
                  { step: '2. HTTP 402', desc: 'Server issues payment challenge', icon: Lock, color: 'text-amber-400 border-amber-500/30' },
                  { step: '3. x402 Signer', desc: 'Auto-signs $0.05 USDC txn', icon: DollarSign, color: 'text-emerald-400 border-emerald-500/30' },
                  { step: '4. Algorand', desc: 'GoPlausible settles on-chain', icon: Zap, color: 'text-amber-400 border-amber-500/30' },
                  { step: '5. Audit Engine', desc: 'Static rules + Claude AI review', icon: Search, color: 'text-teal-400 border-teal-500/30' },
                  { step: '6. Security Report', desc: 'JSON report & 1-click fix', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/30' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl bg-slate-950/80 border ${item.color} space-y-2 text-left`}
                    >
                      <Icon className="w-4 h-4" />
                      <div className="text-xs font-bold text-slate-200">{item.step}</div>
                      <div className="text-[10px] text-slate-500 font-mono leading-tight">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-sm shadow-xl hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">1. Agent-Native Payments</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-click micro-payments powered by x402 headers. AI agents pay per audit without human accounts or API subscriptions.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-sm shadow-xl hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">2. Autonomous Security Audits</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rule-based static analysis & Claude AI vulnerability reasoning detect reentrancy, access control, and injection bugs.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-sm shadow-xl hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">3. Policy-Controlled Spending</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enforce strict per-transaction and daily spending limits so agents never exceed authorized budget thresholds.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
