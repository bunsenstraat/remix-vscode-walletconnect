import React, { useState } from "react";
import "./Receipt.css";
import { Button, Card, Collapse } from "react-bootstrap";
import copy from "copy-to-clipboard";
import { InterfaceReceipt } from "./Types";

import { client } from "../App";
interface ReceiptItemProps {
  receipt: InterfaceReceipt;
  index: number;
}

const ReceiptItem: React.FunctionComponent<ReceiptItemProps> = (props) => {
  const [open, setOpen] = useState(false);

  async function debug(hash: string){
    await client.call("manager", "activatePlugin", "debugger");
    await client.call("debugger" as any, "debug", hash);
  }

  const render = (r: InterfaceReceipt) => {
    if (typeof r.receipt === "object") {
      return (
        <>
          {Object.entries(r.receipt).map((a, ai) => (
            <div
              id={`receipt_item_${ai}`}
              key={`receipt_item_${ai}`}
              className=""
            >
              {a.map((x, i) => (
                <div className="row pl-3">
                  <div
                    className={`col text-left small ${
                      i === 0 ? "underline" : ""
                    }`}
                  >
                    {JSON.stringify(x).replaceAll('"', "").toUpperCase()}
                    {i > 0 ? (
                      <>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-0 pt-0 float-right btn"
                          onClick={() => {
                            copy(JSON.stringify(x).replaceAll('"', ""));
                          }}
                        >
                          <i className="far fa-copy" />
                        </Button>
                      </>
                    ) : (
                      ""
                    )}
                    {/* {JSON.stringify(x)
                      .replaceAll('"', "")
                      .toLowerCase()
                      .includes("transactionhash") ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-0 pt-0 float-right btn"
                        onClick={() => {
                          debug(JSON.stringify(x).replaceAll('"', ""));
                        }}
                      >
                        <i className="fas fa-bug" />
                      </Button>
                    ) : (
                      <></>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      );
    } else {
      return (
        <div className="row pl-3">
          <div className="col text-left small">
            <Button
              variant="link"
              size="sm"
              className="mt-0 pt-0 float-right btn"
              onClick={() => {
                copy(JSON.stringify(r.receipt).replaceAll('"', ""));
              }}
            >
              <i className="far fa-copy" />
            </Button>
            {JSON.stringify(r.receipt).replaceAll('"', "")}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <Card.Body className="py-1 px-2 small">
        <div>
          <div
            onClick={() => setOpen(!open)}
            aria-controls={`receipt_collapse_${props.index}`}
            aria-expanded={open}
            className="small underline point text-muted"
          >
            {`Run ${props.receipt.method} at ${props.receipt.contractAddress} on ${props.receipt.contract}`}
            <i hidden={open} className="ml-2 fas fa-caret-down" />
            <i hidden={!open} className="ml-2 fas fa-caret-up" />
          </div>

          <Collapse in={open}>
            <div className="mt-2" id={`receipt_collapse_${props.index}`}>
              {render(props.receipt)}
            </div>
          </Collapse>
        </div>
        <hr></hr>
      </Card.Body>
    </>
  );
};

export default ReceiptItem;
