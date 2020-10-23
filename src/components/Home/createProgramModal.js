import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, InputGroup } from 'react-bootstrap'

const CreateProgramModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);

    const [programName, setProgramName] = useState('')

    const handleClose = (event) => {
        setShow(false);
    }

    const onChange = (event) => {
        if (event.target.name === 'programName') {
            setProgramName(event.target.value)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setShow(false);
        setProgramName('')
        handleFormSubmit(programName)
    }

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="danger" onClick={handleShow}>
                Create Program
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create A Program</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <InputGroup
                            name="programName"
                            as="input"
                            id="newProgramNameInput"
                            onChange={onChange}
                            value={programName}
                            valueplaceholder="Enter Program Name...">
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close</Button>
                        <Button variant="primary" type="submit">Create Program</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
}


export default CreateProgramModal;