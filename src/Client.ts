import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import consolere from "console-remote-client";
import {
  CompilationError,
  CompilationResult,
  IRemixApi,
} from "@remixproject/plugin-api";
import { BehaviorSubject } from "rxjs";
import { TransactionReceipt } from "web3-core";
export class WorkSpacePlugin extends PluginClient {
  callBackEnabled: boolean = true;
  feedback = new BehaviorSubject<string>("");
  accounts = new BehaviorSubject<string[]>([""]);
  status = new BehaviorSubject<boolean>(false);
  compilationresult = new BehaviorSubject<any>({});
  constructor() {
    super();

    console.log("CONSTRUCTOR");
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
    console.log("set listeners");
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
      me.accounts.next([""]);
      me.status.next(false);
    });

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

    this.on(
      "udapp" as any,
      "receipt",
      function (receipt: TransactionReceipt) {
        //console.log("RECEIPT", receipt);
      }
    );
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

    this.call("walletconnect" as any, "disconnect");
  }
}
