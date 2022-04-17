import { deriveBIP44AddressKey, JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import { MetamaskState, SnapMethods, Wallet } from '@astrox/icsnap-types';
import Secp256k1 from 'secp256k1';
import { Secp256k1KeyIdentity } from '@dfinity/identity';

export async function getKeyPair(wallet: Wallet): Promise<Secp256k1KeyIdentity> {
  const snapState = (await wallet.request({ method: 'snap_manageState', params: ['get'] })) as MetamaskState;
  const { derivationPath } = snapState.icp.config;
  const [, , , account, change, addressIndex] = derivationPath.split('/');

  const bip44Node = (await wallet.request({
    method: SnapMethods.getBip44Entropy,
    params: [],
  })) as JsonBIP44CoinTypeNode;

  // Next, we'll create an address key deriver function for the Dogecoin coin_type node.
  // In this case, its path will be: m / 44' / coincode' / 0' / 0 / address_index
  const extendedPrivateKey = deriveBIP44AddressKey(bip44Node, {
    account: parseInt(account),
    address_index: parseInt(addressIndex),
    change: parseInt(change),
  });
  const privateKey = extendedPrivateKey.slice(0, 32);
  const publicKey = Secp256k1.publicKeyCreate(privateKey, false);
  return Secp256k1KeyIdentity.fromKeyPair(publicKey.buffer, privateKey.buffer);

  // Now, you can ask the user to e.g. sign transactions!
}
