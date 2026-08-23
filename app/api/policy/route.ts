import { NextRequest, NextResponse } from 'next/server';
import { evaluateSpendingPolicy, DEFAULT_AGENT_POLICY } from '@/lib/policy/spendingPolicy';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    policy: DEFAULT_AGENT_POLICY,
    remainingDailyBudget: DEFAULT_AGENT_POLICY.dailySpendingLimitUsdc - DEFAULT_AGENT_POLICY.dailySpentUsdc,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceUsdc = 0.05, balanceUsdc = 5.00, providerName = 'CodeShield' } = body;

    const evaluation = evaluateSpendingPolicy(priceUsdc, balanceUsdc, providerName);

    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json({ error: 'Policy evaluation failed' }, { status: 500 });
  }
}
