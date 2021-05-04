import React from "react";
import { Alert, Button, Card, Form, InputGroup } from "react-bootstrap";
import {
  CompilationError,
  CompilationResult,
} from "@remixproject/plugin-api";
import copy from "copy-to-clipboard";
import { AbiInput, AbiItem } from "web3-utils";
import { client } from "../App";
import Method from "./Method";
import { InterfaceContract } from "./Types";


console.log("test")


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
  setSelected: (select: InterfaceContract) => void; // for At Address
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
  const contractsRef = React.useRef(contracts)
  const constractNameRef = React.useRef(contractName)

  const { addNewContract, setSelected } = props;

  //console.log("CONTRACTS on LOAD", JSON.stringify(contractsRef.current));

  React.useEffect(() => {
    console.log("init compiler");
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
          //setLangVersion(_languageVersion);
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
        "deploy",
        async (
          x: any
        ) => {
          console.log(x)
          sendContracts(x)
          //logContract()
        }
      );
      client.on(
        "fileManager",
        "currentFileChanged",
        async (
          x: any
        ) => {
          //console.clear()
          let tx: any = {
            contractAddress: '0x1234'
          }
          sendContracts(tx)
          //logContract()
        }
      );
    }
    init();
    // eslint-disable-next-line
  }, []);

  React.useEffect(
    () => {
      console.log("update contracts", contracts)
      contractsRef.current = contracts;
    },
    [contracts]
  )

  React.useEffect(
    () => {
      console.log("update name", contractName)
      constractNameRef.current = contractName;
    },
    [contractName]
  )



  function pushContract(data: CompilationResult, fn: string) {
    if (data.contracts[fn]) {
      //console.log("set contract", JSON.stringify({ fileName: fn, data: data.contracts[fn] }));
      setContracts({ fileName: fn, data: data.contracts[fn] });
    } else {
      console.log("contract ", fn, " not found");
    }
    // console.log("CONTRACTs", contracts);
    select(
      Object.keys(data.contracts[fn]).length > 0
        ? Object.keys(data.contracts[fn])[0]
        : "",
      data.contracts[fn]
    );
  }

  function sendContracts(txReceipt: any) {
    //console.log("send contracts", txReceipt, JSON.stringify(contractsRef.current), constractNameRef.current);
    if (contractsRef.current.data && contractsRef.current.data[constractNameRef.current]) {
      if (txReceipt && txReceipt.contractAddress) {
        console.log("add contract?", contractsRef.current, constractNameRef.current, getFunctions(contractsRef.current.data[constractNameRef.current].abi))
        setAddress(txReceipt.contractAddress);
        //console.log("add contract", constractNameRef.current, txReceipt.contractAddress,getFunctions(contractsRef.current.data[contractName].abi))
        addNewContract({
          name: constractNameRef.current,
          address: txReceipt.contractAddress,
          abi: getFunctions(contractsRef.current.data[constractNameRef.current].abi),
        });
      }
    }
  }

  function select(
    name: string,
    newContracts: { [key: string]: any } | null = null
  ) {
    const abi = newContracts
      ? newContracts[name].abi
      : contracts.data[name].abi;
    console.log("select contract", name)
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
    setSelected({ name, address: '', abi: getFunctions(abi) });
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

    return (
      <Form>
        <Form.Group>
          <Form.Text className="text-muted text-left">
            <small>CONTRACT</small>
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
    } catch (e) { }
  };

  return (
    <div className="Compiler">
      <hr />
      <Contracts />
      <Card>
        <Card.Header className="p-2 small">Deploy</Card.Header>
        <Card.Body className="py-1 px-2">
          <Method
            abi={constructor}
            setArgs={(name: string, value: string) => {
              args[name] = value;
            }}
          />
          {errors.map((error, i) => {
            //console.log("error", error);
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
