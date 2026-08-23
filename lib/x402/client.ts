import { x402ChallengePayload } from './types';
import { evaluateSpendingPolicy, DEFAULT_AGENT_POLICY } from '../policy/spendingPolicy';
import { dbStore } from '../store/db';
import { buildAlgorandPaymentTransaction, broadcastSignedTransaction } from '../algorand/payment';
import { getAlgorandConfig } from '../algorand/config';
import algosdk from 'algosdk';

export interface AgentSigner {
  address: string;
  signTransactions: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>;
}

export interface x402ClientOptions {
  onProgress?: (status: string) => void;
  customPolicy?: typeof DEFAULT_AGENT_POLICY;
}

export async function executeAgentx402Fetch(
  url: string,
  signer: AgentSigner | null,
  bodyData: any,
  options?: x402ClientOptions
): Promise<any> {
  const onProgress = options?.onProgress;
  const policy = options?.customPolicy || DEFAULT_AGENT_POLICY;
  const config = getAlgorandConfig();

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  onProgress?.(`[${now()}] 1. Agent initiating request to CodeShield API: POST ${url}`);

  // Step 1: Send initial unauthenticated request to trigger x402 gateway
  const firstRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });

  if (firstRes.ok) {
    onProgress?.(`[${now()}] Service returned 200 OK directly`);
    return await firstRes.json();
  }

  if (firstRes.status === 402) {
    onProgress?.(`[${now()}] 2. Received HTTP 402 Payment Required`);
    const challengeHeader = firstRes.headers.get('x402');
    let challenge: x402ChallengePayload;

    try {
      challenge = challengeHeader ? JSON.parse(challengeHeader) : await firstRes.json();
    } catch {
      challenge = await firstRes.json();
    }

    const requirement = challenge.accepts[0];
    const priceStr = requirement.price || '$0.05';
    const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0.05;

    onProgress?.(`[${now()}] 3. Payment requirement: ${priceStr} USDC on ${requirement.network.includes('SGO1') ? 'Algorand Testnet' : 'Algorand Mainnet'}`);

    // Step 2: Evaluate spending policy
    onProgress?.(`[${now()}] 4. Evaluating Agent Spending Policy (Max: $${policy.maxPerTransactionUsdc}, Daily: $${policy.dailySpendingLimitUsdc})`);
    const currentBal = dbStore.getBalance();
    const policyResult = evaluateSpendingPolicy(priceNum, currentBal, 'CodeShield', policy);

    if (!policyResult.allowed) {
      onProgress?.(`[${now()}] ❌ Payment Blocked by Policy: ${policyResult.reason}`);
      throw new Error(`Spending Policy Blocked: ${policyResult.reason}`);
    }

    onProgress?.(`[${now()}] 5. Policy Check Passed ✓ (Remaining daily budget: $${policyResult.remainingDailyBudget.toFixed(2)} USDC)`);

    // Step 3: Build & Sign real on-chain Algorand transaction via Pera Wallet
    const receiverAddress = requirement.payTo || config.receiverAddress;
    onProgress?.(`[${now()}] 6. Building Algorand USDC payment txn → Receiver: ${receiverAddress.slice(0, 10)}...`);

    let realTxId: string | undefined;

    if (signer && signer.address && signer.signTransactions) {
      try {
        // Build the unsigned transaction
        const unsignedTxn = await buildAlgorandPaymentTransaction({
          fromAddress: signer.address,
          toAddress: receiverAddress,
          amountUsdc: priceNum,
        });

        onProgress?.(`[${now()}] 7. Requesting Pera Wallet signature... (check your Pera Wallet mobile app)`);

        // Request Pera Wallet to sign — this triggers the Pera Wallet popup/mobile notification
        const signedBytes = await signer.signTransactions([unsignedTxn]);

        onProgress?.(`[${now()}] 7b. Pera Wallet signed ✓ Broadcasting to Algorand Testnet...`);

        // Broadcast signed transaction to Algod node and wait for confirmation
        const { txId, confirmedRound } = await broadcastSignedTransaction(signedBytes[0]);
        realTxId = txId;

        onProgress?.(`[${now()}] 8. ✅ Transaction Confirmed on-chain! TxID: ${txId} (Round: ${confirmedRound})`);
        onProgress?.(`[${now()}] 8b. View on Lora: https://lora.algokit.io/testnet/transaction/${txId}`);

      } catch (e: any) {
        const msg = e?.message || String(e);
        // User rejected or wallet unavailable — fall back to simulated proof
        if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('user')) {
          onProgress?.(`[${now()}] ⚠️ Wallet signing cancelled by user. Using simulated proof for demo.`);
        } else {
          onProgress?.(`[${now()}] ⚠️ On-chain tx failed (${msg.slice(0, 60)}). Using simulated proof for demo.`);
        }
      }
    } else {
      onProgress?.(`[${now()}] 7. No wallet connected — using x402 simulated payment proof for demo.`);
    }

    // Build payment proof (real TxID if available, else signed demo proof)
    const paymentProof = realTxId ?? `X402-PROOF-AVM-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    onProgress?.(`[${now()}] 8. Submitting proof to CodeShield gateway (Facilitator: ${challenge.facilitatorUrl || 'GoPlausible'})`);

    // Step 4: Resubmit request with payment proof headers
    const paidRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Payment-Signature': paymentProof,
        'X-Payment-Proof': paymentProof,
        'Authorization': `Bearer ${paymentProof}`,
        ...(realTxId ? { 'X-Algorand-TxId': realTxId } : {}),
      },
      body: JSON.stringify(bodyData),
    });

    if (paidRes.ok) {
      onProgress?.(`[${now()}] 9. Payment Verified ✓ Security audit unlocked!`);
      const report = await paidRes.json();
      // Attach the real TxID to the report so workspace can record it properly
      if (realTxId) {
        report._realTxId = realTxId;
      }
      onProgress?.(`[${now()}] 10. Security Audit Complete! Score: ${report.securityScore}/100`);
      return report;
    } else {
      const errJson = await paidRes.json().catch(() => ({}));
      const reason = errJson.error || `HTTP ${paidRes.status} Payment Verification Failed`;
      onProgress?.(`[${now()}] ❌ Payment verification failed: ${reason}`);
      throw new Error(reason);
    }
  }

  const errText = await firstRes.text();
  throw new Error(`HTTP Error ${firstRes.status}: ${errText}`);
}
