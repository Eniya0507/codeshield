'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@txnlab/use-wallet-react';
import { Wallet, X, Bot, ExternalLink, Copy, Check } from 'lucide-react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
  const { wallets, activeAddress } = useWallet();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] w-screen h-screen bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative text-left"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Customer Wallet</h3>
              <p className="text-xs text-slate-400">Algorand Testnet Provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Connected Account with 1-Click Copy */}
        {activeAddress ? (
          <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-4 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>Connected Address ✓</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] flex items-center space-x-1 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-400" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://lora.algokit.io/testnet/account/${activeAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] hover:underline flex items-center gap-0.5 text-emerald-400"
                >
                  <span>Lora</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
            <p className="text-slate-300 break-all text-[11px] bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 select-all">
              {activeAddress}
            </p>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 text-center font-mono">
            No wallet connected. Select a provider below.
          </div>
        )}

        {/* Wallet Options List */}
        <div className="space-y-2.5">
          {wallets?.map((w) => {
            const isConnected = w.isConnected;
            return (
              <div
                key={w.id}
                className={`w-full p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                  isConnected
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {w.metadata?.icon ? (
                    <img src={w.metadata.icon} alt={w.metadata.name} className="w-6 h-6 rounded-lg" />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
                      ⚡
                    </div>
                  )}
                  <span className="text-sm font-semibold capitalize">{w.metadata?.name || w.id}</span>
                </div>

                <button
                  onClick={async () => {
                    try {
                      if (isConnected) {
                        await w.disconnect();
                      } else {
                        await w.connect();
                      }
                    } catch (err) {
                      console.info('Wallet interaction:', err);
                    }
                  }}
                  className={`font-mono text-[11px] px-3.5 py-1.5 rounded-xl transition-all ${
                    isConnected
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-800/80 text-xs">
          <span className="text-[11px] font-mono text-slate-500">
            USDC ASA ID: <span className="text-emerald-400 font-bold">10458941</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors"
          >
            Close ✕
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
