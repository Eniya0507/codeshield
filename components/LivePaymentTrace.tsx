'use client';

import React from 'react';
import { ActivityTraceEvent } from '@/lib/store/db';
import { CheckCircle2, AlertTriangle, Lock, DollarSign, ExternalLink, Bot, Zap, Clock } from 'lucide-react';

interface LivePaymentTraceProps {
  events: ActivityTraceEvent[];
}

export const LivePaymentTrace: React.FC<LivePaymentTraceProps> = ({ events }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Agent Activity & Payment Trace</h3>
            <p className="text-xs text-slate-400">Real-time x402 protocol lifecycle & Algorand settlement events</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE TRACE LOG
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3 pt-1 font-mono text-xs">
        {events.map((evt) => {
          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          let icon = <Bot className="w-3.5 h-3.5 text-slate-400" />;

          if (evt.type === 'payment') {
            badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-800';
            icon = <DollarSign className="w-3.5 h-3.5 text-amber-400" />;
          } else if (evt.type === 'success') {
            badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
          } else if (evt.type === 'warning') {
            badgeColor = 'bg-orange-950/80 text-orange-300 border-orange-800';
            icon = <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
          } else if (evt.type === 'error') {
            badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-800';
            icon = <Lock className="w-3.5 h-3.5 text-rose-400" />;
          }

          return (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${badgeColor}`}
            >
              <div className="flex items-start space-x-2.5">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-400">{evt.timestamp}</span>
                    <span className="text-slate-200 font-semibold">{evt.event}</span>
                  </div>
                  {evt.txId && (
                    <div className="mt-1 flex items-center space-x-1 text-[10px]">
                      <span className="text-slate-500">Transaction ID:</span>
                      <a
                        href={`https://lora.algokit.io/testnet/transaction/${evt.txId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>{evt.txId}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[9px] uppercase tracking-wider font-bold opacity-60 shrink-0">
                {evt.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
