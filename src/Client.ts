import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

import { CompilationResult } from "@remixproject/plugin-api";
import { BehaviorSubject } from "rxjs";

export class WorkSpacePlugin extends PluginClient {
  callBackEnabled: boolean = true;
  feedback = new BehaviorSubject<string>("");
  accounts = new BehaviorSubject<string[] | undefined>(undefined);
  status = new BehaviorSubject<boolean>(false);
  compilationresult = new BehaviorSubject<any>({});
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
      await me.qr(x);
    });

    this.on("walletconnect" as any, "accountsChanged", async function (x: any) {
      me.accounts.next(x);
      await me.dismiss();
      me.status.next(x.length > 0);
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
      ) => {
        console.log(data);
      }
    );

    this.on("udapp" as any, "deploy", (x: any) => {});

    this.on("udapp" as any, "receipt", (x: any) => {});
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
    console.log("QR ", uri);
    WalletConnectQRCodeModal.open(uri, function () {
      console.log("qr modal done");
    });
  }

  async dismiss() {
    WalletConnectQRCodeModal.close();
  }

  async connect() {
    console.log("connect");
    WalletConnectQRCodeModal.close();

    this.call("walletconnect" as any, "connect");
  }

  async disconnect() {
    console.log("disconnect");
    WalletConnectQRCodeModal.close();
    try {
      await this.call("walletconnect" as any, "disconnect");
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
    } catch (e) {
      this.feedback.next(e)
    }
  }
  async setAccount(account: string){
    await this.call("udapp" as any, "setAccount", account);
  }

  async getAccounts() {
    const accounts = await this.call("udapp" as any, "getAccounts");
    console.log(accounts);
    this.accounts.next(accounts);
    this.status.next(accounts.length > 0);
    this.feedback.next(
      accounts.length > 0 ? "Connected" : "No accounts found."
    );
  }
}
