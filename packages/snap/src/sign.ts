import { SignMessageResponse, SignRawMessageResponse, Wallet } from '@astrox/icsnap-types';
// import { Signature } from '@dfinity/agent';
import { showConfirmationDialog } from './confirmation';
import { getIdentity } from './getIdentity';
// import secp256k1 from 'secp256k1';
// import { sha256 } from 'js-sha256';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { fromHexString, toHexString } from './util';

export async function sign(wallet: Wallet, message: string): Promise<SignMessageResponse> {
  try {
    const identityString = await getIdentity(wallet);
    const identity = Secp256k1KeyIdentity.fromJSON(identityString);
    let signature = await identity.sign(fromHexString(message));
    return { error: null, signature: toHexString(signature) };
  } catch (e) {
    return { error: e.message.toString(), signature: undefined };
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

// function ab2str(buf: ArrayBuffer): string {
//   return String.fromCharCode.apply(null, new Uint16Array(buf));
// }

// function str2ab(str: string): ArrayBuffer {
//   var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
//   var bufView = new Uint16Array(buf);
//   for (var i = 0, strLen = str.length; i < strLen; i++) {
//     bufView[i] = str.charCodeAt(i);
//   }
//   return buf;
// }

// function ecSign(prv: ArrayBuffer, challenge: ArrayBuffer): Signature {
//   const hash = sha256.create();
//   hash.update(challenge);
//   const signature = secp256k1.ecdsaSign(new Uint8Array(hash.digest()), new Uint8Array(prv)).signature.buffer;
//   return signature as Signature;
// }
