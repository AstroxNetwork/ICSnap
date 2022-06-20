import { SignMessageResponse, SignRawMessageResponse, Wallet } from '@astrox/icsnap-types';
// import { Signature } from '@dfinity/agent';
import { showConfirmationDialog } from './confirmation';
import { getIdentity } from './getIdentity';
// import secp256k1 from 'secp256k1';
// import { sha256 } from 'js-sha256';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { fromHexString, toHexString } from './util';

export async function sign(wallet: Wallet, message: string): Promise<SignMessageResponse> {
  try {
    const identityString = await getIdentity(wallet);
    const identity = Secp256k1KeyIdentity.fromJSON(identityString);
    const confirmation = await showConfirmationDialog(wallet, {
      description: `It will be signed with address: ${identity.getPrincipal().toText()}`,
      prompt: `Do you want to sign this message?`,
      textAreaContent: message,
    });
    let signature: ArrayBuffer | undefined = undefined;
    if (confirmation) {
      signature = await identity.sign(fromHexString(message));
    }
    return { confirmed: confirmation, error: null, signature: toHexString(signature) };
  } catch (e) {
    return { confirmed: false, error: e.message.toString(), signature: undefined };
  }
}

export async function signRawMessasge(wallet: Wallet, rawMessage: string): Promise<SignRawMessageResponse> {
  try {
    const identityString = await getIdentity(wallet);
    const identity = Secp256k1KeyIdentity.fromJSON(identityString);

    const confirmation = await showConfirmationDialog(wallet, {
      description: `It will be signed with address: ${identity.getPrincipal().toText()}`,
      prompt: `Do you want to sign this message?`,
      textAreaContent: rawMessage,
    });

    let signature: string | undefined = undefined;
    if (confirmation) {
      signature = Buffer.from(await identity.sign(new TextEncoder().encode(rawMessage).buffer)).toString('hex');
    }
    return { confirmed: confirmation, error: null, signature: signature };
  } catch (e) {
    return { confirmed: false, error: e.message.toString(), signature: undefined };
  }
}
