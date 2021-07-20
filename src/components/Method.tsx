import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { AbiInput, AbiItem } from 'web3-utils';

interface InterfaceProps {
	abi: AbiItem | null;
	setArgs: (name: string, value: string) => void;
}

const Method: React.FunctionComponent<InterfaceProps> = (props) => {
	const [inputs, setInputs] = React.useState<AbiInput[]>([]);
	const { abi, setArgs } = props;

	React.useEffect(() => {
		setInputs(abi && abi.inputs ? abi.inputs : []);
	}, [abi]);

	function DrawInputs() {
		const items = inputs.map((item: AbiInput, index: number) => (
			<Form.Group className="mb-0 mt-0" as={Row} key={index.toString()}>
				<Col className="text-right" sm="4">
					{item.name}
				</Col>
				<Col sm="8">
				<Form.Control
					type="text"
					size="sm"
					className='inputfields'
					name={item.name}
					placeholder={item.type}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						if (event.target.value[0] === '[') {
							setArgs(event.target.name, JSON.parse(event.target.value));
						} else {
							setArgs(event.target.name, event.target.value);
						}
					}}
				/>
				</Col>
			</Form.Group>
		));
		return <Form.Group>{items}</Form.Group>;
	}

	return <Form className="Method">{DrawInputs()}</Form>;
};

export default Method;
