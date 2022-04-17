import { SnapConfig } from './snap';

export abstract class WalletMethod {
  static enable: string = 'wallet_enable';
  static getSnaps: string = 'wallet_getSnaps';
  static installSnaps: string = 'wallet_installSnaps';
  static invokeSnaps: string = 'wallet_invokeSnap';
}

export const ICPCoin = 'ICP';
export const ICPCoinCode = 223;

export abstract class SnapMethods {
  static confirm: string = 'snap_confirm';
  static manageState: string = 'snap_manageState';
  static getBip44Entropy: string = `snap_getBip44Entropy_${ICPCoinCode}`;
}

export type MetamaskState = {
  icp: {
    config: SnapConfig;
    messages: ArrayBuffer[];
  };
};
