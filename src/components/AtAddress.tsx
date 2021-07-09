import React from 'react';
import { Button, Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { InterfaceContract } from './Types';

interface AtAddressInterface {
    addNewContract: (contract: InterfaceContract) => void; // for SmartContracts
	selected: InterfaceContract | null; // for At Address
    busy: boolean
}

const AtAddress: React.FunctionComponent<AtAddressInterface> = (props)=>{
    const [atAddress, setAtAddress] = React.useState<string>('');
    const {
        addNewContract,
        selected,
    } = props

    return (
        <>
        <p className="text-center mt-3">
					<small>OR</small>
				</p>
				<InputGroup className="mb-0">
					<Form.Control
						value={atAddress}
						placeholder="contract address"
						onChange={(e) => {
							setAtAddress(e.target.value);
						}}
						size="sm"
					/>
					<InputGroup.Append>
						<OverlayTrigger
							placement="left"
							overlay={<Tooltip id="overlay-ataddresss">Use deployed Contract address</Tooltip>}
						>
							<Button
								variant="primary"
								size="sm"
								onClick={() => {
									//setBusy(true);
									if (selected) {
										addNewContract({ ...selected, address: atAddress });
									}
									//setBusy(false);
								}}
							>
								<small>At Address</small>
							</Button>
						</OverlayTrigger>
					</InputGroup.Append>
				</InputGroup>
                </>
    )
}

export default AtAddress