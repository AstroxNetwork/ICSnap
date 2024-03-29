import { Wallet } from '@astrox/icsnap-types';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { getIdentity } from './getIdentity';
import { toHexString } from './util';

export async function getRawPublicKey(wallet: Wallet): Promise<string> {
  const identityString = await getIdentity(wallet);
  const identity = Secp256k1KeyIdentity.fromJSON(identityString);
  const rawPublicKey = await identity.getPublicKey().toRaw();
  return toHexString(rawPublicKey);
}
