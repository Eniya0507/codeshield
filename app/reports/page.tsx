'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { dbStore } from '@/lib/store/db';
import { AuditReportData } from '@/lib/audit/engine';
import {
  FileText,
  Search,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Download,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
} from 'lucide-react';

const SEED_ARCHIVE: AuditReportData[] = [
  {
    auditId: 'AUD-98241',
    status: 'issues_found',
    securityScore: 42,
    summary: 'Crowdfunding Vault Contract: Critical access control and reentrancy issue detected.',
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
    reportHash: '0x8f92a10b42c9481b',
    disclaimer: 'AI-assisted automated security analysis. Not a substitute for professional security review.',
    paidVia: 'x402 / USDC Algorand Testnet (GoPlausible Facilitator Verified)',
    timestamp: 'Today, 10:32',
    deliveryStatus: 'DELIVERED',
  },
  {
    auditId: 'AUD-98240',
    status: 'passed',
    securityScore: 94,
    summary: 'NFT Royalty Marketplace: Secure ERC-2981 royalty standard implementation verified.',
    issues: [],
    gasOptimizations: ['Use custom errors instead of string reverts'],
    reportHash: '0x7e44b91f00a29481',
    disclaimer: 'AI-assisted automated security analysis.',
    paidVia: 'x402 / USDC Algorand Testnet (GoPlausible Facilitator Verified)',
    timestamp: 'Yesterday, 18:15',
    deliveryStatus: 'DELIVERED',
  },
  {
    auditId: 'AUD-98239',
    status: 'passed',
    securityScore: 100,
    summary: 'Staking Rewards Pool: 100% test coverage with ReentrancyGuard and SafeERC20.',
    issues: [],
    gasOptimizations: ['Store reward rates in immutable packed slots'],
    reportHash: '0x9d11e55aa1b94812',
    disclaimer: 'AI-assisted automated security analysis.',
    paidVia: 'x402 / USDC Algorand Testnet (GoPlausible Facilitator Verified)',
    timestamp: '2 days ago',
    deliveryStatus: 'DELIVERED',
  },
];

export default function ReportsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportsList, setReportsList] = useState<AuditReportData[]>(SEED_ARCHIVE);
  const [selectedReport, setSelectedReport] = useState<AuditReportData | null>(null);

  useEffect(() => {
    const liveReports = dbStore.getReports();
    if (liveReports && liveReports.length > 0) {
      // Merge live reports with seed archive avoiding duplicate audit IDs
      const merged = [...liveReports];
      SEED_ARCHIVE.forEach((seed) => {
        if (!merged.some((m) => m.auditId === seed.auditId)) {
          merged.push(seed);
        }
      });
      setReportsList(merged);
    } else {
      setReportsList(SEED_ARCHIVE);
    }

    const unsub = dbStore.subscribe(() => {
      const updated = dbStore.getReports();
      const merged = [...updated];
      SEED_ARCHIVE.forEach((seed) => {
        if (!merged.some((m) => m.auditId === seed.auditId)) {
          merged.push(seed);
        }
      });
      setReportsList(merged);
    });

    return () => {
      unsub();
    };
  }, []);

  const filteredReports = reportsList.filter((rep) => {
    return (
      rep.auditId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.reportHash.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="Security Reports Archive"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search report ID, contract, or hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  Total Reports: <span className="font-bold text-emerald-400">{filteredReports.length}</span>
                </span>
                <Link
                  href="/workspace"
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all"
                >
                  + Run New Audit
                </Link>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {filteredReports.map((rep) => {
                const isPassed = rep.status === 'passed' || rep.securityScore >= 80;
                return (
                  <div
                    key={rep.auditId}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all shadow-md flex-wrap sm:flex-nowrap"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-sm shrink-0 border ${
                          isPassed
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : 'bg-rose-950/80 text-rose-400 border-rose-800'
                        }`}
                      >
                        <span>{rep.securityScore}</span>
                        <span className="text-[8px] opacity-70">/100</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                          <span>
                            {rep.summary.includes(':') ? rep.summary.split(':')[0] : 'Smart Contract Audit'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                            {rep.auditId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3 font-mono">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{rep.timestamp.includes('T') ? rep.timestamp.split('T')[0] : rep.timestamp}</span>
                          </span>
                          <span>•</span>
                          <span className={rep.issues.length > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {rep.issues.length} {rep.issues.length === 1 ? 'Vulnerability' : 'Vulnerabilities'}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500 truncate max-w-[120px]">{rep.reportHash}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="text-xs px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold flex items-center space-x-1.5 transition-colors font-mono"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Certificate</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Modal Drawer */}
          {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      selectedReport.securityScore >= 80
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {selectedReport.securityScore >= 80 ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Security Certificate #{selectedReport.auditId}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedReport.paidVia}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase block">Security Score</span>
                    <span
                      className={`text-xl font-bold ${
                        selectedReport.securityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {selectedReport.securityScore} / 100
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase block">Verdict</span>
                    <span
                      className={`text-base font-bold uppercase ${
                        selectedReport.securityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {selectedReport.status === 'passed' ? 'PASSED' : 'ISSUES FOUND'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase block">Integrity Hash</span>
                    <span className="text-xs text-slate-300 font-mono truncate block mt-1">
                      {selectedReport.reportHash}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-200">Summary:</h4>
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    {selectedReport.summary}
                  </p>
                </div>

                {selectedReport.issues.length > 0 && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-rose-400 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Identified Issues ({selectedReport.issues.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedReport.issues.map((iss) => (
                        <div key={iss.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                              {iss.severity}
                            </span>
                            <span className="font-bold text-slate-200">{iss.title}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{iss.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    href="/audit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-colors flex items-center space-x-1.5"
                  >
                    <span>Open in Full Viewer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
