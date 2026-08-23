'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  Terminal,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Code2,
  Key,
} from 'lucide-react';

const SAMPLE_PAYLOAD = {
  language: 'solidity',
  code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vault {
    mapping(address => uint256) public balances;

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        balances[msg.sender] -= amount;
    }
}`,
};

export default function ApiExplorerPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [requestBody, setRequestBody] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [paymentHeader, setPaymentHeader] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleSendWithoutPayment = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      setResponseStatus(res.status);
      const headers: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headers[key] = val;
      });
      setResponseHeaders(headers);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (err) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err instanceof Error ? err.message : 'Request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWithPayment = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody('');

    const proof = paymentHeader.trim() || `X402-PROOF-AVM-${Date.now()}-SIMULATED`;

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Payment-Signature': proof,
          'X-Payment-Proof': proof,
          'Authorization': `Bearer ${proof}`,
        },
        body: requestBody,
      });

      setResponseStatus(res.status);
      const headers: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headers[key] = val;
      });
      setResponseHeaders(headers);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (err) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err instanceof Error ? err.message : 'Request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (responseBody) {
      navigator.clipboard.writeText(responseBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="API Explorer (x402 Testbed)"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono">
                  POST /api/audit
                </span>
                <span className="text-xs font-mono text-slate-400">Algorand x402 Protocol Gateway</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-100">Live x402 Protocol Tester</h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                Test the authentic HTTP 402 challenge flow. Sending a request without payment headers yields an RFC-compliant HTTP 402 challenge; sending with valid x402 payment verification unlocks HTTP 200 with structured audit reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendWithoutPayment}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>1. Send (No Payment) → 402</span>
              </button>
              <button
                onClick={handleSendWithPayment}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>2. Send (With Proof) → 200</span>
              </button>
            </div>
          </div>

          {/* Request / Response Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Request Configuration */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-sm shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Request Payload (JSON)</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Content-Type: application/json</span>
              </div>

              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 resize-y"
              />

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Payment-Signature Header (Optional Override)</span>
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for auto-generated testnet proof, or enter custom tx signature"
                  value={paymentHeader}
                  onChange={(e) => setPaymentHeader(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Right: Live Response */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-sm shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Gateway Response</h3>
                </div>
                {responseStatus !== null && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                      responseStatus === 200
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : responseStatus === 402
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    HTTP {responseStatus} {responseStatus === 402 ? 'Payment Required' : responseStatus === 200 ? 'OK' : ''}
                  </span>
                )}
              </div>

              {/* Response Headers Table */}
              {Object.keys(responseHeaders).length > 0 && (
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 space-y-1 font-mono text-[11px]">
                  <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Response Headers</div>
                  {responseHeaders['www-authenticate'] && (
                    <div className="text-amber-300">
                      <span className="text-slate-500">WWW-Authenticate: </span>
                      {responseHeaders['www-authenticate']}
                    </div>
                  )}
                  {responseHeaders['x-payment-required'] && (
                    <div className="text-emerald-400">
                      <span className="text-slate-500">X-Payment-Required: </span>
                      {responseHeaders['x-payment-required']}
                    </div>
                  )}
                  {responseHeaders['x-service-delivery'] && (
                    <div className="text-emerald-300">
                      <span className="text-slate-500">X-Service-Delivery: </span>
                      {responseHeaders['x-service-delivery']}
                    </div>
                  )}
                </div>
              )}

              {/* Response Body Output */}
              <div className="flex-1 relative">
                {responseBody ? (
                  <>
                    <button
                      onClick={copyResponse}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <pre className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-auto">
                      {responseBody}
                    </pre>
                  </>
                ) : (
                  <div className="w-full h-80 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2 p-6 text-center">
                    <Zap className="w-6 h-6 text-slate-600" />
                    <p>Click "Send (No Payment)" or "Send (With Proof)" above to trigger the live endpoint.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
