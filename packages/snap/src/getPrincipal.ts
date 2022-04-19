import { Wallet } from '@astrox/icsnap-types';
import { getIdentity } from './getIdentity';

export async function getPrincipal(wallet: Wallet): Promise<string> {
  const identity = await getIdentity(wallet);
  const principal = await identity.getPrincipal().toText();
  return principal;
}
