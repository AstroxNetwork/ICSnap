import { ICPSnapApi, SnapConfig } from '@astrox/icsnap-types';
import { hasMetaMask, isMetamaskSnapsSupported, isSnapInstalled } from './util';
import { configure, getIdentity, getPrincipal, getRawPublicKey, sign, signRawMessage } from './methods';
import { SnapIdentity } from './identity';

export class MetamaskICPSnap {
  // snap parameters
  protected readonly snapOrigin: string;
  protected readonly snapId: string;

  public async createSnapIdentity(): Promise<SnapIdentity> {
    const api = await this.getICPSnapApi();
    const publicKey = await api.getRawPublicKey();
    const principal = await api.getPrincipal();
    return new SnapIdentity(api, publicKey, principal);
  }

  public constructor(snapOrigin: string) {
    this.snapOrigin = snapOrigin;
    this.snapId = `wallet_snap_${this.snapOrigin}`;
  }

  public getICPSnapApi = async (): Promise<ICPSnapApi> => {
    return {
      configure: configure.bind(this),
      getIdentity: getIdentity.bind(this),
      sign: sign.bind(this),
      signRawMessage: signRawMessage.bind(this),
      getPrincipal: getPrincipal.bind(this),
      getRawPublicKey: getRawPublicKey.bind(this),
    };
  };
}

export type SnapInstallationParamNames = 'version' | string;

const defaultSnapOrigin = 'https://bafybeigzphbumdkucnj2c6nr5xb3kwsq5gs2gp7w3qldgbvfeycfsbjylu.ipfs.infura-ipfs.io';
/**
 * Install and enable ICP snap
 *
 * Checks for existence of Metamask and version compatibility with snaps before installation.
 *
 * Provided snap configuration must define at least network property so predefined configuration can be selected.
 * All other properties are optional, and if present will overwrite predefined property.
 *
 * @param config - SnapConfig
 * @param snapOrigin
 *
 * @return MetamaskICPSnap - adapter object that exposes snap API
 */
export async function enableICPSnap(
  config: Partial<SnapConfig>,
  snapOrigin?: string,
  snapInstallationParams: Record<SnapInstallationParamNames, unknown> = {},
): Promise<MetamaskICPSnap> {
  const snapId = snapOrigin ?? defaultSnapOrigin;

  // check all conditions
  if (!hasMetaMask()) {
    throw new Error('Metamask is not installed');
  }
  if (!(await isMetamaskSnapsSupported())) {
    throw new Error("Current Metamask version doesn't support snaps");
  }
  if (!config.network) {
    throw new Error('Configuration must at least define network type');
  }

  const isInstalled = await isSnapInstalled(snapId);

  if (!isInstalled) {
    // // enable snap
    await window.ethereum.request({
      method: 'wallet_enable',
      params: [
        {
          [`wallet_snap_${snapId}`]: {
            ...snapInstallationParams,
          },
        },
      ],
    });
  }

  //await unlockMetamask();

  // create snap describer
  const snap = new MetamaskICPSnap(snapOrigin || defaultSnapOrigin);
  // set initial configuration
  await (await snap.getICPSnapApi()).configure(config);
  // return snap object
  return snap;
}
