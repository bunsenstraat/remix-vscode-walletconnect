import React from 'react';
import { Alert, Accordion, Card } from 'react-bootstrap';
import ContractCard from './ContractCard'
import { InterfaceContract, InterfaceReceipt } from './Types';
import './animation.css';

const EMPTYLIST = 'Currently you have no contract instances to interact with.';



interface InterfaceSmartContractsProps {
	busy: boolean;
	setBusy: (state: boolean) => void;
	// blockscout: string;
	contracts: InterfaceContract[];
	addReceipt: (receipt: InterfaceReceipt) => void;
	remove: (contract: InterfaceContract) => void;
}

const SmartContracts: React.FunctionComponent<InterfaceSmartContractsProps> = (props) => {
	const [error, setError] = React.useState<string>('');
	const [count, setCount] = React.useState<number>(0);
	const {
		busy,
		setBusy,
		// blockscout,
		contracts,
		addReceipt,
		remove
	} = props;

	React.useEffect(() => {
		setCount(0);
		setError(EMPTYLIST);
	}, [contracts, busy]);

	function DrawContracts() {
		const items = contracts.map((data: InterfaceContract, index: number) => (
			<ContractCard
				addReceipt={addReceipt}
				busy={busy}
				setBusy={setBusy}
				// blockscout={blockscout}
				contract={data}
				index={index}
				remove={(contract) => {
					remove(contract)
				}}
				key={`Contract_${index.toString()}`}
			/>
		));
		return <Accordion defaultActiveKey="0">{items}</Accordion>;
	}

	return (
		<div className="SmartContracts">
			<Alert variant="warning" className="text-center p-1" hidden={contracts.length !== count}>
				{error}
			</Alert>
			<Card className='mt-2'>
				<Card.Header className="p-2 small">Run</Card.Header>
				<Card.Body className="py-1 px-2">
					{DrawContracts()}
				</Card.Body></Card>
		</div>
	);
};

export default SmartContracts;
