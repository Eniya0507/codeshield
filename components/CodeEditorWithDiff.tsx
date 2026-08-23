'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, ArrowLeftRight, CheckCircle } from 'lucide-react';

interface CodeEditorProps {
  originalCode: string;
  fixedCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
}

export const CodeEditorWithDiff: React.FC<CodeEditorProps> = ({
  originalCode,
  fixedCode,
  language = 'solidity',
  onCodeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'generated' | 'fixed' | 'diff'>('generated');
  const [copied, setCopied] = useState(false);

  const displayCode = activeTab === 'fixed' && fixedCode ? fixedCode : originalCode;
  const lineCount = Math.max(1, displayCode.split('\n').length);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const origLines = originalCode.split('\n');
  const fixLines = (fixedCode || '').split('\n');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full backdrop-blur-sm">
      {/* Editor Header Toolbar */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        {/* Code Tabs */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('generated')}
            className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-all flex items-center space-x-1.5 ${
              activeTab === 'generated'
                ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generated Code</span>
          </button>

          {fixedCode && (
            <button
              onClick={() => setActiveTab('fixed')}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-all flex items-center space-x-1.5 ${
                activeTab === 'fixed'
                  ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fixed Code</span>
            </button>
          )}

          {fixedCode && (
            <button
              onClick={() => setActiveTab('diff')}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-all flex items-center space-x-1.5 ${
                activeTab === 'diff'
                  ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Side-by-Side Diff</span>
            </button>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1 font-mono"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Editor Body */}
      {activeTab !== 'diff' ? (
        <div className="relative flex-1 bg-slate-950 font-mono text-xs overflow-hidden flex min-h-[380px]">
          {/* Line Numbers */}
          <div className="py-4 px-3 text-slate-600 bg-slate-950/90 select-none text-right border-r border-slate-900 min-w-[3.2rem]">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="leading-relaxed">{i + 1}</div>
            ))}
          </div>

          {/* Textarea Code Body */}
          <textarea
            value={displayCode}
            onChange={(e) => onCodeChange && onCodeChange(e.target.value)}
            className="w-full h-full py-4 px-4 bg-transparent text-emerald-300 placeholder-slate-600 resize-none focus:outline-none leading-relaxed font-mono overflow-auto"
            spellCheck={false}
          />
        </div>
      ) : (
        /* Side-by-Side Diff View */
        <div className="grid grid-cols-2 flex-1 bg-slate-950 font-mono text-xs divide-x divide-slate-800 overflow-auto min-h-[380px]">
          {/* Left: Original Code */}
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-bold font-mono text-rose-400 bg-rose-950/60 p-1.5 rounded border border-rose-900/60 mb-2">
              ORIGINAL VULNERABLE CODE
            </div>
            {origLines.map((line, idx) => {
              const isVulnLine = line.includes('msg.sender.call') || line.includes('tx.origin');
              return (
                <div
                  key={idx}
                  className={`leading-relaxed px-1 font-mono ${
                    isVulnLine ? 'bg-rose-950/80 text-rose-300 font-bold border-l-2 border-rose-500' : 'text-slate-400'
                  }`}
                >
                  <span className="text-slate-600 select-none mr-3">{idx + 1}</span>
                  {line}
                </div>
              );
            })}
          </div>

          {/* Right: Fixed Code */}
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-bold font-mono text-emerald-400 bg-emerald-950/60 p-1.5 rounded border border-emerald-900/60 mb-2">
              SECURE FIXED CODE (CLAUDE AI PATCH)
            </div>
            {fixLines.map((line, idx) => {
              const isFixedLine = line.includes('ReentrancyGuard') || line.includes('nonReentrant') || line.includes('msg.sender == owner');
              return (
                <div
                  key={idx}
                  className={`leading-relaxed px-1 font-mono ${
                    isFixedLine ? 'bg-emerald-950/80 text-emerald-300 font-bold border-l-2 border-emerald-500' : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 select-none mr-3">{idx + 1}</span>
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
