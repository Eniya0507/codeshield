export interface AgentSpendingPolicy {
  maxPerTransactionUsdc: number;
  dailySpendingLimitUsdc: number;
  dailySpentUsdc: number;
  approvedProviders: string[];
  network: string;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason: string;
  checks: {
    balanceSufficient: boolean;
    belowMaxPerTx: boolean;
    belowDailyLimit: boolean;
    providerTrusted: boolean;
  };
  remainingDailyBudget: number;
}

export const DEFAULT_AGENT_POLICY: AgentSpendingPolicy = {
  maxPerTransactionUsdc: 0.10,
  dailySpendingLimitUsdc: 2.00,
  dailySpentUsdc: 0.25,
  approvedProviders: ['CodeShield', 'GoPlausible'],
  network: 'Algorand Testnet',
};

export function evaluateSpendingPolicy(
  priceUsdc: number,
  balanceUsdc: number,
  providerName: string = 'CodeShield',
  policy: AgentSpendingPolicy = DEFAULT_AGENT_POLICY
): PolicyEvaluationResult {
  const remainingBudget = Math.max(0, policy.dailySpendingLimitUsdc - policy.dailySpentUsdc);

  const balanceSufficient = balanceUsdc >= priceUsdc;
  const belowMaxPerTx = priceUsdc <= policy.maxPerTransactionUsdc;
  const belowDailyLimit = priceUsdc <= remainingBudget;
  const providerTrusted = policy.approvedProviders.some(
    p => p.toLowerCase() === providerName.toLowerCase()
  );

  const allowed = balanceSufficient && belowMaxPerTx && belowDailyLimit && providerTrusted;

  let reason = 'PAYMENT APPROVED';
  if (!balanceSufficient) reason = 'Insufficient wallet balance for payment';
  else if (!belowMaxPerTx) reason = `Transaction price ($${priceUsdc} USDC) exceeds max per-tx limit ($${policy.maxPerTransactionUsdc} USDC)`;
  else if (!belowDailyLimit) reason = `Transaction price ($${priceUsdc} USDC) exceeds remaining daily budget ($${remainingBudget.toFixed(2)} USDC)`;
  else if (!providerTrusted) reason = `Provider "${providerName}" is not in the approved service providers list`;

  return {
    allowed,
    reason,
    checks: {
      balanceSufficient,
      belowMaxPerTx,
      belowDailyLimit,
      providerTrusted,
    },
    remainingDailyBudget: remainingBudget,
  };
}
