import { MetamaskState, SnapConfig, Wallet } from '@astrox/icsnap-types';
import deepmerge from 'deepmerge';

export const icpMainnetConfiguration: SnapConfig = {
  derivationPath: "m/44'/223'/0'/0/0",
  network: 'mainnet',
  rpc: {
    token: '',
    url: 'https://ic0.app',
  },
  unit: {
    decimals: 8,
    image: `https://cryptologos.cc/logos/internet-computer-icp-logo.svg?v=022`,
    symbol: 'ICP',
  },
};

export const icpLocalConfiguration: SnapConfig = {
  derivationPath: "m/44'/223'/0'/0/0",
  network: 'local',
  rpc: {
    token: '',
    url: 'https://localhost:8000',
  },
  unit: {
    decimals: 8,
    image: `https://cryptologos.cc/logos/internet-computer-icp-logo.svg?v=022`,
    symbol: 'ICP',
  },
};

export const defaultConfiguration = icpMainnetConfiguration;

export function getDefaultConfiguration(networkName?: string): SnapConfig {
  switch (networkName) {
    case 'mainnet':
      console.log('ICP mainnett network selected');
      return icpMainnetConfiguration;
    case 'local':
      console.log('ICP local network selected');
      return icpLocalConfiguration;
    default:
      return defaultConfiguration;
  }
}

export async function getConfiguration(wallet: Wallet): Promise<SnapConfig> {
  const state = (await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  })) as MetamaskState;
  if (!state || !state.icp.config) {
    return defaultConfiguration;
  }
  return state.icp.config;
}

export interface ConfigureResponse {
  snapConfig: SnapConfig;
}

export async function configure(wallet: Wallet, networkName: string, overrides?: unknown): Promise<ConfigureResponse> {
  const defaultConfig = getDefaultConfiguration(networkName);
  const configuration = overrides ? deepmerge(defaultConfig, overrides) : defaultConfig;
  const [, , coinType, , ,] = configuration.derivationPath.split('/');
  const bip44Code = coinType.replace("'", '');
  //   // instatiate new api
  //   const api = await getApiFromConfig(configuration);
  //   const apiNetworkName = await api.stateNetworkName();
  // check if derivation path is valid
  if (bip44Code != '423') {
    throw new Error('Wrong CoinType in derivation path');
  }
  const state = (await wallet.request({ method: 'snap_manageState', params: ['get'] })) as MetamaskState;
  state.icp.config = configuration;
  wallet.request({
    method: 'snap_manageState',
    params: ['update', state],
  });
  return { snapConfig: configuration };
}
