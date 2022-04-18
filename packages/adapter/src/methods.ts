import { MetamaskICPRpcRequest, SignRawMessageResponse, SnapConfig } from '@astrox/icsnap-types';
import { MetamaskICPSnap } from './snap';
import { Signature } from '@dfinity/agent';

async function sendSnapMethod<T>(request: MetamaskICPRpcRequest, snapId: string): Promise<T> {
  return await window.ethereum.request({
    method: snapId,
    params: [request],
  });
}

export async function getIdentity(this: MetamaskICPSnap): Promise<string> {
  return await sendSnapMethod({ method: 'icp_getIdentity' }, this.snapId);
}

export async function configure(this: MetamaskICPSnap, configuration: SnapConfig): Promise<void> {
  return await sendSnapMethod({ method: 'icp_configure', params: { configuration: configuration } }, this.snapId);
}

export async function sign(this: MetamaskICPSnap, message: ArrayBuffer): Promise<Signature> {
  return await sendSnapMethod({ method: 'icp_sign', params: { message: message } }, this.snapId);
}

export async function signRawMessage(this: MetamaskICPSnap, rawMessage: string): Promise<SignRawMessageResponse> {
  return await sendSnapMethod({ method: 'icp_signRawMessage', params: { message: rawMessage } }, this.snapId);
}
