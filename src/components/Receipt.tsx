import React from 'react';
import { client } from '../App';
import './Receipt.css';
import { Alert, Accordion, Button, Card, Form, InputGroup } from 'react-bootstrap';
import ReceiptItem from './ReceiptItem';

const Receipt: React.FunctionComponent = () => {
	const [receipt, setReceipt] = React.useState<any[]>([]);
	const receiptRef = React.useRef(receipt)
	console.log("RE REC")
	console.log(JSON.stringify(receipt))
	React.useEffect(() => {
		console.log("init receipt");
		async function init() {
			client.on(
				"udapp" as any,
				"receipt",
				async (
					txReceipt: any
				) => {
					console.log("incoming recep")
					console.log(txReceipt)
					setReceipt([txReceipt, ...receiptRef.current])
				}
			);

		}
		init();
		// eslint-disable-next-line
	}, []);

	React.useEffect(
		() => {
			receiptRef.current = receipt;
		},
		[receipt]
	)

	const remove = () => {
		receiptRef.current = []
		setReceipt([])
	}

	return (<Card className='mt-2'>
		<Card.Header className="p-2">Output</Card.Header>
		<button className='btn btn-warning btn-sm ml-3 mr-3' onClick={()=>{remove()}}>clear</button>
		<hr></hr>
		{receipt.map((r, i) => {
			return (<>
				<ReceiptItem index={i} receipt={r}></ReceiptItem>
			</>
			)
		})}
	</Card>
	)
}

export default Receipt