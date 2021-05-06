import React from "react";
import "./App.css";
import { WorkSpacePlugin } from "./Client";
import Compiler from "./components/compiler";
import { InterfaceContract, InterfaceReceipt } from "./components/Types";
import { useBehaviorSubject } from "./usesubscribe";
import consolere from 'console-remote-client'
import SmartContracts from "./components/SmartContracts";
import Receipt from "./components/Receipt";
import AtAddress from "./components/AtAddress";
import { Card, Form } from "react-bootstrap";
import Loading from "react-fullscreen-loading";

export const client = new WorkSpacePlugin();
function App() {
  const [contracts, setContracts] = React.useState<InterfaceContract[]>([]);
  const [receipts, setReceipts] = React.useState<InterfaceReceipt[]>([]);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<InterfaceContract | null>(null);
  const accounts = useBehaviorSubject(client.accounts);
  client.accounts.subscribe((x) => {}).unsubscribe();
  const feedback = useBehaviorSubject(client.feedback);
  client.feedback.subscribe((x) => {}).unsubscribe();
  const status = useBehaviorSubject(client.status);
  client.status.subscribe((x) => {}).unsubscribe();
  const contractsRef = React.useRef(contracts)
  const receiptRef = React.useRef(receipts)

  React.useEffect(
    () => {
      console.log("update contracts", contracts)
      contractsRef.current = contracts;
    },
    [contracts]
  )

  React.useEffect(
		() => {
			receiptRef.current = receipts;
		},
		[receipts]
	)


  function addNewContract(contract: InterfaceContract) {
    console.log("add contract APP", contract, contractsRef.current)
    setContracts(contractsRef.current.concat([contract]));
  }

  function addReceipt(receipt: InterfaceReceipt){
    setReceipts(receiptRef.current.concat([receipt]))
  }

  function clearOutput(){
    receiptRef.current = []
    setReceipts([])
  }

  console.log("app contracts ", contractsRef.current)

  return (
    <div className="App">
      <div className="container">
      <Loading loading={busy} background="#000000" loaderColor="#ffffff" />
      <div className="text-muted text-left">
            <small>Connection</small>
</div>
        <Card>
          <Card.Body>
          {status ? (
            <button
            className="btn btn-primary mb-3 btn-sm small"
              onClick={async () => await client.disconnect()}
            >
              <i className="fas fa-unlink mr-2"></i>Disconnect from wallet
            </button>
          ) : (
            <button
              className="btn btn-primary mb-3 btn-sm small"
              onClick={async () => await client.connect()}
            >
              <i className="fas fa-link mr-2"></i>
              Connect to wallet
            </button>
          )}

          {status ? (
            <>
              <br></br>
              <small>Connected accounts</small>
            </>
          ) : (
            <></>
          )}
          {accounts?.map((account, index) => {
            return (
              <div id="acc-{index}" className="small">
                {account}
              </div>
            );
          })}
          <br></br>
          <div className="small">{feedback}</div>
          </Card.Body>
        </Card>
        {status ? (
          <>
        <Compiler setBusy={setBusy} setSelected={setSelected} addNewContract={addNewContract}></Compiler>
        <AtAddress busy={false} selected={selected} addNewContract={addNewContract}></AtAddress>
        <SmartContracts
          addReceipt={addReceipt}
					busy={busy}
					setBusy={setBusy}
					// blockscout={blockscout}
					contracts={contracts}
				/>
         <Receipt clearOutput={clearOutput} receipts={receipts}></Receipt></>
        ):<></>}
      </div>
    </div>
  );
}

export default App;
