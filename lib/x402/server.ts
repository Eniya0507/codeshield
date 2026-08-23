import { createx402Challenge } from './paymentRequirements';
import { x402ChallengePayload, x402VerificationResult } from './types';
import { verifyWithFacilitator } from './facilitator';
import { getAlgorandConfig } from '../algorand/config';

export function generate402Response(customReason?: string): {
  status: number;
  headers: Record<string, string>;
  body: x402ChallengePayload & { error?: string };
} {
  const challenge = createx402Challenge();
  const config = getAlgorandConfig();

  return {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'x402': JSON.stringify(challenge),
      'WWW-Authenticate': `x402 realm="CodeShield Audit Gateway", price="$0.05 USDC", network="${challenge.accepts[0].network}", payTo="${challenge.accepts[0].payTo}", asset="${challenge.accepts[0].extra.asset}"`,
      'X-Payment-Required': 'true',
      'X-Network': config.network.toUpperCase(),
    },
    body: {
      ...challenge,
      ...(customReason ? { error: customReason } : {}),
    },
  };
}

export async function verifyServerPaymentHeader(
  headers: Headers
): Promise<x402VerificationResult> {
  const paymentSig =
    headers.get('payment-signature') ||
    headers.get('x-payment-proof') ||
    headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!paymentSig || paymentSig.trim().length === 0) {
    return {
      verified: false,
      reason: 'HTTP 402 Payment Required: No Payment-Signature or authorization header provided.',
      settledOnChain: false,
    };
  }

  const challenge = createx402Challenge();
  const requirement = challenge.accepts[0];

  return await verifyWithFacilitator(paymentSig.trim(), requirement);
}
