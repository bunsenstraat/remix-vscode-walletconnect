import React, { useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import { client } from "../App";
const path = require("path");

export interface CompilerInputOptions {
  optimize: boolean | number;
  runs: number;
  libraries?: {
    [fileName: string]: Record<string, string>;
  };
  evmVersion?: EVMVersion;
  language?: Language;
}

type EVMVersion =
  | "homestead"
  | "tangerineWhistle"
  | "spuriousDragon"
  | "byzantium"
  | "constantinople"
  | "petersburg"
  | "istanbul"
  | "muirGlacier"
  | null;
type Language = "Solidity" | "Yul";

interface CurrentFileInterface {
  currentFile: string;
}

const CurrentFile: React.FunctionComponent<CurrentFileInterface> = (props) => {
  const [file, setFile] = React.useState<string>("");
  const [files, setFiles] = React.useState<string[]>([]);

  useEffect(() => {
    setInterval(async () => {
      await updateFile();
    }, 2000);
    updateFile();
  }, []);

  const updateFile = async () => {
    let f = await client.call("fileManager" as any, "getOpenedFiles");
    f = f.filter((x: any) => path.extname(x) === ".sol");
    setFiles(f);
  };

  const compile = async () => {
    let selectedVersion: string = "latest";
    let compilerOpts: CompilerInputOptions = {
      language: "Solidity",
      optimize: false,
      runs: 200,
    };
    console.log(file || files[0]);
    client.call(
      "solidity" as any,
      "compile",
      selectedVersion,
      compilerOpts,
      file || files[0]
    );
  };

  return (
    <>
      <hr></hr>
      <Card>
        <Card.Body>
          <Form.Control
            as="select"
            className="form-control custom-select"
            onChange={(e) => {
              setFile(e.target.value);
            }}
          >
            {files?.map((file, index) => {
              return <option value={file}>{file}</option>;
            })}
          </Form.Control>
          <button
            className="btn btn-primary mt-3 btn-sm small"
            onClick={async () => await compile()}
          >
            Compile
          </button>
        </Card.Body>
      </Card>
    </>
  );
};

export default CurrentFile;
