import React from "react";
import { Alert, Button, Card, InputGroup } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import {
  CompilationError,
  CompilationResult,
} from "@remixproject/plugin-api";
import copy from "copy-to-clipboard";
import { AbiInput, AbiItem } from "web3-utils";
import { client } from "../App";
import Method from "./Method";
import { InterfaceContract } from "./Types";
import { useBehaviorSubject } from "../usesubscribe";

const valueItems = ['wei','gwei','finney','ether'].map((key) => (
  <option key={key} value={key}>
    {`${key}`}
  </option>
));

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
  setBusy: (state: boolean) => void;
}

interface CompilationErrorFormatted {
  message: string;
  severity: string;
}

const Compiler: React.FunctionComponent<InterfaceProps> = (props) => {
  const [fileName, setFileName] = React.useState<string>("");
  const [iconSpin, setIconSpin] = React.useState<string>("");
  const [valueType, setValueType] = React.useState<string>("wei");

  const [gasLimit, setGasLimit] = React.useState<string>("3000000");
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
  const contractsRef = React.useRef(contracts)
  const constractNameRef = React.useRef(contractName)

  const { addNewContract, setSelected } = props;

  const valueAmount = useBehaviorSubject(client.valueAmount);
  client.accounts.subscribe((x) => {}).unsubscribe();

  React.useEffect(() => {
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
          sendContracts(x.receipt, x.contractName,x.abi)
          //logContract()
        }
      );
    }
    init();
    // eslint-disable-next-line
  }, []);

  React.useEffect(
    () => {
      contractsRef.current = contracts;
    },
    [contracts]
  )

  React.useEffect(
    () => {
      constractNameRef.current = contractName;
    },
    [contractName]
  )



  function pushContract(data: CompilationResult, fn: string) {
    if (data.contracts[fn]) {
      setContracts({ fileName: fn, data: data.contracts[fn] });
    } else {
    }
    select(
      Object.keys(data.contracts[fn]).length > 0
        ? Object.keys(data.contracts[fn])[0]
        : "",
      data.contracts[fn]
    );
  }

  function sendContracts(txReceipt: any, name: string, abi: any) {
    if (contractsRef.current.data && contractsRef.current.data[constractNameRef.current]) {
      if (txReceipt && txReceipt.contractAddress) {
         setAddress(txReceipt.contractAddress);
        addNewContract({
          name: name,
          address: txReceipt.contractAddress,
          abi: getFunctions(abi),
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
          <Form.Text className=" text-left">
            <small>CONTRACT</small>
            <Button
							variant="link"
							size="sm"
							className="mt-0 pt-0 float-right"
							disabled={!contracts.data[contractName]}
							onClick={() => {
								if (contracts.data[contractName]) {
									copy(JSON.stringify(contracts.data[contractName].abi, null, 4));
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
              className="valueselect form-control custom-select"
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
    props.setBusy(true)
    try {
      setErrors([])
      await client.call("udapp" as any, "deploy", contractName, parms);
      
    } catch (e) { 
      setErrors([{
        message: e.toString(),
        severity: "error"
      }])
      props.setBusy(false)
    }
    props.setBusy(false)
  };

  const changeValueType = function(valueType: string){
    console.log(valueType);
    setValueType(valueType)
    client.valueType = valueType;
  }

  const changeValueAmount = function(valueAmount: string){
    console.log(valueAmount);
    client.valueAmount.next(valueAmount)
  }

  const changeGasLimit = function(gas: string){
    console.log(gas);
    setGasLimit(gas)
    client.gaslimit = gas;
  }


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
            <InputGroup.Prepend>
              <InputGroup.Text className='small' id="basic-addon3">
              <small>Gas limit</small>
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control size='sm' onChange={(e)=>changeGasLimit(e.target.value)} value={gasLimit} id="gaslimit" aria-describedby="basic-addon3" />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Text className='small' id="basic-addon3">
              <small>Value</small>
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control onChange={(e)=>changeValueAmount(e.target.value)} value={valueAmount} id="value" aria-describedby="basic-addon3" />
            <InputGroup.Append>
            <Form.Control
              as="select"
              onChange={(e) => {
                changeValueType(e.target.value);
              }}
              className="form-control custom-select"
            >
              {valueItems}
            </Form.Control>
            </InputGroup.Append>
          </InputGroup>
          <InputGroup className="mb-0">
            <InputGroup.Append>
              <Button variant="warning" block size="sm" onClick={onDeploy}>
                <small>Deploy</small>
              </Button>
              
            </InputGroup.Append>
          </InputGroup>
          <Form.Group>
            <Form.Label>Deployed Contract Address</Form.Label>
            <InputGroup className="mb-0">
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
