import axios, { AxiosResponse } from "axios";
import config from "../../Config";
import SecureHDWallet from "../../utilities/SecureHDWallet";

export default class SecureAccount {
  public secureHDWallet: SecureHDWallet;

  constructor(primaryMnemonic: string) {
    this.secureHDWallet = new SecureHDWallet(primaryMnemonic);
  }

  public getRecoveryMnemonic = async () =>
    this.secureHDWallet.getSecondaryMnemonic()

  public getAccountId = () => this.secureHDWallet.getAccountId();

  public getAddress = async () =>
    await this.secureHDWallet.getReceivingAddress()

  public getBalance = async () => await this.secureHDWallet.fetchBalance();

  public setupSecureAccount = async () =>
    await this.secureHDWallet.setupSecureAccount()

  public importSecureAccount = (bhXpub: string, secondaryXpub: string) =>
    this.secureHDWallet.prepareSecureAccount(bhXpub, secondaryXpub)

  public validateSecureAccountSetup = async (
    token: number,
    secret: string,
    xIndex: number,
  ) =>
    await this.secureHDWallet.validateSecureAccountSetup(token, secret, xIndex)

  public partiallySignedSecureTransaction = async ({
    recipientAddress,
    amount,
  }: {
    recipientAddress: string;
    amount: number;
  }) => {
    if (this.secureHDWallet.isValidAddress(recipientAddress)) {
      const { data } = await this.secureHDWallet.fetchBalance();
      const { balance, unconfirmedBalance } = data;
      console.log({ balance, unconfirmedBalance });

      console.log("---- Creating Transaction ----");
      const {
        inputs,
        txb,
        fee,
      } = await this.secureHDWallet.createSecureHDTransaction(
        recipientAddress,
        amount,
      );

      console.log("---- Transaction Created ----");

      if (balance + unconfirmedBalance + fee < amount) {
        throw new Error(
          "Insufficient balance to compensate for transfer amount and the txn fee",
        );
      }

      const {
        signedTxb,
        childIndexArray,
      } = await this.secureHDWallet.signHDTransaction(inputs, txb);

      const txHex = signedTxb.buildIncomplete().toHex();

      console.log(
        "---- Transaction signed by the user (1st sig for 2/3 MultiSig)----",
      );
      console.log({ txHex });
      return { txHex, childIndexArray };
    } else {
      return {
        status: 400,
        errorMessage: "Supplied recipient address is wrong.",
      };
    }
  }

  public serverSigningAndBroadcasting = async (
    token,
    txHex,
    childIndexArray,
  ) => {
    let res: AxiosResponse;
    try {
      console.log(this.secureHDWallet.walletID);
      res = await axios.post(config.SERVER + "/secureHDTransaction", {
        walletID: this.secureHDWallet.walletID,
        token,
        txHex,
        childIndexArray,
      });

      console.log(
        "---- Transaction Signed by BH Server (2nd sig for 2/3 MultiSig)----",
      );

      console.log({ txHex: res.data.txHex });
      console.log("------ Broadcasting Transaction --------");

      const bRes = await this.secureHDWallet.broadcastTransaction(
        res.data.txHex,
      );
      return bRes;
    } catch (err) {
      console.log("An error occured:", err);
      return {
        status: err.response.status,
        errorMessage: err.response.data,
      };
    }
  }
}