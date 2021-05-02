import React from "react";
import "./App.css";
import { WorkSpacePlugin } from "./Client";
import Compiler from "./components/compiler";
import { InterfaceContract } from "./components/Types";
import { useBehaviorSubject } from "./usesubscribe";
import consolere from 'console-remote-client'
import SmartContracts from "./components/SmartContracts";
import Receipt from "./components/Receipt";

export const client = new WorkSpacePlugin();
function App() {
  const [contracts, setContracts] = React.useState<InterfaceContract[]>([]);
  const [busy, setBusy] = React.useState<boolean>(false);
  const accounts = useBehaviorSubject(client.accounts);
  client.accounts.subscribe((x) => {}).unsubscribe();
  const feedback = useBehaviorSubject(client.feedback);
  client.feedback.subscribe((x) => {}).unsubscribe();
  const status = useBehaviorSubject(client.status);
  client.status.subscribe((x) => {}).unsubscribe();
  const contractsRef = React.useRef(contracts)


  React.useEffect(
    () => {
      console.log("update contracts", contracts)
      contractsRef.current = contracts;
    },
    [contracts]
  )


  function addNewContract(contract: InterfaceContract) {
    console.log("add contract APP", contract, contractsRef.current)
    setContracts(contractsRef.current.concat([contract]));
  }

  console.log("app contracts ", contractsRef.current)

  return (
    <div className="App">
      <div className="container">
        <div className="form-group mt-3">
          {status ? (
            <button
              className="btn btn-primary  btn-block {status}"
              onClick={async () => await client.disconnect()}
            >
              disconnect from wallet
            </button>
          ) : (
            <button
              className="btn btn-primary  btn-block mb-3"
              onClick={async () => await client.connect()}
            >
              Connect to wallet
            </button>
          )}

          {status ? (
            <>
              <br></br>
              <h5>Connected accounts</h5>
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
        </div>
        <Compiler addNewContract={addNewContract}></Compiler>
        <Receipt></Receipt>
        <SmartContracts
					busy={busy}
					setBusy={setBusy}
					// blockscout={blockscout}
					contracts={contracts}
				/>
      </div>
    </div>
  );
}

export default App;
