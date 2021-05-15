import React from "react";
import {
  Alert,
  Accordion,
  Button,
  Card,
  Form,
  InputGroup,
} from "react-bootstrap";
import copy from "copy-to-clipboard";
import { CSSTransition } from "react-transition-group";
import { AbiInput, AbiItem } from "web3-utils";
// import { MoonbeamLib } from '@dexfair/moonbeamLib-web-signer';
import { client } from "../App";
import { InterfaceContract, InterfaceReceipt } from "./Types";
import Method from "./Method";
import "./animation.css";

const EMPTYLIST = "Currently you have no contract instances to interact with.";

interface InterfaceDrawMethodProps {
  busy: boolean;
  setBusy: (state: boolean) => void;
  abi: AbiItem;
  address: string;
  addReceipt: (receipt: InterfaceReceipt) => void;
  contractName: string;
}
function buttonVariant(stateMutability: string | undefined): string {
  switch (stateMutability) {
    case "view":
    case "pure":
      return "primary";
    case "nonpayable":
      return "warning";
    case "payable":
      return "danger";
    default:
      break;
  }
  return "";
}

const DrawMethod: React.FunctionComponent<InterfaceDrawMethodProps> = (
  props
) => {
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const [value, setValue] = React.useState<string>("");
  const [args, setArgs] = React.useState<{ [key: string]: string }>({});
  const { busy, setBusy, abi, address, addReceipt, contractName } = props;

  React.useEffect(() => {
    const temp: { [key: string]: string } = {};
    abi.inputs?.forEach((element: AbiInput) => {
      temp[element.name] = "";
    });
    setArgs(temp);
  }, [abi.inputs]);

  return (
    <>
      <Method
        abi={abi}
        setArgs={(name: string, value2: string) => {
          args[name] = value2;
        }}
      />
      <Alert
        variant="danger"
        onClose={() => setError("")}
        dismissible
        hidden={error === ""}
      >
        <small>{error}</small>
      </Alert>
      <Alert
        variant="success"
        onClose={() => setSuccess("")}
        dismissible
        hidden={success === ""}
      >
        <small>{success}</small>
      </Alert>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <Button
            variant={buttonVariant(abi.stateMutability)}
            block
            size="sm"
            onClick={async () => {
              setBusy(true);
              const parms: string[] = [];
              abi.inputs?.forEach((item: AbiInput) => {
                parms.push(args[item.name]);
              });
              console.log(parms);
              //
              try {
				setError("")
                let receiptData = await client.call(
                  "udapp" as any,
                  "send",
                  abi,
                  parms,
                  address
                );
                const receipt: InterfaceReceipt = {
                  contract: contractName,
                  contractAddress: address,
                  method: abi.name || "unknown",
                  receipt: receiptData,
                };
                addReceipt(receipt);
              } catch (e) {
                setError(e.toString());
              }
              setBusy(false);
            }}
          >
            <small>
              {abi.stateMutability === "view" || abi.stateMutability === "pure"
                ? "call"
                : "transact"}
            </small>
          </Button>
          <Button
            variant={buttonVariant(abi.stateMutability)}
            size="sm"
            className="mt-0 pt-0 float-right"
            onClick={() => {
              if (abi.name) {
                try {
                  const parms: string[] = [];
                  abi.inputs?.forEach((item: AbiInput) => {
                    if (args[item.name]) {
                      parms.push(args[item.name]);
                    }
                  });
                  console.log(parms);
                  console.log(abi.name);
                  console.log(address);
                  console.log(abi);
                } catch (e) {
                  console.log(e.toString());
                }
              }
            }}
          >
            <i className="far fa-copy" />
          </Button>
        </InputGroup.Prepend>
        <Form.Control
          value={value}
          size="sm"
          readOnly
          hidden={
            !(abi.stateMutability === "view" || abi.stateMutability === "pure")
          }
        />
      </InputGroup>
    </>
  );
};

export default DrawMethod;
