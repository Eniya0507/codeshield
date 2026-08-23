export interface AlgorandConfig {
  network: 'testnet' | 'mainnet';
  algodServer: string;
  algodPort: string;
  algodToken: string;
  usdcAssetId: number;
  receiverAddress: string;
  facilitatorUrl: string;
  explorerBaseUrl: string;
  isConfigured: boolean;
}

export function getAlgorandConfig(): AlgorandConfig {
  const network = (process.env.NEXT_PUBLIC_NETWORK || process.env.ALGORAND_NETWORK || 'testnet').toLowerCase() as 'testnet' | 'mainnet';
  const isTestnet = network === 'testnet';

  const defaultReceiver = isTestnet
    ? 'CXMND6NPMOCM7ZO2SJ3FM67AGU2XRJTFKXXICPYUUGUP6IDXMMWZF6ZWPU'
    : (process.env.ALGORAND_RECEIVER_ADDRESS || 'NOT_CONFIGURED');

  return {
    network,
    algodServer: process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    algodPort: process.env.ALGOD_PORT || '',
    algodToken: process.env.ALGOD_TOKEN || '',
    usdcAssetId: Number(process.env.USDC_ASSET_ID || (isTestnet ? 10458941 : 31566704)),
    receiverAddress: process.env.ALGORAND_RECEIVER_ADDRESS || process.env.CODESHIELD_RECEIVER_ADDRESS || defaultReceiver,
    facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://facilitator.goplausible.xyz',
    explorerBaseUrl: isTestnet ? 'https://lora.algokit.io/testnet' : 'https://lora.algokit.io/mainnet',
    isConfigured: Boolean(process.env.ALGORAND_RECEIVER_ADDRESS || defaultReceiver !== 'NOT_CONFIGURED'),
  };
}
