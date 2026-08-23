import { getAlgodClient } from './client';
import { getAlgorandConfig } from './config';
import { x402VerificationResult } from '../x402/types';

/**
 * Verifies an Algorand on-chain transaction directly against the Algod node
 */
export async function verifyOnChainTransaction(
  txId: string
): Promise<x402VerificationResult> {
  const config = getAlgorandConfig();
  const algod = getAlgodClient();

  if (!txId || txId.trim().length === 0) {
    return {
      verified: false,
      reason: 'Empty transaction ID provided',
      settledOnChain: false,
    };
  }

  try {
    // 1. Query Algod for transaction status
    const txInfo: any = await algod.pendingTransactionInformation(txId).do();

    const confirmedRound = Number(txInfo.confirmedRound || txInfo['confirmed-round'] || 0);
    const poolError = txInfo.poolError || txInfo['pool-error'];

    if (poolError) {
      return {
        verified: false,
        txId,
        reason: `On-chain transaction failed in pool: ${poolError}`,
        settledOnChain: false,
      };
    }

    if (confirmedRound > 0) {
      const txn = txInfo.txn?.txn || txInfo.txn || {};
      const receiver = txn.arcv || txn.rcv || '';
      const assetId = Number(txn.xaid || txn.assetId || 0);
      const amount = Number(txn.aamt || txn.amt || 0);

      // Verify asset transfer of USDC (Asset 10458941)
      if (assetId === config.usdcAssetId || assetId === 0) {
        return {
          verified: true,
          txId,
          receiver,
          assetId,
          amountUsdc: amount / 1_000_000,
          network: config.network,
          settledOnChain: true,
        };
      }
    }

    return {
      verified: true,
      txId,
      network: config.network,
      settledOnChain: true,
    };
  } catch (err) {
    return {
      verified: false,
      txId,
      reason: `Could not verify transaction on Algorand ${config.network}: ${err instanceof Error ? err.message : 'Not found'}`,
      settledOnChain: false,
    };
  }
}
