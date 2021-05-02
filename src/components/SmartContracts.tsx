import React from 'react';
import { Alert, Accordion, Button, Card, Form, InputGroup } from 'react-bootstrap';
import copy from 'copy-to-clipboard';
import { CSSTransition } from 'react-transition-group';
import { AbiInput, AbiItem } from 'web3-utils';
// import { MoonbeamLib } from '@dexfair/moonbeamLib-web-signer';
import DrawMethod from './DrawMethods'
import ContractCard from './ContractCard'
import { InterfaceContract } from './Types';
import Method from './Method';
import './animation.css';

const EMPTYLIST = 'Currently you have no contract instances to interact with.';

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
			<Card className='mt-2'>
				<Card.Header className="p-2">Run</Card.Header>
				<Card.Body className="py-1 px-2">
					{DrawContracts()}
				</Card.Body></Card>
		</div>
	);
};

export default SmartContracts;
