import { Signature } from '@dfinity/agent';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { MetamaskICPRpcRequest } from './methods';
import { SignMessageResponse, SignRawMessageResponse } from './wallet';

export type ICPNetwork = 'mainnet' | 'local';
export interface UnitConfiguration {
  symbol: string;
  decimals: number;
  image?: string;
  customViewUrl?: string;
}
export interface SnapConfig {
  derivationPath: string;
  network: ICPNetwork;
  rpc: {
    token: string;
    url: string;
  };
  unit?: UnitConfiguration;
}

export interface WalletEnableRequest {
  method: 'wallet_enable';
  params: object[];
}

export interface GetSnapsRequest {
  method: 'wallet_getSnaps';
}

export interface SnapRpcMethodRequest {
  method: string;
  params: [MetamaskICPRpcRequest];
}

export type MetamaskRpcRequest = WalletEnableRequest | GetSnapsRequest | SnapRpcMethodRequest;

export interface ICPSnapApi {
  getIdentity(): Promise<string>;
  getRawPublicKey(): Promise<string>;
  configure(configuration: Partial<SnapConfig>): Promise<void>;
  sign(message: string): Promise<SignMessageResponse>;
  signRawMessage(message: string): Promise<SignRawMessageResponse>;
  getPrincipal(): Promise<string>;
}
