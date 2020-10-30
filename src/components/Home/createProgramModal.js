import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap'

const CreateProgramModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);
    const [rpeActive, setRPEActive] = useState(false)
    const [weightActive, setWeightActive] = useState(true)

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

        if (rpeActive) {
            handleFormSubmit(programName, 'rpe_time')
        } else {
            handleFormSubmit(programName, 'weight_reps')
        }

    }

    const handleRadioToggle = (event) => {
        if (event.target.id == 'rpe-time' && !rpeActive) {
            setWeightActive(false)
            setRPEActive(true)
        } else if (event.target.id == 'weight-reps' && !weightActive) {
            setRPEActive(false)
            setWeightActive(true)
        }
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
                            valueplaceholder="Enter Program Name..."
                        />
                        <div key='rpe-time' className="mb-3">
                            <Form.Check
                                type='radio'
                                id='weight-reps'
                                label='Weight / Repetitions'
                                checked={weightActive}
                                onClick={handleRadioToggle}
                                onChange={() => { }}

                            />
                            <Form.Check
                                type='radio'
                                id='rpe-time'
                                label='RPE / Time / Repetions'
                                checked={rpeActive}
                                onClick={handleRadioToggle}
                                onChange={() => { }}
                            />

                        </div>
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