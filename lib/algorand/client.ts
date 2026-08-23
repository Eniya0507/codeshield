import { Algodv2 } from 'algosdk';
import { getAlgorandConfig } from './config';

export function getAlgodClient(): Algodv2 {
  const cfg = getAlgorandConfig();
  return new Algodv2(cfg.algodToken, cfg.algodServer, cfg.algodPort);
}
