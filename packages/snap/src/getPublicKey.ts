import { Wallet } from '@astrox/icsnap-types';
import { toHexString } from '@dfinity/candid';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { getIdentity } from './getIdentity';

export async function getRawPublicKey(wallet: Wallet): Promise<string> {
  const identityString = await getIdentity(wallet);
  const identity = Secp256k1KeyIdentity.fromJSON(identityString);
  const publickeyDer = await identity.getPublicKey().toRaw();
  return toHexString(publickeyDer);
}
