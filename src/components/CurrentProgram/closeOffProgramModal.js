import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'

const CloseOffProgramModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);
        handleFormSubmit()

    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='closeOffPeriod'>Close Off Program</Button>}
        >
            <Modal.Header>Close Off Program</Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    WARNING! <br /> This action is not reversible. Once closed off a program is no longer editable and you
                        will only be able to access the historical data.
                    </Modal.Content>
                <Modal.Actions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Proceed</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}


export default CloseOffProgramModal;