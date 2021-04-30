import React from "react";
import { Alert, Button, Card, Form, InputGroup } from "react-bootstrap";
import {
  CompilationError,
  CompilationResult,
  IRemixApi,
} from "@remixproject/plugin-api";
import copy from "copy-to-clipboard";
import { AbiInput, AbiItem } from "web3-utils";
import { client } from "../App";
import Method from "./Method";
import { TransactionConfig, TransactionReceipt } from "web3-core";
import { InterfaceContract } from "./Types";
import consolere from "console-remote-client";

function getFunctions(abi: AbiItem[]): AbiItem[] {
  const temp: AbiItem[] = [];
  abi.forEach((element: AbiItem) => {
    if (element.type === "function") {
      temp.push(element);
    }
  });
  return temp;
}

function getArguments(abi: AbiItem | null, args: { [key: string]: string }) {
  const temp: string[] = [];
  if (abi) {
    abi.inputs?.forEach((item: AbiInput) => {
      temp.push(args[item.name]);
    });
  }
  return temp;
}

interface InterfaceProps {
  addNewContract: (contract: InterfaceContract) => void; // for SmartContracts
}

interface CompilationErrorFormatted {
  message: string;
  severity: string;
}

const Compiler: React.FunctionComponent<InterfaceProps> = (props) => {
  const [fileName, setFileName] = React.useState<string>("");
  const [iconSpin, setIconSpin] = React.useState<string>("");
  const [contracts, setContracts] = React.useState<{
    fileName: string;
    data: any;
  }>({
    fileName: "",
    data: {},
  });
  const [contractName, setContractName] = React.useState<string>("");
  const [constructor, setConstructor] = React.useState<AbiItem | null>(null);
  const [args, setArgs] = React.useState<{ [key: string]: string }>({});
  const [address, setAddress] = React.useState<string>("");
  const [errors, setErrors] = React.useState<CompilationErrorFormatted[]>([]);
  const [languageVersion, setLangVersion] = React.useState<string>("");

  const { addNewContract } = props;

  console.log("CONTRACT on LOAD", JSON.stringify(contracts));

  React.useEffect(() => {
    console.log("init");
    async function init() {
      client.on(
        "solidity",
        "compilationFinished",
        (
          fn: string,
          source: any,
          _languageVersion: string,
          data: CompilationResult
        ) => {
          // console.log(fn, source, languageVersion, data);
          //console.log("compile", fn, JSON.stringify(data));
          //sendtolog("compile")
          setLangVersion(_languageVersion);
          if (data.errors) {
            console.log("data.errors", data.errors);
            setErrors(
              data.errors.map((error: CompilationError) => {
                return {
                  message: error.formattedMessage
                    ? error.formattedMessage
                    : JSON.stringify(error),
                  severity: error.severity,
                };
              })
            );
          } else {
            setErrors([]);
          }
          pushContract(data, fn);
        }
      );

      client.on(
        "udapp" as any,
        "receipt",
        function (txReceipt: TransactionReceipt) {
			logContract()
			//sendContracts(txReceipt);
        }
      );
    }
    init();
    // eslint-disable-next-line
  }, []);

  function pushContract(data: CompilationResult, fn: string) {
    if (data.contracts[fn]) {
      console.log("set contract", JSON.stringify({ fileName: fn, data: data.contracts[fn] }));
      setContracts({ fileName: fn, data: data.contracts[fn] });
    } else {
      console.log("contract ", fn, " not found");
    }
    // console.log("CONTRACTs", contracts);
    //select(
    //	Object.keys(data.contracts[fn]).length > 0
    //	  ? Object.keys(data.contracts[fn])[0]
    //	  : "",
    //	data.contracts[fn]
    //  );
  }

  function sendContracts(txReceipt: TransactionReceipt) {
    console.log("RECEIPT2", txReceipt, JSON.stringify(contracts), contractName);
    if (txReceipt && txReceipt.contractAddress) {
      setAddress(txReceipt.contractAddress);
      //console.log("add contract", contractName, txReceipt.contractAddress, getFunctions(contracts.data[contractName].abi))
      //addNewContract({
      //	name: contractName,
      //	address: txReceipt.contractAddress,
      //	abi: getFunctions(contracts.data[contractName].abi),
      // });
    }
  }

  function logContract(){
	  console.log(JSON.stringify(contracts))
  }

  function select(
    name: string,
    newContracts: { [key: string]: any } | null = null
  ) {
    const abi = newContracts
      ? newContracts[name].abi
      : contracts.data[name].abi;
    setContractName(name);
    setConstructor(null);
    setArgs({});
    abi.forEach((element0: AbiItem) => {
      if (element0.type === "constructor") {
        const temp: { [key: string]: string } = {};
        element0.inputs?.forEach((element1: AbiInput) => {
          temp[element1.name] = "";
        });
        setArgs(temp);
        setConstructor(element0);
      }
    });
    //setSelected({ name, address: '', abi: getFunctions(abi) });
  }

  function Contracts() {
    const { data } = contracts;
    const value = contracts.fileName.split("/")[
      contracts.fileName.split("/").length - 1
    ];
    const items = Object.keys(data).map((key) => (
      <option key={key} value={key}>
        {`${key} - ${value}`}
      </option>
    ));
    // <Button
    // 								variant="link"
    // 								size="sm"
    // 								className="mt-0 pt-0 float-right"
    // 								disabled={!address}
    // 								onClick={() => {
    // 									copy(address);
    // 								}}
    // 							>
    // 								<i className="far fa-copy" />
    // 							</Button>
    return (
      <Form>
        <Form.Group>
          <Form.Text className="text-muted">
            <small>CONTRACT</small>
            <Button
              variant="link"
              size="sm"
              className="mt-0 pt-0 float-right"
              disabled={!contracts.data[contractName]}
              onClick={() => {
                if (contracts.data[contractName]) {
                  copy(
                    JSON.stringify(contracts.data[contractName].abi, null, 4)
                  );
                }
              }}
            >
              <i className="far fa-copy" />
            </Button>
            <div style={{ fontSize: "0.9em" }} className="float-right">
              ABI
            </div>
            <Button
              variant="link"
              size="sm"
              className="mt-0 pt-0 float-right"
              disabled={!contracts.data[contractName]}
              onClick={() => {
                if (contracts.data[contractName]) {
                  copy(
                    JSON.stringify(
                      contracts.data[contractName].evm.bytecode.object,
                      null,
                      4
                    )
                  );
                }
              }}
            >
              <i className="far fa-copy" />
            </Button>
            <div style={{ fontSize: "0.9em" }} className="float-right">
              ByteCode
            </div>
          </Form.Text>
          <InputGroup>
            <Form.Control
              as="select"
              value={contractName}
              onChange={(e) => {
                select(e.target.value);
              }}
              className="form-control custom-select"
            >
              {items}
            </Form.Control>
          </InputGroup>
        </Form.Group>
      </Form>
    );
  }

  const onDeploy = async () => {
    const parms: string[] = getArguments(constructor, args);
    console.log(parms);
    console.log(contractName);
    try {
      await client.call("udapp" as any, "deploy", contractName, parms);
    } catch (e) {}
  };

  return (
    <div className="Compiler">
      <hr />
      <Contracts />
      <Card>
        <Card.Header className="p-2">Deploy</Card.Header>
        <Card.Body className="py-1 px-2">
          <Method
            abi={constructor}
            setArgs={(name: string, value: string) => {
              args[name] = value;
            }}
          />
          {errors.map((error, i) => {
            console.log("error", error);
            return (
              <Alert
                key={error.message}
                variant={error.severity === "error" ? "danger" : "warning"}
                onClose={() =>
                  setErrors(
                    errors.filter((_, j) => {
                      return j !== i;
                    })
                  )
                }
                dismissible
                hidden={error.message === ""}
              >
                <small>{error.message}</small>
              </Alert>
            );
          })}
          <InputGroup className="mb-3">
            <InputGroup.Append>
              <Button variant="warning" block size="sm" onClick={onDeploy}>
                <small>Deploy</small>
              </Button>
			  <Button variant="warning" block size="sm" onClick={logContract}>
                <small>log</small>
              </Button>
            </InputGroup.Append>
          </InputGroup>
          <Form.Group>
            <Form.Label>Deployed Contract Address</Form.Label>
            <InputGroup className="mb-3">
              {address !== "" ? (
                <InputGroup.Append>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-0 pt-0 float-right"
                    disabled={!address}
                    onClick={() => {
                      copy(address);
                    }}
                  >
                    <i className="far fa-copy" />
                  </Button>
                </InputGroup.Append>
              ) : null}
              <Form.Control
                value={address}
                placeholder="contract address"
                size="sm"
                readOnly
              />
            </InputGroup>
          </Form.Group>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Compiler;
