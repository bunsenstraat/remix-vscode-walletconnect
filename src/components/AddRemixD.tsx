import React from "react";
import {
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { client, useLocalStorage } from "../App";

interface AddRemixDInterface {}

const AddRemixD: React.FunctionComponent<AddRemixDInterface> = (props) => {
  const [atAddress, setAtAddress] = useLocalStorage("remixurl", "https://remix.ethereum.org"); ///React.useState<string>("https://remix.ethereum.org");

  return (
    <>
      <p className="text-center mt-3">
        <small>OR</small>
      </p>
      <InputGroup className="mb-0">
        <Form.Control
          value={atAddress}
          placeholder="https://remix.ethereum.org"
          onChange={(e) => {
            setAtAddress(e.target.value);
          }}
          size="sm"
        />
        <InputGroup.Append>
            <Button variant="primary" size="sm" onClick={async () => {
                await client.addRemixD(atAddress)
            }}>
              <small>Connect</small>
            </Button>
        </InputGroup.Append>
       
      </InputGroup>
      <small>Connect to the Remix Website via Localhost.</small>
    </>
  );
};

export default AddRemixD;
