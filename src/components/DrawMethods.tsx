import React from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { AbiInput, AbiItem } from "web3-utils";
// import { MoonbeamLib } from '@dexfair/moonbeamLib-web-signer';
import { client } from "../App";
import { InterfaceReceipt } from "./Types";
import Method from "./Method";
import "./animation.css";


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
      <div className='text-primary text-left font-weight-bold mb-1'><u>
        {abi.stateMutability === "view" || abi.stateMutability === "pure"
          ? abi.name
          : abi.name}
      </u>
      </div>
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
      <Form.Group className="mb-0 mt-0" as={Row}>
        <Col className="text-left" sm="4">

        </Col>
        <Col sm="8">
          <Button
            variant={buttonVariant(abi.stateMutability)}
            block
            size="sm"
            className="w-100"
            onClick={async () => {
              setBusy(true);
              const parms: string[] = [];
              abi.inputs?.forEach((item: AbiInput) => {
                parms.push(args[item.name]);
              });
              //
              try {
                setError("")
                let receiptData = await client.send(
                  abi,
                  parms,
                  address,
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
                ? 'CALL'
                : 'TRANSACT'}
            </small>
          </Button>
        </Col>
      </Form.Group>
      <hr></hr>
    </>
  );
};

export default DrawMethod;
