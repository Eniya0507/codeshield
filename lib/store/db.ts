import { AuditReportData } from '../audit/engine';

export interface AuditTransactionRecord {
  id: string;
  time: string;
  service: string;
  amount: string;
  asset: string;
  network: string;
  status: 'Completed' | 'Pending' | 'Failed';
  txId: string;
  auditId: string;
  provider: string;
}

export interface ActivityTraceEvent {
  id: string;
  timestamp: string;
  event: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'payment';
  txId?: string;
}

export interface AgentRunRecord {
  id: string;
  prompt: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  originalCode: string;
  fixedCode?: string;
  initialScore: number;
  finalScore?: number;
  status: 'AUDITED' | 'RE_AUDITED' | 'DEPLOYED';
  timestamp: string;
}

const INITIAL_TRANSACTIONS: AuditTransactionRecord[] = [
  {
    id: 'TX-1042',
    time: 'Today, 10:32',
    service: 'CodeShield Security Audit',
    amount: '0.05',
    asset: 'USDC (10458941)',
    network: 'Algorand Testnet',
    status: 'Completed',
    txId: '2UBJMHFS3VUXVMXYTXBCXD4JJWYWKEMDHAW4MRUZWXYTXBCXD4JJWYWKE',
    auditId: 'AUD-98241',
    provider: 'GoPlausible Facilitator',
  },
  {
    id: 'TX-1041',
    time: 'Yesterday, 18:15',
    service: 'CodeShield Security Audit',
    amount: '0.05',
    asset: 'USDC (10458941)',
    network: 'Algorand Testnet',
    status: 'Completed',
    txId: 'GD6E5JSHB6G4O54TYM64Q76M3E3I6XN25K5R5P3V6C4J5V5N5B5V5C5V5C',
    auditId: 'AUD-98240',
    provider: 'GoPlausible Facilitator',
  },
];

class CodeShieldStore {
  private transactions: AuditTransactionRecord[] = INITIAL_TRANSACTIONS;
  private reports: AuditReportData[] = [];
  private activityEvents: ActivityTraceEvent[] = [
    { id: '1', timestamp: '10:32:01', event: 'Agent generated Solidity crowdfunding contract', type: 'info' },
    { id: '2', timestamp: '10:32:03', event: 'Risk assessment started: Financial Smart Contract detected', type: 'warning' },
    { id: '3', timestamp: '10:32:05', event: 'Risk Level: HIGH. Security audit required before deployment', type: 'warning' },
    { id: '4', timestamp: '10:32:06', event: 'Requesting CodeShield API POST /api/audit', type: 'info' },
    { id: '5', timestamp: '10:32:07', event: 'HTTP 402 Payment Required received (Price: 0.05 USDC)', type: 'payment' },
    { id: '6', timestamp: '10:32:08', event: 'Checking Spending Policy: Max $0.10, Daily $2.00 -> PASS', type: 'info' },
    { id: '7', timestamp: '10:32:10', event: 'Initiating x402 payment & signing Algorand Testnet transaction', type: 'payment' },
    { id: '8', timestamp: '10:32:15', event: 'Payment verified via GoPlausible Facilitator (TxID #2UBJM...)', type: 'success', txId: '2UBJMHFS3VUXVMXYTXBCXD4JJWYWKEMDHAW4MRUZWXYTXBCXD4JJWYWKE' },
    { id: '9', timestamp: '10:32:16', event: 'Security audit unlocked. Running static rules engine & Claude AI', type: 'info' },
    { id: '10', timestamp: '10:32:20', event: 'Audit completed: Score 42/100 (FAIL - Critical Reentrancy Bug)', type: 'error' },
  ];

  private agentBalanceUsdc: number = 5.00;
  private dailySpentUsdc: number = 0.25;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedBal = localStorage.getItem('codeshield_agent_balance_usdc');
        if (savedBal !== null && !isNaN(Number(savedBal))) {
          this.agentBalanceUsdc = Number(savedBal);
        }
        const savedSpent = localStorage.getItem('codeshield_daily_spent_usdc');
        if (savedSpent !== null && !isNaN(Number(savedSpent))) {
          this.dailySpentUsdc = Number(savedSpent);
        }
        const savedTx = localStorage.getItem('codeshield_transactions');
        if (savedTx) {
          const parsed = JSON.parse(savedTx);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.transactions = parsed;
          }
        }
        const savedReports = localStorage.getItem('codeshield_reports');
        if (savedReports) {
          const parsed = JSON.parse(savedReports);
          if (Array.isArray(parsed)) {
            this.reports = parsed;
          }
        }
        const savedActivity = localStorage.getItem('codeshield_activity');
        if (savedActivity) {
          const parsed = JSON.parse(savedActivity);
          if (Array.isArray(parsed)) {
            this.activityEvents = parsed;
          }
        }
      } catch (err) {
        console.warn('Could not restore from localStorage:', err);
      }
    }
  }

  public getBalance(): number {
    return this.agentBalanceUsdc;
  }

  public getDailySpent(): number {
    return this.dailySpentUsdc;
  }

  public deductBalance(amountUsdc: number): number {
    this.agentBalanceUsdc = Math.max(0, Number((this.agentBalanceUsdc - amountUsdc).toFixed(4)));
    this.dailySpentUsdc = Number((this.dailySpentUsdc + amountUsdc).toFixed(4));

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('codeshield_agent_balance_usdc', this.agentBalanceUsdc.toString());
        localStorage.setItem('codeshield_daily_spent_usdc', this.dailySpentUsdc.toString());
      } catch (e) {
        console.warn('localStorage error:', e);
      }
    }

    this.notifyListeners();
    return this.agentBalanceUsdc;
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb());
  }

  public getTransactions(): AuditTransactionRecord[] {
    return this.transactions;
  }

  public addTransaction(tx: AuditTransactionRecord) {
    // Avoid duplicate IDs
    const exists = this.transactions.some((t) => t.id === tx.id || t.txId === tx.txId);
    if (!exists) {
      this.transactions.unshift(tx);
    } else {
      this.transactions.unshift({ ...tx, id: `TX-${Date.now().toString().slice(-4)}` });
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('codeshield_transactions', JSON.stringify(this.transactions));
      } catch (e) {
        console.warn('localStorage error:', e);
      }
    }

    this.notifyListeners();
  }

  public getActivityEvents(): ActivityTraceEvent[] {
    return this.activityEvents;
  }

  public addActivityEvent(evt: Omit<ActivityTraceEvent, 'id'>) {
    const newEvt: ActivityTraceEvent = {
      ...evt,
      id: String(Date.now()),
    };
    this.activityEvents.push(newEvt);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('codeshield_activity', JSON.stringify(this.activityEvents));
      } catch (e) {
        console.warn('localStorage error:', e);
      }
    }

    this.notifyListeners();
  }

  public addReport(rep: AuditReportData) {
    this.reports.unshift(rep);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('codeshield_reports', JSON.stringify(this.reports));
      } catch (e) {
        console.warn('localStorage error:', e);
      }
    }

    this.notifyListeners();
  }

  public getReports(): AuditReportData[] {
    return this.reports;
  }
}

export const dbStore = new CodeShieldStore();
