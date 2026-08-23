import { getAlgorandConfig } from '../algorand/config';
import { x402ChallengePayload, x402PaymentRequirement } from './types';

export const ALGORAND_TESTNET_CAIP2 = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
export const ALGORAND_MAINNET_CAIP2 = 'algorand:wGHE2pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=';
export const GOPLAUSIBLE_FEE_PAYER = 'ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA';

export function createx402Challenge(): x402ChallengePayload {
  const config = getAlgorandConfig();
  const caip2Network = config.network === 'mainnet' ? ALGORAND_MAINNET_CAIP2 : ALGORAND_TESTNET_CAIP2;

  const requirement: x402PaymentRequirement = {
    scheme: 'exact',
    price: '$0.05',
    network: caip2Network,
    payTo: config.receiverAddress,
    extra: {
      asset: config.usdcAssetId,
      feePayer: GOPLAUSIBLE_FEE_PAYER,
      note: 'CodeShield Security Audit Gate',
    },
  };

  return {
    x402Version: 2,
    accepts: [requirement],
    description: 'Autonomous Security Gateway Audit for AI Coding Agents ($0.05 USDC)',
    facilitatorUrl: config.facilitatorUrl,
  };
}
