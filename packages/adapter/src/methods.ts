import { MetamaskICPRpcRequest, SignRawMessageResponse, SignMessageResponse, SnapConfig } from '@astrox/icsnap-types';
import { MetamaskICPSnap } from './snap';
import { Signature } from '@dfinity/agent';

async function sendSnapMethod<T>(request: MetamaskICPRpcRequest, snapId: string): Promise<T> {
  return await window.ethereum.request({
    method: snapId,
    params: [request],
  });
}

// export async function getIdentity(this: MetamaskICPSnap): Promise<string> {
//   return await sendSnapMethod({ method: 'icp_getIdentity' }, this.snapId);
// }

export async function requestDelegationChain(
  this: MetamaskICPSnap,
  sessionPublicKey: string,
  milliseconds?: number,
  canisterIds?: string,
): Promise<string> {
  return await sendSnapMethod(
    { method: 'icp_requestDelegationChain', params: { sessionPublicKey: sessionPublicKey, milliseconds: milliseconds, canisterIds: canisterIds } },
    this.snapId,
  );
}

export async function configure(this: MetamaskICPSnap, configuration: SnapConfig): Promise<void> {
  return await sendSnapMethod({ method: 'icp_configure', params: { configuration: configuration } }, this.snapId);
}

export async function sign(this: MetamaskICPSnap, message: string): Promise<SignMessageResponse> {
  return await sendSnapMethod({ method: 'icp_sign', params: { message: message } }, this.snapId);
}

export async function signRawMessage(this: MetamaskICPSnap, rawMessage: string): Promise<SignRawMessageResponse> {
  return await sendSnapMethod({ method: 'icp_signRawMessage', params: { message: rawMessage } }, this.snapId);
}

export async function getPrincipal(this: MetamaskICPSnap): Promise<string> {
  return await sendSnapMethod({ method: 'icp_getPrincipal' }, this.snapId);
}

export async function getRawPublicKey(this: MetamaskICPSnap): Promise<string> {
  return await sendSnapMethod({ method: 'icp_getRawPublicKey' }, this.snapId);
}
