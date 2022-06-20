import { Wallet } from '@astrox/icsnap-types';
import { DerEncodedPublicKey } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { DelegationChain, Secp256k1KeyIdentity, Secp256k1PublicKey } from '@dfinity/identity';
import { getIdentity } from './getIdentity';
import { fromHexString } from './util';
import { showConfirmationDialog } from './confirmation';

export async function requestDelegationChain(wallet: Wallet, sessionPublicKey: string, milliseconds?: number, canisterIds?: string): Promise<string> {
  const identityString = await getIdentity(wallet);
  const identity = Secp256k1KeyIdentity.fromJSON(identityString);

  let targets: Principal[] | undefined;
  if (canisterIds !== undefined) {
    targets = (JSON.parse(canisterIds) as string[]).map(e => Principal.fromText(e));
  }

  const dateTime = milliseconds !== undefined ? new Date(milliseconds) : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7);
  let targetsString = '';
  if (targets && targets.length > 0) {
    targetsString = 'Related Canister: \n' + targets.map(f => f.toText()).join('\n');
  }

  const confirmation = await showConfirmationDialog(wallet, {
    description: `It will be signed with address: ${identity.getPrincipal().toText()}`,
    prompt: `Do you want to authorize this website?`,
    textAreaContent: `
  ${targetsString}    
  Expiration:
  ${dateTime.toLocaleTimeString()}  
  `,
  });
  let chain: DelegationChain | undefined = undefined;
  if (confirmation) {
    chain = await DelegationChain.create(identity, Secp256k1PublicKey.fromDer(fromHexString(sessionPublicKey) as DerEncodedPublicKey), dateTime, {
      targets,
    });
  }
  return JSON.stringify(chain.toJSON());
}
