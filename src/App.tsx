import React, { useState } from "react";
import "./App.css";
import { WorkSpacePlugin } from "./Client";
import Compiler from "./components/compiler";
import { InterfaceContract, InterfaceReceipt } from "./components/Types";
import { useBehaviorSubject } from "./usesubscribe";
import SmartContracts from "./components/SmartContracts";
import Receipt from "./components/Receipt";
import AtAddress from "./components/AtAddress";
import CurrentFile from './components/CurrentFile'
import { Alert, Button, Card, Form } from "react-bootstrap";
import Loading from "react-fullscreen-loading";
import AddNetwork from "./components/AddNetwork";
import AddRemixD from "./components/AddRemixD";

export const client = new WorkSpacePlugin();
function App() {
  //const [contracts, setContracts] = React.useState<InterfaceContract[]>([]);
  const [contracts, setContracts] = useLocalStorage("contracts", []);
  const [receipts, setReceipts] = useLocalStorage("receipts", []); //React.useState<InterfaceReceipt[]>([]);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<InterfaceContract | null>(
    null
  );
  const accounts = useBehaviorSubject(client.accounts);
  client.accounts.subscribe((x) => {}).unsubscribe();
  const feedback = useBehaviorSubject(client.feedback);
  client.feedback.subscribe((x) => {}).unsubscribe();
  const status = useBehaviorSubject(client.status);
  client.status.subscribe((x) => { }).unsubscribe();
  const network = useBehaviorSubject(client.networkname);
  client.networkname.subscribe((x) => {}).unsubscribe();
  const remixdstatus = useBehaviorSubject(client.remixdStatus);
  client.remixdStatus.subscribe((x) => {}).unsubscribe();
  const contractsRef = React.useRef(contracts);
  const receiptRef = React.useRef(receipts);

  React.useEffect(() => {
    contractsRef.current = contracts;
  }, [contracts]);

  React.useEffect(() => {
    receiptRef.current = receipts;
  }, [receipts]);

  function addNewContract(contract: InterfaceContract) {
    if (
      contractsRef.current.findIndex(
        (el: InterfaceContract) => el.address === contract.address
      ) === -1
    )
      setContracts(contractsRef.current.concat([contract]));
  }

  function removeContract(contract: InterfaceContract) {
    let c = [...contracts];
    c = c.filter((x: InterfaceContract) => {
      return x.address !== contract.address;
    });
    setContracts(c);
  }

  function addReceipt(receipt: InterfaceReceipt) {
    setReceipts(receiptRef.current.concat([receipt]));
  }

  function clearOutput() {
    receiptRef.current = [];
    setReceipts([]);
  }

  async function refreshAccounts(){
    await client.getAccounts();
  }

  return (
    <div className="App">
      <div className="container">
        <Loading loading={busy} background="#000000" loaderColor="#ffffff" />
        <div className=" text-left">
          <small>Connection</small>
 
        </div>
        <Card>
          <Card.Body>
            {status ? (
              <button
                className="btn btn-primary mb-0 btn-sm small"
                onClick={async () => await client.disconnect()}
              >
                <i className="fas fa-unlink mr-2"></i>Disconnect
              </button>
            ) : (
              <>
                <h5>Connect to a network to deploy</h5>
                <AddNetwork></AddNetwork>
                <AddRemixD></AddRemixD>
                <hr></hr>
                <Button variant="primary" size="sm" 
                  onClick={async () => await client.connectWallet()}
                >
                  <i className="fas fa-link mr-2"></i>
                  Connect to Wallet Connect
                </Button>
                <hr></hr>
              </>
            )}

            {status ? (
              <>
                <br></br>
                <small>Connected accounts</small>
              </>
            ) : (
              <>
                  {remixdstatus == 1? <>Remixd is waiting for a connection...</>:<></>}
                  {remixdstatus == 2? <>Remixd is connected</>:<></>}
              </>
            )}
            {accounts && accounts?.length > 0 ? (
              <Form.Group controlId="exampleForm.ControlSelect1">
                <Form.Label>Select Account</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => {
                    client.setAccount(e.target.value);
                  }}
                >
                  {accounts?.map((account, index) => {
                    return <option key={index} value={account}>{account}</option>;
                  })}
                </Form.Control>
                <Button onClick={async()=>{ await refreshAccounts()}} className='mt-1' size='sm'>Refresh accounts</Button>
              </Form.Group>
            ) : (
              <></>
            )}

            <br></br>
            <Alert variant='secondary'>{feedback}</Alert>
          </Card.Body>
        </Card>
        {status ? (
          <>
            <CurrentFile currentFile=""></CurrentFile>
            <Compiler
              setBusy={setBusy}
              setSelected={setSelected}
              addNewContract={addNewContract}
            ></Compiler>
            <AtAddress
              busy={false}
              selected={selected}
              addNewContract={addNewContract}
            ></AtAddress>
            <SmartContracts
              addReceipt={addReceipt}
              busy={busy}
              setBusy={setBusy}
              remove={removeContract}
              // blockscout={blockscout}
              contracts={contracts}
            />
            <Receipt clearOutput={clearOutput} receipts={receipts}></Receipt>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default App;

// Hook
export const useLocalStorage = (key: string, initialValue: any) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<any>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: any | ((val: any) => any)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
};
