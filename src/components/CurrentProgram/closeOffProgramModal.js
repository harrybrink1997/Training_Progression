import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

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

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="danger" onClick={handleShow}>
                Close Off Program
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Program Close Off</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        WARNING! <br /> This action is not reversible. Once closed off a program will be uneditable and
                        will be moved to your historical records.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close</Button>
                        <Button variant="warning" type="submit">Close Off Program</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
}


export default CloseOffProgramModal;