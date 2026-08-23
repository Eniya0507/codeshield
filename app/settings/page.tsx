'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Settings, Save, Zap, Server, Key, Check } from 'lucide-react';

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [saved, setSaved] = useState(false);

  const [algodServer, setAlgodServer] = useState('https://testnet-api.algonode.cloud');
  const [facilitatorUrl, setFacilitatorUrl] = useState('https://facilitator.goplausible.xyz');
  const [receiverAddress, setReceiverAddress] = useState('CXMND6NPMOCM7ZO2SJ3FM67AGU2XRJTFKXXICPYUUGUP6IDXMMWZF6ZWPU');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="System Settings"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-sm shadow-xl max-w-3xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <Settings className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Environment & Protocol Configuration</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Network Toggle */}
              <div>
                <label className="text-slate-400 font-medium block mb-2">Algorand Target Network</label>
                <div className="flex items-center space-x-3 font-mono">
                  <button
                    onClick={() => setNetwork('testnet')}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      network === 'testnet'
                        ? 'bg-amber-950 border-amber-800 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ⚡ Algorand Testnet
                  </button>
                  <button
                    onClick={() => setNetwork('mainnet')}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      network === 'mainnet'
                        ? 'bg-emerald-950 border-emerald-800 text-emerald-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🌐 Algorand Mainnet
                  </button>
                </div>
              </div>

              {/* Algod Node Server */}
              <div>
                <label className="text-slate-400 font-medium block mb-1.5">Algod Node REST Server</label>
                <input
                  type="text"
                  value={algodServer}
                  onChange={(e) => setAlgodServer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* GoPlausible Facilitator URL */}
              <div>
                <label className="text-slate-400 font-medium block mb-1.5">GoPlausible Facilitator URL</label>
                <input
                  type="text"
                  value={facilitatorUrl}
                  onChange={(e) => setFacilitatorUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* CodeShield Receiver Address */}
              <div>
                <label className="text-slate-400 font-medium block mb-1.5">CodeShield Treasury Receiver Address</label>
                <input
                  type="text"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center space-x-2 shadow-lg"
                >
                  {saved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
                  <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
