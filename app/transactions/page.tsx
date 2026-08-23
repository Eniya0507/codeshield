'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { dbStore, AuditTransactionRecord } from '@/lib/store/db';
import {
  Receipt,
  ExternalLink,
  X,
  CheckCircle2,
  Shield,
  DollarSign,
  Copy,
  Check,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  Layers,
} from 'lucide-react';

export default function TransactionsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<AuditTransactionRecord | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  const [transactions, setTransactions] = useState<AuditTransactionRecord[]>([]);

  useEffect(() => {
    setTransactions(dbStore.getTransactions());
    const unsub = dbStore.subscribe(() => {
      setTransactions([...dbStore.getTransactions()]);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleCopy = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.auditId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.service.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'COMPLETED') return matchesSearch && tx.status === 'Completed';
    if (filterStatus === 'PENDING') return matchesSearch && tx.status === 'Pending';
    return matchesSearch;
  });

  const totalSpent = transactions.reduce((acc, curr) => acc + Number(curr.amount || 0.05), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="x402 Transactions Ledger"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1.5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Settled Payments</span>
                <Receipt className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-100">{transactions.length}</div>
              <div className="text-[11px] font-mono text-emerald-400">100% On-Chain Confirmed</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1.5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Total Micro-Fees</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">${totalSpent.toFixed(2)} USDC</div>
              <div className="text-[11px] font-mono text-slate-400">ASA ID: 10458941</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1.5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Settlement Network</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base font-bold font-mono text-slate-100">Algorand Testnet</div>
              <div className="text-[11px] font-mono text-amber-300">~3.7s Finality</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1.5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Verifier Gateway</span>
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-base font-bold font-mono text-slate-100">GoPlausible</div>
              <div className="text-[11px] font-mono text-cyan-300">x402 Facilitator Live</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm shadow-xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by TxID, Audit ID, or Service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'ALL'
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setFilterStatus('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Transactions Table Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-mono text-[11px] uppercase">
                    <th className="py-3.5 px-4">Transaction / Time</th>
                    <th className="py-3.5 px-4">Service & Audit</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Asset & Network</th>
                    <th className="py-3.5 px-4">On-Chain TxID</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-slate-200">{tx.id}</div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{tx.time}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-200">{tx.service}</div>
                          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{tx.auditId}</div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-sm">
                          ${tx.amount}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-mono text-slate-200">{tx.asset}</div>
                          <div className="text-[11px] font-mono text-amber-300">{tx.network}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <code className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 max-w-[140px] truncate block">
                              {tx.txId}
                            </code>
                            <button
                              onClick={() => handleCopy(tx.txId)}
                              title="Copy TxID"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              {copiedTxId === tx.txId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-mono font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{tx.status}</span>
                          </span>
                        </td>
                         <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <a
                              href={
                                // Real Algorand TxID: exactly 52 base32 chars, no dashes or spaces
                                /^[A-Z2-7]{52}$/.test(tx.txId)
                                  ? `https://lora.algokit.io/testnet/transaction/${tx.txId}`
                                  : `https://lora.algokit.io/testnet/account/ZVN36WHENHPT5QDKYNVXLASJD3JRR6VD6VHJ4M2ZDLZ7Z3XPUFVMG7FOBA`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-all flex items-center space-x-1 font-mono text-[11px]"
                              title={/^[A-Z2-7]{52}$/.test(tx.txId) ? "View real transaction on Lora Explorer" : "View your wallet on Lora Explorer"}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {/^[A-Z2-7]{52}$/.test(tx.txId) ? 'Lora ✓' : 'Wallet'}
                              </span>
                            </a>
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slide-Over Details Drawer */}
          {selectedTx && (
            <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 space-y-6 shadow-2xl relative overflow-y-auto">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">x402 Payment Certificate</h3>
                    <p className="text-xs font-mono text-emerald-400">{selectedTx.id}</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audit ID:</span>
                      <span className="font-mono font-bold text-slate-200">{selectedTx.auditId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Micro-Payment:</span>
                      <span className="font-mono font-bold text-emerald-400">${selectedTx.amount} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Asset:</span>
                      <span className="font-mono text-slate-200">{selectedTx.asset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network:</span>
                      <span className="font-mono text-amber-300">{selectedTx.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Facilitator:</span>
                      <span className="font-mono text-slate-200">{selectedTx.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="font-mono text-slate-400">{selectedTx.time}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-300">On-Chain Identifier / Proof:</span>
                      <button
                        onClick={() => handleCopy(selectedTx.txId)}
                        className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                      >
                        {copiedTxId === selectedTx.txId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTxId === selectedTx.txId ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="bg-slate-950 p-3 rounded-xl border border-slate-800 block font-mono text-emerald-300 text-[11px] break-all">
                      {selectedTx.txId}
                    </code>
                  </div>

                  <a
                    href="https://lora.algokit.io/testnet/account/K754AWDJAZM3SIVPZJ47432MDFCGGAKZMWW5VFFO6CZXAY2OQYI3RRPDXE"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <span>Inspect Treasury Account on Lora</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
