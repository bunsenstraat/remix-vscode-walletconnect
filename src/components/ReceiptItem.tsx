import React from 'react';
import { client } from '../App';
import './Receipt.css';
import { Alert, Accordion, Button, Card, Form, InputGroup } from 'react-bootstrap';
import copy from "copy-to-clipboard";
interface ReceiptItemProps {
    receipt: any
    index: number
}

const ReceiptItem: React.FunctionComponent<ReceiptItemProps> = (props) => {


    const render = (r: any) => {



        if (typeof r === 'object') {
            console.log("RENDER")


            return (<div>
                {Object.entries(r).map((a) => (
                    <div className=''>{
                        a.map((x, i) => (<div className='row pl-3'><div className={`col text-left small ${i === 0 ? "underline" : ""}`}>

                            {JSON.stringify(x)}
                            {i > 0 ? <Button
                                variant="link"
                                size="sm"
                                className="mt-0 pt-0 float-right btn"
                                onClick={() => {

                                    copy(
                                        JSON.stringify(x)
                                    );

                                }}
                            >
                                <i className="far fa-copy" />
                            </Button> : ""}
                        </div></div>))
                    }</div>
                ))
                }
            </div>)
        } else {
            return (<div className='row pl-3'>
                <div className='col text-left small'>
                    <Button
                        variant="link"
                        size="sm"
                        className="mt-0 pt-0 float-right btn"
                        onClick={() => {

                            copy(
                                JSON.stringify(r)
                            );

                        }}
                    >
                        <i className="far fa-copy" />
                    </Button>
                    {JSON.stringify(r)}
                </div></div>)
        }


    }



    return (
        <>
            <Card.Body className="py-1 px-2 small">
                {render(props.receipt)}
                <hr></hr>
            </Card.Body>
        </>
    )
}

export default ReceiptItem