import { ICPSnapApi, SignRawMessageResponse } from '@astrox/icsnap-types';
import { PublicKey, Signature, SignIdentity } from '@dfinity/agent';
import { fromHexString, toHexString } from './util';
import { Secp256k1PublicKey } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';

export class SnapIdentity extends SignIdentity {
  constructor(private _api: ICPSnapApi, private _rawPublickeyString: string, private _principalString: string) {
    super();
  }

  getPublicKey(): PublicKey {
    return Secp256k1PublicKey.fromRaw(fromHexString(this._rawPublickeyString));
  }

  getPrincipal(): Principal {
    return Principal.fromText(this._principalString);
  }

  async sign(blob: ArrayBuffer): Promise<Signature> {
    const blobString = toHexString(blob);

    try {
      const signedResponse = await this._api.signRawMessage(blobString);
      if (signedResponse.error) {
        throw signedResponse.error;
      }
      if (signedResponse.confirmed === false) {
        throw new Error(`signing message error: signing process terminated by user`);
      }
      return fromHexString(signedResponse.signature) as Signature;
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
