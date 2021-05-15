import React from "react";
import {
  Alert,
  Accordion,
  Button,
  Card,
  Form,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { client } from "../App";

interface AtNetWorkInterface {}

const AddNetwork: React.FunctionComponent<AtNetWorkInterface> = (props) => {
  const [atAddress, setAtAddress] = React.useState<string>("http://127.0.0.1:7545");

  return (
    <>
      <p className="text-center mt-3">
        <small>OR</small>
      </p>
      <InputGroup className="mb-3">
        <Form.Control
          value={atAddress}
          placeholder="network url, ie Ganache http://127.0.0.1:7545"
          onChange={(e) => {
            setAtAddress(e.target.value);
          }}
          size="sm"
        />
        <InputGroup.Append>
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id="overlay-ataddresss">
                Add a custom network ie Ganache
              </Tooltip>
            }
          >
            <Button variant="primary" size="sm" onClick={async () => {
                await client.addNetwork(atAddress)
            }}>
              <small>Connect</small>
            </Button>
          </OverlayTrigger>
        </InputGroup.Append>
       
      </InputGroup>
      <small>Connect to a custom network, for example Ganache.</small>
    </>
  );
};

export default AddNetwork;
