import { Wallet } from '@astrox/icsnap-types';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { getIdentity } from './getIdentity';

export async function getPrincipal(wallet: Wallet): Promise<string> {
  const identityString = await getIdentity(wallet);
  const identity = Secp256k1KeyIdentity.fromJSON(identityString);
  const principal = await identity.getPrincipal().toText();
  return principal;
}
