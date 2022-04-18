import { SignRawMessageResponse, Wallet } from '@astrox/icsnap-types';
import { Signature } from '@dfinity/agent';
import { showConfirmationDialog } from './confirmation';
import { getIdentity } from './getIdentity';

export async function sign(wallet: Wallet, message: ArrayBuffer): Promise<Signature> {
  const identity = await getIdentity(wallet);
  const sig = await identity.sign(message);
  return sig;
}

export async function signRawMessasge(wallet: Wallet, rawMessage: string): Promise<SignRawMessageResponse> {
  try {
    const identity = await getIdentity(wallet);
    const confirmation = await showConfirmationDialog(wallet, {
      description: `It will be signed with address: ${identity.getPrincipal().toText()}`,
      prompt: `Do you want to sign this message?`,
      textAreaContent: rawMessage,
    });

    let sig: ArrayBuffer = null;

    if (confirmation) {
      sig = await identity.sign(str2ab(rawMessage));
    }

    return { confirmed: confirmation, error: null, signature: ab2str(sig) };
  } catch (e) {
    return { confirmed: false, error: e, signature: null };
  }
}

function ab2str(buf: ArrayBuffer): string {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str: string): ArrayBuffer {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
