import { ICPSnapApi, SignRawMessageResponse, SignMessageResponse } from '@astrox/icsnap-types';
import { PublicKey, Signature, SignIdentity } from '@dfinity/agent';
import { fromHexString, toHexString } from './util';
import { DelegationChain, DelegationIdentity, Secp256k1KeyIdentity, Secp256k1PublicKey } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';

export class SnapIdentity extends SignIdentity {
  #innerIdentity: DelegationIdentity;
  constructor(private _api: ICPSnapApi, private _delegationChain: string, private _sessionKey: Secp256k1KeyIdentity) {
    super();
    this.#innerIdentity = DelegationIdentity.fromDelegation(this._sessionKey, DelegationChain.fromJSON(JSON.parse(this._delegationChain)));
  }
  getPublicKey(): PublicKey {
    return this.#innerIdentity.getPublicKey();
  }

  getPrincipal(): Principal {
    return this.#innerIdentity.getPrincipal();
  }

  async sign(blob: ArrayBuffer): Promise<Signature> {
    try {
      const sig = await this.#innerIdentity.sign(blob);
      return sig;
    } catch (error) {
      throw new Error(`signing message error: ${error.message}`);
    }
  }

  async signRawMessage(blob: string): Promise<SignRawMessageResponse> {
    try {
      const signedResponse = await this._api.signRawMessage(blob);
      if (signedResponse.error) {
        throw signedResponse.error;
      }
      if (signedResponse.confirmed === false) {
        throw new Error(`signing message error: signing process terminated by user`);
      }
      return signedResponse;
    } catch (error) {
      throw new Error(`signing message error: ${error.message}`);
    }
  }
}
