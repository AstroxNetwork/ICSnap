import { ICPSnapApi, SignRawMessageResponse, SignMessageResponse } from '@astrox/icsnap-types';
import { PublicKey, Signature, SignIdentity } from '@dfinity/agent';
import { fromHexString, toHexString } from './util';
import { DelegationChain, DelegationIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { Secp256k1KeyIdentity, Secp256k1PublicKey } from '@dfinity/identity-secp256k1';

export class SnapIdentity extends SignIdentity {
  #innerIdentity: SignIdentity;
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
    try {
      // console.log(toHexString(blob));

      const signedResponse = await this._api.sign(toHexString(blob));
      if (signedResponse.error) {
        throw signedResponse.error;
      }

      return fromHexString(signedResponse.signature) as Signature;

      // this.#innerIdentity = this.#innerIdentity ?? Secp256k1KeyIdentity.fromJSON(await this._api.getIdentity());
      // this.#innerIdentity = this.#innerIdentity ?? Secp256k1KeyIdentity.fromJSON(await this._api.getIdentity());
      // const sig = await this.#innerIdentity.sign(blob);
      // return sig;
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

export const requestDelegation = async (
  identity: SignIdentity,
  { canisterId, date }: { canisterId?: string; date?: Date },
): Promise<DelegationIdentity> => {
  const sessionKey = Secp256k1KeyIdentity.generate();
  const chain = await DelegationChain.create(identity, sessionKey.getPublicKey(), date || new Date(Date.parse('2100-01-01')), {
    targets: canisterId != undefined ? [Principal.fromText(canisterId)] : undefined,
  });

  return DelegationIdentity.fromDelegation(sessionKey, chain);
};
