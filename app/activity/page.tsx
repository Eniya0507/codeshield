'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LivePaymentTrace } from '@/components/LivePaymentTrace';
import { dbStore } from '@/lib/store/db';

export default function ActivityPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const events = dbStore.getActivityEvents();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title="Live Agent Activity"
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <LivePaymentTrace events={events} />
        </main>
      </div>
    </div>
  );
}
