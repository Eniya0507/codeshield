'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AuditReportData } from '@/lib/audit/engine';
import { dbStore } from '@/lib/store/db';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Bot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SEED_REPORT: AuditReportData = {
  auditId: 'AUD-98241',
  status: 'issues_found',
  securityScore: 42,
  summary: 'Critical access control and reentrancy issue detected.',
  issues: [
    {
      id: 'VULN-001',
      severity: 'CRITICAL',
      category: 'Reentrancy Risk',
      line: 16,
      snippet: '(bool success, ) = msg.sender.call{value: amount}("");',
      title: 'Reentrancy Vulnerability in withdraw()',
      description: 'External call occurs before updating user balance mapping.',
      recommendation: 'Apply Checks-Effects-Interactions pattern by updating state variables before external call.',
    },
    {
      id: 'VULN-002',
      severity: 'HIGH',
      category: 'Access Control',
      line: 23,
      snippet: 'require(tx.origin == target, "Not authorized");',
      title: 'Unrestricted auth via tx.origin',
      description: 'tx.origin can be abused for phishing-based authorization attacks.',
      recommendation: 'Replace tx.origin with msg.sender.',
    },
  ],
  gasOptimizations: [
    'Use calldata instead of memory for read-only parameters',
    'Cache storage reads in stack memory',
  ],
  reportHash: '0x8f92a10b42c',
  disclaimer: 'AI-assisted automated security analysis. Not a substitute for professional security review.',
  paidVia: 'x402 / USDC Algorand Testnet (GoPlausible Facilitator Verified)',
  timestamp: new Date().toISOString(),
  deliveryStatus: 'DELIVERED',
};

export default function AuditPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>('VULN-001');
  const [report, setReport] = useState<AuditReportData>(SEED_REPORT);

  useEffect(() => {
    const latest = dbStore.getReports()[0];
    if (latest) {
      setReport(latest);
      if (latest.issues.length > 0) {
        setExpandedIssue(latest.issues[0].id);
      }
    }

    const unsub = dbStore.subscribe(() => {
      const updated = dbStore.getReports()[0];
      if (updated) {
        setReport(updated);
        if (updated.issues.length > 0) {
          setExpandedIssue(updated.issues[0].id);
        }
      }
    });
    return () => {
      unsub();
    };
  }, []);

  const criticalCount = report.issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = report.issues.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = report.issues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = report.issues.filter((i) => i.severity === 'LOW').length;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (report.securityScore / 100) * circumference;
  const isPassed = report.status === 'passed' || report.securityScore >= 80;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="CodeShield Security Command Center"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Status Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm shadow-xl">
            <div>
              <div className="flex items-center space-x-2">
                {isPassed ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                )}
                <h2 className="text-lg font-bold text-slate-100">Audit Report #{report.auditId}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">{report.disclaimer}</p>
            </div>

            {/* Status Chip */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  isPassed
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border-rose-800'
                }`}
              >
                {isPassed ? 'PASSED' : 'ISSUES FOUND'}
              </span>
            </div>
          </div>

          {/* Security Score & Severity Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Score Circle Gauge (Col Span 5) */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex items-center space-x-6 backdrop-blur-sm shadow-xl">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={isPassed ? '#10b981' : '#f43f5e'}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className={`text-3xl font-black font-mono ${
                      isPassed ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {report.securityScore}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">/ 100</span>
                </div>
              </div>

              <div>
                <div
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border inline-block mb-1 ${
                    isPassed
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                      : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                  }`}
                >
                  {isPassed ? 'LOW RISK LEVEL' : 'CRITICAL RISK LEVEL'}
                </div>
                <h3 className="text-sm font-bold text-slate-200">
                  {isPassed ? 'Contract Verified for Deployment' : 'Security Validation Required'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{report.summary}</p>
              </div>
            </div>

            {/* 4 Severity Cards (Col Span 7) - Dynamically calculated */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className={`p-4 rounded-2xl text-center flex flex-col justify-center border transition-all ${
                  criticalCount > 0
                    ? 'bg-rose-950/40 border-rose-800/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="text-xs font-mono font-bold text-rose-400 uppercase">Critical</div>
                <div className="text-2xl font-black font-mono text-slate-100 mt-1">{criticalCount}</div>
              </div>
              <div
                className={`p-4 rounded-2xl text-center flex flex-col justify-center border transition-all ${
                  highCount > 0
                    ? 'bg-orange-950/40 border-orange-800/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="text-xs font-mono font-bold text-orange-400 uppercase">High</div>
                <div className="text-2xl font-black font-mono text-slate-100 mt-1">{highCount}</div>
              </div>
              <div
                className={`p-4 rounded-2xl text-center flex flex-col justify-center border transition-all ${
                  mediumCount > 0
                    ? 'bg-amber-950/40 border-amber-800/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="text-xs font-mono font-bold text-amber-400 uppercase">Medium</div>
                <div className="text-2xl font-black font-mono text-slate-100 mt-1">{mediumCount}</div>
              </div>
              <div
                className={`p-4 rounded-2xl text-center flex flex-col justify-center border transition-all ${
                  lowCount > 0
                    ? 'bg-blue-950/40 border-blue-800/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="text-xs font-mono font-bold text-blue-400 uppercase">Low</div>
                <div className="text-2xl font-black font-mono text-slate-100 mt-1">{lowCount}</div>
              </div>
            </div>
          </div>

          {/* Issues List with Expandable Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Identified Vulnerabilities ({report.issues.length})</span>
            </h3>

            {report.issues.length === 0 ? (
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">Zero Security Vulnerabilities Detected</h4>
                <p className="text-xs text-slate-400">
                  This smart contract passes all checks for reentrancy, access control, low-level calls, and arithmetic bounds.
                </p>
              </div>
            ) : (
              report.issues.map((iss) => {
                const isExpanded = expandedIssue === iss.id;
                return (
                  <div
                    key={iss.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl"
                  >
                    <button
                      onClick={() => setExpandedIssue(isExpanded ? null : iss.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-850/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                            iss.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : iss.severity === 'HIGH'
                              ? 'bg-orange-950 text-orange-400 border-orange-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          {iss.severity}
                        </span>
                        <span className="font-mono text-xs text-slate-500">{iss.id}</span>
                        <span className="text-sm font-bold text-slate-100">{iss.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {iss.line && <span className="text-xs font-mono text-slate-500">Line {iss.line}</span>}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 space-y-4 text-xs">
                        <div>
                          <div className="font-bold text-slate-300 mb-1">Description:</div>
                          <p className="text-slate-400 leading-relaxed">{iss.description}</p>
                        </div>

                        {iss.snippet && (
                          <div>
                            <div className="font-bold text-slate-300 mb-1">Affected Code Snippet:</div>
                            <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-rose-300 overflow-x-auto">
                              <code>{iss.snippet}</code>
                            </pre>
                          </div>
                        )}

                        <div>
                          <div className="font-bold text-emerald-400 mb-1">Recommended Fix:</div>
                          <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                            {iss.recommendation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Gas Optimizations Card */}
          {report.gasOptimizations && report.gasOptimizations.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-sm shadow-xl">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span>Gas Optimizations & Best Practices</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                {report.gasOptimizations.map((opt, i) => (
                  <li key={i} className="flex items-start space-x-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold shrink-0">#{i + 1}</span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Audit Certificate Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm shadow-xl text-xs font-mono">
            <div className="space-y-1">
              <div className="text-slate-400">
                Settled Payment: <span className="text-emerald-300 font-semibold">{report.paidVia}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Report Integrity Hash: <span className="text-slate-300">{report.reportHash}</span>
              </div>
            </div>

            <Link
              href="/workspace"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>{isPassed ? 'Return to Workspace' : 'Ask Agent to Fix in Workspace'}</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
