import React, { useState } from 'react'
import { Modal, Button, Form, InputGroup, Dropdown, Row, Col } from 'react-bootstrap'

const AddExerciseModal = ({ submitHandler, name, primaryMusc }) => {

    const [show, setShow] = useState(false);
    const [rpe, setRpe] = useState('')
    const [time, setTime] = useState('')
    const [reps, setReps] = useState('')
    const [weight, setWeight] = useState('')

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        var exerciseObj = {
            name: name,
            rpe: rpe,
            time: time,
            reps: reps,
            weight: weight
        }

        submitHandler(exerciseObj)

    }

    const handleRPEUpdate = (value) => {
        setRpe(value)
    }

    const handleTimeUpdate = (event) => {
        event.preventDefault()
        setTime(event.target.value)
    }

    const handleRepsUpdate = (event) => {
        event.preventDefault()
        setReps(event.target.value)
    }

    const handleWeightUpdate = (event) => {
        event.preventDefault()
        setWeight(event.target.value)
    }

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="danger" onClick={handleShow}>
                Add to Day
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Submit Current Week</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <label>RPE</label>
                                <RPEDropdown buttonHandler={handleRPEUpdate} />
                            </Col>
                            <Col>
                                <label>Time</label>
                                <InputGroup
                                    as="input"
                                    placeholder="..."
                                    value={time}
                                    onChange={handleTimeUpdate}
                                />
                            </Col>
                            <Col>
                                <label>Repetitions</label>
                                <InputGroup
                                    as="input"
                                    placeholder="..."
                                    value={reps}
                                    onChange={handleRepsUpdate}
                                />
                            </Col>
                            <Col>
                                <label>Weight</label>
                                <InputGroup
                                    as="input"
                                    placeholder="..."
                                    value={weight}
                                    onChange={handleWeightUpdate}
                                />
                            </Col>

                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close</Button>
                        <Button variant="danger" type="submit">Add to Day</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
}

const RPEDropdown = ({ buttonHandler }) => {

    const [currentRPE, setCurrentRPE] = useState('None')


    const handleClick = (event) => {
        event.preventDefault()
        setCurrentRPE(event.target.value)

        var payload = event.target.value

        if (payload == 'None') {
            payload = ''
        }
        buttonHandler(payload)
    }

    return (
        <Dropdown >
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
                {currentRPE}
            </Dropdown.Toggle>
            <Dropdown.Menu variant="dark">
                {['None', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rpe => {
                    return (
                        <Dropdown.Item
                            as="button"
                            onClick={handleClick}
                            key={rpe}
                            value={rpe}
                        >
                            {rpe}
                        </Dropdown.Item>
                    )

                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}



export default AddExerciseModal;