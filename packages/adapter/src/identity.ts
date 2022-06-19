import { fromHex, PublicKey, Signature, SignIdentity, toHex } from '@dfinity/agent';
import { DER_COSE_OID, Secp256k1PublicKey, WebAuthnIdentity } from '@dfinity/identity';
import { MetamaskICPSnap } from './snap';

export class SnapIdentity extends SignIdentity {
  constructor(private _snap: MetamaskICPSnap, private _rawPublickeyString: string) {
    super();
  }

  getPublicKey(): PublicKey {
    return Secp256k1PublicKey.fromRaw(fromHex(this._rawPublickeyString));
  }
  async sign(blob: ArrayBuffer): Promise<Signature> {
    const api = await this._snap.getICPSnapApi();
    const blobString = toHex(blob);

    try {
      const signedResponse = await api.signRawMessage(blobString);
      if (signedResponse.error) {
        throw signedResponse.error;
      }
      if (signedResponse.confirmed === false) {
        throw new Error(`signing message error: signing process terminated by user`);
      }
      return fromHex(signedResponse.signature) as Signature;
    } catch (error) {
      throw new Error(`signing message error: ${error.message}`);
    }
  }
}
