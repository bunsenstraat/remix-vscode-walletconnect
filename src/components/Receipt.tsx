import React from 'react';
import { client } from '../App';
import './Receipt.css';
import { Alert, Accordion, Button, Card, Form, InputGroup } from 'react-bootstrap';
import ReceiptItem from './ReceiptItem';
import { InterfaceReceipt } from './Types';

interface ReceiptProperties {
	receipts: InterfaceReceipt[]
	clearOutput: () => void
}

const Receipt: React.FunctionComponent<ReceiptProperties> = (props) => {

	const {
		receipts
	} = props

	const clearOutput = () => {
		props.clearOutput()
	}

	return (<Card className='mt-2'>
		<Card.Header className="p-2 small">Output</Card.Header>
		<div className='text-muted text-right small mr-3 point' onClick={()=>{clearOutput()}}><i className="fas fa-trash-alt" /></div>
		<hr></hr>
		{receipts.slice(0).reverse().map((r, i) => {
			return (<>
				<ReceiptItem key={`receipt_${i}`} index={i} receipt={r}></ReceiptItem>
			</>
			)
		})}
	</Card>
	)
}

export default Receipt