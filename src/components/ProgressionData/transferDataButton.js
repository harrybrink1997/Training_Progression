import React from 'react'
import { Button, Form } from 'react-bootstrap'


const TransferDataButton = () => {

    const transferData = () => {
        console.log("yew")
    }


    return (
        <Form onSubmit={transferData}>
            <Button type="submit"> Click me bitch</Button>
        </Form >
    )
}

export default TransferDataButton;