import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

import { CompilationResult } from "@remixproject/plugin-api";
import { BehaviorSubject } from "rxjs";

export class WorkSpacePlugin extends PluginClient {
  callBackEnabled: boolean = true;
  feedback = new BehaviorSubject<string>("");
  networkname = new BehaviorSubject<string>("");
  accounts = new BehaviorSubject<string[] | undefined>(undefined);
  status = new BehaviorSubject<boolean>(false);
  compilationresult = new BehaviorSubject<any>({});
  timer: any;
  constructor() {
    super();

    createClient(this);
    this.methods = ["qr", "dismiss"];
    this.onload()
      .then(async (x) => {
        await this.setCallBacks();
      })
      .catch(async (e) => {
        console.log("ERROR CONNECTING", e);
      });
  }

  async setCallBacks() {
    let me = this;

    this.on("walletconnect" as any, "displayUri", async function (x: string) {
      me.qr(x);
    });

    this.on("walletconnect" as any, "accountsChanged", async function (x: any) {
      me.accounts.next(x);
      await me.dismiss();
      me.status.next(x.length > 0);
      me.feedback.next(x.length > 0 ? "Connected" : "No accounts connected");
    });
    this.on("walletconnect" as any, "chainChanged", async function (x: any) {
      await me.detectNetwork(x);
    });

    this.on("walletconnect" as any, "disconnect", async function (x: any) {
      me.feedback.next("Disconnected");
      me.accounts.next(undefined);
      me.status.next(false);
    });

    this.on("fileManager", "currentFileChanged", (x: any) => {});

    this.on(
      "solidity",
      "compilationFinished",
      (
        fn: string,
        source: any,
        _languageVersion: string,
        data: CompilationResult
      ) => {}
    );

    this.on("udapp" as any, "deploy", (x: any) => {});

    this.on("udapp" as any, "receipt", (x: any) => {});

    this.on("remixdprovider" as any, "statusChanged", async (x: any) => {
      //console.log(x);
      if (x === "disconnected") {
        if (this.networkname.getValue() === "remixd") {
          this.feedback.next("Disconnected");
          this.accounts.next(undefined);
          this.status.next(false);
        }
      } else if (x === "connected") {
        await this.getAccounts();
        this.networkname.next("remixd")
      } else {
        this.feedback.next("waiting for connection ....");
      }
    });

    this.startTimer();
  }
  async startTimer() {
    this.timer = setTimeout(async (x: any) => {
      await this.getAccounts(false);
    }, 1000);
  }

  async detectNetwork(id: number) {
    let networkName: any = null;

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
    if (id === 1) networkName = "Main";
    else if (id === 2) networkName = "Morden (deprecated)";
    else if (id === 3) networkName = "Ropsten";
    else if (id === 4) networkName = "Rinkeby";
    else if (id === 5) networkName = "Goerli";
    else if (id === 42) networkName = "Kovan";
    else networkName = "Custom";
    this.feedback.next(`Network is ${networkName}`);
  }

  async qr(uri: string) {
    WalletConnectQRCodeModal.open(uri, function () {});
    return true;
  }

  async dismiss() {
    WalletConnectQRCodeModal.close();
    return true;
  }

  async connectWallet() {
    WalletConnectQRCodeModal.close();

    this.call("walletconnect" as any, "connect");
  }

  async disconnect() {
    WalletConnectQRCodeModal.close();
    try {
      await this.call("walletconnect" as any, "disconnect");
      await this.call("remixdprovider" as any, "disconnect");
    } catch (e) {
      this.feedback.next("Disconnected");
      this.accounts.next(undefined);
      this.status.next(false);
    }
  }

  async addNetwork(network: string) {
    try {
      await this.call("udapp" as any, "addNetwork", network);
      await this.getAccounts();
      this.networkname.next("custom network")
    } catch (e) {
      this.feedback.next(e);
    }
  }

  async addRemixD(network: string) {
    try {
      await this.call("remixdprovider" as any, "connect", network);
      //await this.getAccounts();
    } catch (e) {
      this.feedback.next(e);
    }
  }

  async setAccount(account: string) {
    await this.call("udapp" as any, "setAccount", account);
  }

  async getAccounts(setAccount: boolean = true) {
    try {
      console.log("wallet get accounts");
      const accounts = await this.call(
        "udapp" as any,
        "getAccounts",
        setAccount
      );
      this.accounts.next(accounts);
      this.status.next(accounts.length > 0);
      this.feedback.next(
        accounts.length > 0 ? "Connected" : "No accounts found."
      );
    } catch (e) {
      console.log("no connection");
    }
  }
}
