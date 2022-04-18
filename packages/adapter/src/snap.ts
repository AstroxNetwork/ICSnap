import { ICPSnapApi } from '@astrox/icsnap-types';
import { configure, getIdentity, sign, signRawMessage } from './methods';

export class MetamaskICPSnap {
  // snap parameters
  protected readonly snapOrigin: string;
  protected readonly snapId: string;

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
    };
  };
}
