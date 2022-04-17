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
