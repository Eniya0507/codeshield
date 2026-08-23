/**
 * x402 Protocol Types for Algorand (AVM)
 * Compliant with x402 V2 Specification & GoPlausible Facilitator
 */

export interface x402PaymentRequirement {
  scheme: 'exact';
  price: string;
  network: string; // e.g. "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
  payTo: string;
  extra: {
    asset: number; // ASA ID (e.g. 10458941 for Testnet USDC, 31566704 for Mainnet)
    feePayer?: string; // Facilitator fee-payer address
    note?: string;
  };
}

export interface x402ChallengePayload {
  x402Version: number;
  accepts: x402PaymentRequirement[];
  description: string;
  facilitatorUrl: string;
}

export interface x402PaymentPayload {
  signedTxn?: string; // Base64 encoded signed transaction
  txn?: string;
  txId?: string;
  signature?: string;
  senderAddress?: string;
  network?: string;
}

export interface x402VerificationResult {
  verified: boolean;
  txId?: string;
  sender?: string;
  receiver?: string;
  amountUsdc?: number;
  assetId?: number;
  network?: string;
  reason?: string;
  settledOnChain?: boolean;
}

export interface x402FacilitatorResponse {
  valid: boolean;
  txId?: string;
  error?: string;
  settled?: boolean;
}
