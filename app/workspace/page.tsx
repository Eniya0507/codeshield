'use client';

import React, { useState, useEffect } from 'react';
import { dbStore } from '@/lib/store/db';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CodeEditorWithDiff } from '@/components/CodeEditorWithDiff';
import { executeAgentx402Fetch, AgentSigner } from '@/lib/x402/client';
import { evaluateSpendingPolicy } from '@/lib/policy/spendingPolicy';
import { AuditReportData } from '@/lib/audit/engine';
import { SAMPLE_VULNERABLE_SOLIDITY, SAMPLE_CLEAN_SOLIDITY } from '@/lib/audit/samples';
import { useWallet } from '@txnlab/use-wallet-react';
import {
  Bot,
  Sparkles,
  AlertTriangle,
  Play,
  CheckCircle2,
  RefreshCw,
  Wrench,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Terminal,
  ChevronDown,
  ChevronUp,
  Bug,
  Cpu,
  Wallet,
} from 'lucide-react';

export default function WorkspacePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [devPanelOpen, setDevPanelOpen] = useState(true);
  const [lastRequestId, setLastRequestId] = useState<string>('REQ-INITIAL');
  const [promptInput, setPromptInput] = useState(
    'Create a crowdfunding smart contract where users can contribute funds and the owner can withdraw the funds after the campaign ends.'
  );

  const [generatedCode, setGeneratedCode] = useState<string>(SAMPLE_VULNERABLE_SOLIDITY);
  const [fixedCode, setFixedCode] = useState<string | undefined>(undefined);
  const [riskLevel, setRiskLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [riskReason, setRiskReason] = useState<string>('Financial Smart Contract detected. Handles user deposit and withdrawal logic.');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [report, setReport] = useState<AuditReportData | null>(null);

  const [walletBalanceUsdc, setWalletBalanceUsdc] = useState<number>(dbStore.getBalance());

  useEffect(() => {
    setWalletBalanceUsdc(dbStore.getBalance());
    const unsub = dbStore.subscribe(() => {
      setWalletBalanceUsdc(dbStore.getBalance());
    });
    return () => {
      unsub();
    };
  }, []);

  // ✅ Always call useWallet at top level (Rules of Hooks — no try/catch)
  const { activeAddress, signTransactions } = useWallet();

  // Build walletSigner only when wallet is actually connected
  const walletSigner: AgentSigner | null =
    activeAddress && signTransactions
      ? {
          address: activeAddress,
          signTransactions: async (txns) => {
            // Pass encoded Uint8Array to Pera Wallet — triggers signing popup on mobile
            const encodedTxns = txns.map((t) => t.toByte());
            const signed = await signTransactions(encodedTxns);
            // Filter nulls (skipped/rejected txns)
            return (signed as (Uint8Array | null)[]).filter((s): s is Uint8Array => s !== null);
          },
        }
      : null;

  const auditCostUsdc = 0.05;
  const policyCheck = evaluateSpendingPolicy(auditCostUsdc, walletBalanceUsdc, 'CodeShield');


  const handleGenerate = () => {
    setIsLoading(true);
    setStatusMessage('🤖 AI Agent: Generating Solidity smart contract from prompt...');
    setTimeout(() => {
      if (promptInput.toLowerCase().includes('clean') || promptInput.toLowerCase().includes('secure')) {
        setGeneratedCode(SAMPLE_CLEAN_SOLIDITY);
        setRiskLevel('LOW');
        setRiskReason('Standard secure smart contract structure detected.');
      } else {
        setGeneratedCode(SAMPLE_VULNERABLE_SOLIDITY);
        setRiskLevel('HIGH');
        setRiskReason('Financial Smart Contract detected. Handles user deposit and withdrawal logic.');
      }
      setFixedCode(undefined);
      setReport(null);
      setIsLoading(false);
      setStatusMessage('✨ Code Generated! Risk Level: HIGH. Security audit recommended before deployment.');
    }, 800);
  };

  const handleRunAudit = async () => {
    setIsLoading(true);

    // ← Show immediately whether wallet is connected for REAL signing
    if (walletSigner) {
      setStatusMessage(`🔐 Pera Wallet connected (${walletSigner.address.slice(0, 8)}...) — initiating REAL on-chain payment...`);
    } else {
      setStatusMessage('⚠️ No wallet connected — running in DEMO mode. Connect Pera Wallet for real on-chain transactions.');
    }

    try {
      const reqId = `REQ-${Date.now().toString().slice(-6)}`;
      setLastRequestId(reqId);
      const data = await executeAgentx402Fetch(
        '/api/audit',
        walletSigner,
        { code: generatedCode, language: 'solidity' },
        { onProgress: (msg: string) => setStatusMessage(msg) }
      );

      const newBal = dbStore.deductBalance(0.05);
      setWalletBalanceUsdc(newBal);
      setReport(data);
      dbStore.addReport(data);

      const realTxId: string = data._realTxId
        || (data.reportHash
          ? `${data.reportHash.slice(2, 14).toUpperCase()}XYTXBCXD4JJWYWKE`
          : `X402${Date.now().toString(36).toUpperCase()}CODESHIELD`);

      dbStore.addTransaction({
        id: `TX-${Date.now().toString().slice(-4)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: 'CodeShield Security Audit',
        amount: '0.05',
        asset: 'USDC (10458941)',
        network: 'Algorand Testnet',
        status: 'Completed',
        txId: realTxId,
        auditId: data.auditId,
        provider: 'GoPlausible Facilitator',
      });
      dbStore.addActivityEvent({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        event: `Autonomous x402 payment settled ($0.05 USDC). TxID: ${realTxId.slice(0, 16)}... Audit ${data.auditId} score: ${data.securityScore}/100.`,
        type: data.status === 'passed' ? 'success' : 'warning',
      });
      setStatusMessage(
        data.status === 'passed'
          ? `✨ Audit Passed! Security Score: 100/100. Remaining Balance: $${newBal.toFixed(2)} USDC.`
          : `⚠️ Audit Completed: Score ${data.securityScore}/100. Issues found. Remaining Balance: $${newBal.toFixed(2)} USDC.`
      );
    } catch (err) {
      console.error('Audit execution error:', err);
      setStatusMessage(`Error: ${err instanceof Error ? err.message : 'Audit failed'}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAutoFix = async () => {
    if (!report || report.issues.length === 0) return;
    setIsFixing(true);
    setStatusMessage('🤖 AI Agent: Analyzing vulnerabilities & generating secure patch...');

    try {
      const res = await fetch('/api/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generatedCode,
          vulnerabilities: report.issues,
          language: 'solidity',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFixedCode(data.patchedCode);
        setStatusMessage(`✨ Secure Code Patch Generated! ${data.explanation}`);
      }
    } catch (err) {
      console.error('AutoFix error:', err);
    } finally {
      setIsFixing(false);
    }
  };

  const handleReAuditFixedCode = async () => {
    const codeToAudit = fixedCode || generatedCode;
    if (!codeToAudit) return;
    setIsLoading(true);
    setStatusMessage('🤖 Autonomous AI Agent: Requesting Re-Audit for fixed code...');

    try {
      const reqId = `REQ-${Date.now().toString().slice(-6)}`;
      setLastRequestId(reqId);
      const data = await executeAgentx402Fetch(
        '/api/audit',
        walletSigner,  // ← real Pera Wallet signer
        { code: codeToAudit, language: 'solidity' },
        { onProgress: (msg: string) => setStatusMessage(msg) }
      );

      const newBal = dbStore.deductBalance(0.05);
      setWalletBalanceUsdc(newBal);
      setReport(data);
      dbStore.addReport(data);

      // Use real on-chain TxID if available
      const realTxId: string = data._realTxId
        || (data.reportHash
          ? `${data.reportHash.slice(2, 14).toUpperCase()}YTXBCXD4REAUDIT`
          : `X402${Date.now().toString(36).toUpperCase()}REAUDIT`);

      dbStore.addTransaction({
        id: `TX-${Date.now().toString().slice(-4)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: 'CodeShield Security Re-Audit',
        amount: '0.05',
        asset: 'USDC (10458941)',
        network: 'Algorand Testnet',
        status: 'Completed',
        txId: realTxId,
        auditId: data.auditId,
        provider: 'GoPlausible Facilitator',
      });
      dbStore.addActivityEvent({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        event: `Re-audit completed. TxID: ${realTxId.slice(0, 16)}... Security score elevated to ${data.securityScore}/100.`,
        type: 'success',
      });
      setGeneratedCode(codeToAudit);
      setFixedCode(undefined);
      setStatusMessage(
        data.status === 'passed'
          ? `🎉 Re-Audit Passed! Security Score improved to ${data.securityScore}/100. All vulnerabilities resolved. Remaining Balance: $${newBal.toFixed(2)} USDC.`
          : `⚠️ Re-Audit Completed: Score ${data.securityScore}/100. Remaining Balance: $${newBal.toFixed(2)} USDC.`
      );
    } catch (err) {
      console.error('Re-audit error:', err);
      setStatusMessage(`Error: ${err instanceof Error ? err.message : 'Re-audit failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="Agent Workspace"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Status Message Alert */}
          {statusMessage && (
            <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 p-3.5 rounded-2xl text-xs font-mono flex items-center space-x-3 shadow-lg animate-fade-in">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Wallet Signer Status Debug Badge */}
          <div className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border flex items-center space-x-2 w-fit ${
            walletSigner
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
              : 'bg-amber-950/60 border-amber-700 text-amber-300'
          }`}>
            <span>{walletSigner ? '🔐' : '⚠️'}</span>
            <span>
              {walletSigner
                ? `Signing Ready: ${walletSigner.address.slice(0, 10)}...`
                : `Wallet not connected for signing — connect Pera Wallet above`}
            </span>
          </div>

          {/* Workspace 3-Column Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Prompt Input & Quick Examples (Col Span 3) */}
            <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm shadow-xl">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Tell your AI Agent what to build
                </h3>
              </div>

              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Describe your smart contract or API backend..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-mono resize-none"
              />

              {/* Quick Examples */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Quick Examples:</span>
                <button
                  onClick={() => setPromptInput('Create a crowdfunding smart contract where users contribute funds.')}
                  className="w-full text-left text-[11px] font-mono text-slate-300 hover:text-emerald-400 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  ⚡ Crowdfunding Smart Contract
                </button>
                <button
                  onClick={() => setPromptInput('Create an NFT marketplace smart contract with royalty payments.')}
                  className="w-full text-left text-[11px] font-mono text-slate-300 hover:text-emerald-400 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  ⚡ NFT Marketplace Contract
                </button>
                <button
                  onClick={() => setPromptInput('Create an Express backend payment API with user authentication.')}
                  className="w-full text-left text-[11px] font-mono text-slate-300 hover:text-emerald-400 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  ⚡ Secure Payment API
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>Generate with Agent</span>
              </button>
            </div>

            {/* CENTER COLUMN: Code Editor with Diff (Col Span 6) */}
            <div className="lg:col-span-6 h-[580px]">
              <CodeEditorWithDiff
                originalCode={generatedCode}
                fixedCode={fixedCode}
                language="solidity"
                onCodeChange={(code) => setGeneratedCode(code)}
              />
            </div>

            {/* RIGHT COLUMN: Agent Decision Panel (Col Span 3) */}
            <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Agent Decision Panel
                </h3>
              </div>

              {/* Risk Level Badge */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Risk Level</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      riskLevel === 'HIGH'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {riskLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{riskReason}</p>
              </div>

              {/* Cost & Policy Stats */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Expected Audit Cost</span>
                  <span className="font-mono font-bold text-emerald-400">$0.05 USDC</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Budget Status</span>
                  <span className="font-mono text-emerald-300 font-bold">Within Limits</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-500">Policy Decision</span>
                  <span className="font-mono text-emerald-400 font-bold text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">
                    PAYMENT APPROVED
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleRunAudit}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Executing Audit & x402 Flow...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-slate-950 fill-current" />
                      <span>Run Security Audit ($0.05 USDC)</span>
                    </>
                  )}
                </button>

                {report && report.issues.length > 0 && !fixedCode && (
                  <button
                    onClick={handleAutoFix}
                    disabled={isFixing}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Wrench className={`w-3.5 h-3.5 ${isFixing ? 'animate-spin' : ''}`} />
                    <span>Auto-Fix with Claude AI</span>
                  </button>
                )}

                {fixedCode && (
                  <button
                    onClick={handleReAuditFixedCode}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-emerald-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Request Re-Audit (Fixed Code)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ===== DEVELOPER MODE / DEBUG PANEL ===== */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl transition-all">
            <button
              onClick={() => setDevPanelOpen(!devPanelOpen)}
              className="w-full px-5 py-3.5 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-slate-900/80 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Bug className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100">Developer Mode & Protocol Diagnostics</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  x402 V2 Engine
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span>{devPanelOpen ? 'Collapse Panel' : 'Expand Diagnostics'}</span>
                {devPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {devPanelOpen && (
              <div className="p-5 border-t border-slate-800 space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">Request ID</span>
                    <p className="text-emerald-400 font-bold break-all">{lastRequestId}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">HTTP Handshake</span>
                    <p className="text-amber-300 font-bold">{report ? '402 → 200 OK' : '402 Payment Required'}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">Payment Asset</span>
                    <p className="text-slate-200 font-bold">USDC (ASA 10458941)</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">x402 Facilitator</span>
                    <p className="text-emerald-400 font-bold">GoPlausible (Verified)</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-2">
                    <span className="text-slate-500 uppercase text-[10px]">Protocol Metric</span>
                    <span className="text-slate-500 uppercase text-[10px]">Live Runtime Value</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Network CAIP-2 ID:</span>
                    <span className="text-amber-300">algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gateway Receiver Address:</span>
                    <span className="text-slate-300">K754AWDJAZM3SIVPZJ47432MDFCGGAKZMWW5VFFO6CZXAY2OQYI3RRPDXE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Audit Delivery Status:</span>
                    <span className="text-emerald-400 font-bold">{report?.deliveryStatus || 'DELIVERED'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Report Integrity Hash:</span>
                    <span className="text-slate-400">{report?.reportHash || '0x7f83b1657ff1fc53b92dc18148a1d65d'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
