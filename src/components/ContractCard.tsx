import React from 'react';
import { Alert, Accordion, Button, Card, Form, InputGroup } from 'react-bootstrap';
import copy from 'copy-to-clipboard';
import { CSSTransition } from 'react-transition-group';
import { AbiInput, AbiItem } from 'web3-utils';
// import { MoonbeamLib } from '@dexfair/moonbeamLib-web-signer';
import DrawMethod from './DrawMethods'
import { InterfaceContract, InterfaceReceipt } from './Types';
import Method from './Method';
import './animation.css';

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

const ContractCard: React.FunctionComponent<{
	busy: boolean;
	setBusy: (state: boolean) => void;
	// blockscout: string;
	contract: InterfaceContract;
	index: number;
	remove: () => void;
	addReceipt: (receipt: InterfaceReceipt) => void;
}> = (props) => {
	const [enable, setEnable] = React.useState<boolean>(true);
	const {
		busy,
		setBusy,
		// blockscout,
		contract,
		index,
		remove,
		addReceipt
	} = props;

	const colors: { [key: string]: string } = {
		primary: '#007aa6', // '#007bff',
		warning: '#c97539', // '#ffc107',
		danger: '#dc3545',
	};

	function DrawMethods() {
		const list = contract.abi ? contract.abi : [];
		const items = list.map((abi: AbiItem, id: number) => (
			<Accordion key={`Methods_A_${id.toString()}`}>
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
								addReceipt={addReceipt}
								busy={busy}
								setBusy={setBusy}
								abi={abi}
								address={contract.address}
								contractName={contract.name}
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
				<Accordion.Toggle as={Card.Header} eventKey={`ccard_${index.toString()}`} className="px-2 py-1 form-control custom-select">
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
				<Accordion.Collapse eventKey={`ccard_${index.toString()}`}>
					<Card.Body>{DrawMethods()} </Card.Body>
				</Accordion.Collapse>
			</Card>
		</CSSTransition>
	);
};

export default ContractCard