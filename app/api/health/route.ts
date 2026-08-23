import { NextResponse } from 'next/server';
import { getAlgorandConfig } from '@/lib/algorand/config';
import { checkFacilitatorHealth } from '@/lib/x402/facilitator';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = getAlgorandConfig();
  const facilitator = await checkFacilitatorHealth();

  return NextResponse.json({
    status: 'healthy',
    service: 'CodeShield Autonomous Security Gateway',
    version: '2.0.0',
    network: config.network === 'testnet' ? 'Algorand Testnet' : 'Algorand Mainnet',
    receiverAddress: config.receiverAddress,
    usdcAssetId: config.usdcAssetId,
    facilitator: facilitator.url,
    facilitatorStatus: facilitator.status,
    timestamp: new Date().toISOString(),
  });
}
