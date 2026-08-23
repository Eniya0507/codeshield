import { NextRequest, NextResponse } from 'next/server';
import { generate402Response, verifyServerPaymentHeader } from '@/lib/x402/server';
import { runSecurityAuditEngine } from '@/lib/audit/engine';
import { dbStore } from '@/lib/store/db';
import { getAlgorandConfig } from '@/lib/algorand/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const config = getAlgorandConfig();
    const paymentResult = await verifyServerPaymentHeader(req.headers);

    // 1. If payment proof is missing or unverified: Return RFC-compliant HTTP 402 Payment Required
    if (!paymentResult.verified) {
      const challenge = generate402Response(paymentResult.reason);
      return new NextResponse(JSON.stringify(challenge.body), {
        status: challenge.status,
        headers: challenge.headers,
      });
    }

    // 2. Payment is valid: Parse source code payload
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { code = '', language = 'solidity' } = body;

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Source code is required in request body',
          status: 'invalid_request',
        },
        { status: 400 }
      );
    }

    // 3. Run deterministic security analysis engine
    const report = runSecurityAuditEngine(code, language);

    // 4. Deduct $0.05 USDC from agent wallet budget
    dbStore.deductBalance(0.05);

    // 5. Record verified transaction
    const txId = paymentResult.txId || `X402-${Date.now()}`;
    dbStore.addTransaction({
      id: txId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      service: 'CodeShield Audit Gateway',
      amount: '0.05',
      asset: `USDC (${config.usdcAssetId})`,
      network: config.network === 'mainnet' ? 'Algorand Mainnet' : 'Algorand Testnet',
      status: 'Completed',
      txId,
      auditId: report.auditId,
      provider: 'GoPlausible Facilitator',
    });

    dbStore.addReport(report);

    // 6. Return HTTP 200 with structured audit report and delivery headers
    return NextResponse.json(report, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Delivery': 'DELIVERED',
        'X-Report-Hash': report.reportHash,
        'X-Audit-Id': report.auditId,
        'X-Payment-Verified': 'true',
      },
    });
  } catch (error) {
    console.error('API /api/audit error:', error);
    return NextResponse.json(
      {
        error: 'Service delivery error during audit execution',
        status: 'SERVICE_DELIVERY_FAILED',
        retryable: true,
      },
      { status: 500 }
    );
  }
}
