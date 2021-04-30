import React from 'react';
import { Alert, Accordion, Button, Card, Form, InputGroup } from 'react-bootstrap';
import copy from 'copy-to-clipboard';
import { CSSTransition } from 'react-transition-group';
import { AbiInput, AbiItem } from 'web3-utils';
// import { MoonbeamLib } from '@dexfair/moonbeamLib-web-signer';

import { InterfaceContract } from './Types';
import Method from './Method';
import './animation.css';

const EMPTYLIST = 'Currently you have no contract instances to interact with.';

interface InterfaceDrawMethodProps {
	busy: boolean;
	setBusy: (state: boolean) => void;
	abi: AbiItem;
	address: string;
}
function buttonVariant(stateMutability: string | undefined): string {
	switch (stateMutability) {
		case 'view':
		case 'pure':
			return 'primary';
		case 'nonpayable':
			return 'warning';
		case 'payable':
			return 'danger';
		default:
			break;
	}
	return '';
}

const DrawMethod: React.FunctionComponent<InterfaceDrawMethodProps> = (props) => {
	const [error, setError] = React.useState<string>('');
	const [success, setSuccess] = React.useState<string>('');
	const [value, setValue] = React.useState<string>('');
	const [args, setArgs] = React.useState<{ [key: string]: string }>({});
	const { busy, /* setBusy, */ abi, address } = props;

	React.useEffect(() => {
		const temp: { [key: string]: string } = {};
		abi.inputs?.forEach((element: AbiInput) => {
			temp[element.name] = '';
		});
		setArgs(temp);
	}, [abi.inputs]);

	return (
		<>
			<Method
				abi={abi}
				setArgs={(name: string, value2: string) => {
					args[name] = value2;
				}}
			/>
			<Alert variant="danger" onClose={() => setError('')} dismissible hidden={error === ''}>
				<small>{error}</small>
			</Alert>
			<Alert variant="success" onClose={() => setSuccess('')} dismissible hidden={success === ''}>
				<small>{success}</small>
			</Alert>
			<InputGroup className="mb-3">
				<InputGroup.Prepend>
					<Button
						variant={buttonVariant(abi.stateMutability)}
						block
						size="sm"
						onClick={async () => {
							// setBusy(true)
							const parms: string[] = [];
							abi.inputs?.forEach((item: AbiInput) => {
								parms.push(args[item.name]);
							});
							
							// setBusy(false)
						}}
					>
						<small>{abi.stateMutability === 'view' || abi.stateMutability === 'pure' ? 'call' : 'transact'}</small>
					</Button>
					<Button
						variant={buttonVariant(abi.stateMutability)}
						size="sm"
						className="mt-0 pt-0 float-right"
						onClick={() => {
							if (abi.name) {
								try {
									const parms: string[] = [];
									abi.inputs?.forEach((item: AbiInput) => {
										if (args[item.name]) {
											parms.push(args[item.name]);
										}
									});
									
								} catch (e) {
									console.log(e.toString());
								}
							}
						}}
					>
						<i className="far fa-copy" />
					</Button>
				</InputGroup.Prepend>
				<Form.Control
					value={value}
					size="sm"
					readOnly
					hidden={!(abi.stateMutability === 'view' || abi.stateMutability === 'pure')}
				/>
			</InputGroup>
		</>
	);
};

const ContractCard: React.FunctionComponent<{
	busy: boolean;
	setBusy: (state: boolean) => void;
	// blockscout: string;
	contract: InterfaceContract;
	index: number;
	remove: () => void;
}> = (props) => {
	const [enable, setEnable] = React.useState<boolean>(true);
	const {
		busy,
		setBusy,
		// blockscout,
		contract,
		index,
		remove,
	} = props;

	const colors: { [key: string]: string } = {
		primary: '#007aa6', // '#007bff',
		warning: '#c97539', // '#ffc107',
		danger: '#dc3545',
	};

	function DrawMethods() {
		const list = contract.abi ? contract.abi : [];
		const items = list.map((abi: AbiItem, id: number) => (
			<Accordion key={`Methods_A_${index.toString()}`}>
				<Card>
					<Accordion.Toggle
						style={{ color: 'white', backgroundColor: colors[buttonVariant(abi.stateMutability)] }}
						as={Card.Header}
						eventKey={`Methods_${id}`}
						className="p-1  custom-select"
					>
						<small>{abi.name}</small>
					</Accordion.Toggle>
					<Accordion.Collapse eventKey={`Methods_${id}`}>
						<Card.Body className="py-1 px-2">
							<DrawMethod
								busy={busy}
								setBusy={setBusy}
								abi={abi}
								address={contract.address}
							/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
		));
		console.log(items);
		return <>{items}</>;
	}

	return (
		<CSSTransition in={enable} timeout={300} classNames="zoom" unmountOnExit onExited={remove}>
			<Card className="mb-2">
				<Accordion.Toggle as={Card.Header} eventKey="0" className="px-2 py-1 form-control custom-select">
					<strong className="align-middle">{contract.name}</strong>
					&nbsp;
					<small className="align-middle">{`${contract.address.substring(0, 6)}...${contract.address.substring(
						38
					)}`}</small>
					<Button
						variant="link"
						size="sm"
						className="float-left align-middle"
						onClick={() => {
							copy(contract.address);
						}}
					>
						<i className="far fa-copy" />
					</Button>
					<Button
						className="float-left align-middle"
						size="sm"
						variant="link"
						onClick={() => {
							setEnable(false);
						}}
					>
						<i className="fas fa-trash-alt" />
					</Button>
				</Accordion.Toggle>
				<Accordion.Collapse eventKey="0">
					<Card.Body>{DrawMethods()} </Card.Body>
				</Accordion.Collapse>
			</Card>
		</CSSTransition>
	);
};

interface InterfaceSmartContractsProps {
	busy: boolean;
	setBusy: (state: boolean) => void;
	// blockscout: string;
	contracts: InterfaceContract[];
}

const SmartContracts: React.FunctionComponent<InterfaceSmartContractsProps> = (props) => {
	const [error, setError] = React.useState<string>('');
	const [count, setCount] = React.useState<number>(0);
	const {
		busy,
		setBusy,
		// blockscout,
		contracts,
	} = props;

	React.useEffect(() => {
		setCount(0);
		setError(EMPTYLIST);
	}, [contracts, busy]);

	function DrawContracts() {
		const items = contracts.map((data: InterfaceContract, index: number) => (
			<ContractCard
				busy={busy}
				setBusy={setBusy}
				// blockscout={blockscout}
				contract={data}
				index={index}
				remove={() => {
					setCount(count + 1);
					setError(EMPTYLIST);
				}}
				key={`Contract_${index.toString()}`}
			/>
		));
		return <Accordion defaultActiveKey="0">{items}</Accordion>;
	}

	return (
		<div className="SmartContracts">
			<Alert variant="warning" className="text-center" hidden={contracts.length !== count}>
				<small>{error}</small>
			</Alert>
			{DrawContracts()}
		</div>
	);
};

export default SmartContracts;
