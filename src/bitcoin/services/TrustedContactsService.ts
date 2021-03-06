import TrustedContacts from '../utilities/TrustedContacts';
import config from '../Config';
import { Contacts } from '../utilities/Interface';

export default class TrustedContactsService {
  public static fromJSON = (json: string) => {
    const { tc } = JSON.parse(json);
    const {
      trustedContacts,
    }: {
      trustedContacts: Contacts;
    } = tc;

    return new TrustedContactsService({ trustedContacts });
  };

  public tc: TrustedContacts;
  constructor(stateVars?) {
    this.tc = new TrustedContacts(stateVars);
  }

  public initializeContact = (
    contactName: string,
  ):
    | {
        status: number;
        data: {
          publicKey: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.tc.initializeContact(contactName),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to setup trusted contact',
      };
    }
  };

  public finalizeContact = (
    contactName: string,
    encodedPublicKey: string,
  ):
    | {
        status: number;
        data: {
          channelAddress: string;
          ephemeralAddress: string;
          publicKey: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.tc.finalizeContact(contactName, encodedPublicKey),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to finalize trusted contact',
      };
    }
  };
}
