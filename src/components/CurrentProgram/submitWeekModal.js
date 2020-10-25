import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

const SubmitWeekModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = () => {
        setShow(false);
        handleFormSubmit()

    }

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="danger" onClick={handleShow}>
                Submit Week
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Submit Current Week</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        Warning!
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close</Button>
                        <Button variant="warning" type="submit">Submit Week</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
}


export default SubmitWeekModal;