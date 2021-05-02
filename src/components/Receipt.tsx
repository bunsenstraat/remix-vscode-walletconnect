import React from 'react';
import { client } from '../App';
import './Receipt.css';
import { Alert, Accordion, Button, Card, Form, InputGroup } from 'react-bootstrap';

const Receipt: React.FunctionComponent = () => {
	const [receipt, setReceipt] = React.useState<string>("");
	React.useEffect(() => {
		console.log("init receipt");
		async function init() {
			client.on(
				"udapp" as any,
				"receipt",
				async (
					txReceipt: any
				) => {
					console.log(txReceipt)
					if (typeof txReceipt === 'object') {
						setReceipt(JSON.stringify(txReceipt, null, 4));
					} else {
						setReceipt(txReceipt);
					}
				}
			);

		}
		init();
		// eslint-disable-next-line
	}, []);


	return (<Card className='mt-2'>
		<Card.Header className="p-2">Receipt</Card.Header>
		<Card.Body className="py-1 px-2">
			{receipt}
		</Card.Body></Card>
	)
}

export default Receipt