import {
  deriveBIP44AddressKey as deprecated_deriveBIP44AddressKey,
  JsonBIP44CoinTypeNode as Deprecated_JsonBIP44CoinTypeNode,
} from '@metamask/key-tree-old';
import { getBIP44AddressKeyDeriver, JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import { MetamaskState, Wallet } from '@astrox/icsnap-types';
import { toHexString } from '@dfinity/candid/lib/cjs/utils/buffer';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { getMetamaskVersion, isNewerVersion } from './util';

export async function getIdentity(wallet: Wallet): Promise<string> {
  const snapState = (await wallet.request({ method: 'snap_manageState', params: ['get'] })) as MetamaskState;
  const { derivationPath } = snapState.icp.config;
  const [, , coinType, account, change, addressIndex] = derivationPath.split('/');
  const bip44Code = coinType.replace("'", '');
  const bip44Node = (await wallet.request({
    method: `snap_getBip44Entropy_${bip44Code}`,
    params: [],
  })) as Deprecated_JsonBIP44CoinTypeNode | JsonBIP44CoinTypeNode;

  // Next, we'll create an address key deriver function for the Dogecoin coin_type node.
  // In this case, its path will be: m / 44' / coincode' / 0' / 0 / address_index
  // const extendedPrivateKey = deriveBIP44AddressKey(bip44Node, {
  //   account: parseInt(account),
  //   address_index: parseInt(addressIndex),
  //   change: parseInt(change),
  // });
  // const privateKey = new Uint8Array(extendedPrivateKey.slice(0, 32));
  // const publicKey = Secp256k1.publicKeyCreate(privateKey, false);

  let privateKey: Uint8Array;

  const currentVersion = await getMetamaskVersion(wallet);
  if (isNewerVersion('MetaMask/v10.15.99-flask.0', currentVersion)) {
    const addressKeyDeriver = await getBIP44AddressKeyDeriver(bip44Node as JsonBIP44CoinTypeNode, {
      account: parseInt(account),
      change: parseInt(change),
    });
    const extendedPrivateKey = await addressKeyDeriver(Number(addressIndex));
    privateKey = new Uint8Array(extendedPrivateKey.privateKeyBuffer.slice(0, 32));
  } else {
    // metamask has supplied us with entropy for "m/purpose'/bip44Code'/"
    // we need to derive the final "accountIndex'/change/addressIndex"
    const extendedPrivateKey = deprecated_deriveBIP44AddressKey(bip44Node as Deprecated_JsonBIP44CoinTypeNode, {
      account: parseInt(account),
      address_index: parseInt(addressIndex),
      change: parseInt(change),
    });
    privateKey = new Uint8Array(extendedPrivateKey.slice(0, 32));
  }

  const sk = Secp256k1KeyIdentity.fromSecretKey(privateKey.buffer);

  return JSON.stringify(sk.toJSON());
  // Now, you can ask the user to e.g. sign transactions!
}
