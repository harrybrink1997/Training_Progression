import React, { useState } from 'react'
import { Modal, Button, Form, InputGroup, Dropdown, Row, Col } from 'react-bootstrap'

const EditExerciseModal = ({ submitHandler, exUid, currentData }) => {

    const [show, setShow] = useState(false);
    const [rpe, setRpe] = useState(currentData.rpe)
    const [time, setTime] = useState(currentData.time)
    const [reps, setReps] = useState(currentData.reps)
    const [weight, setWeight] = useState(currentData.weight)

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        var exerciseObj = {
            exercise: currentData.exercise,
            exUid: exUid,
            rpe: rpe,
            time: time,
            reps: reps,
            weight: weight,
            primMusc: currentData.primMusc
        }

        submitHandler(exerciseObj)

    }

    const handleRPEUpdate = (value) => {
        setRpe(value)
    }

    const handleTimeUpdate = (event) => {
        event.preventDefault()
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setTime(event.target.value)
        } else if (event.target.value == '') {
            setTime(event.target.value)
        }
    }

    const handleRepsUpdate = (event) => {
        event.preventDefault()
        console.log(event.target.value.slice(-1))
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setReps(event.target.value)
        } else if (event.target.value == '') {
            setReps(event.target.value)
        }
    }

    const handleWeightUpdate = (event) => {
        event.preventDefault()
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setWeight(event.target.value)
        } else if (event.target.value == '') {
            setWeight(event.target.value)
        }
    }

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="light" onClick={handleShow}>
                Edit
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Current Exercise</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <label>RPE</label>
                                <RPEDropdown
                                    buttonHandler={handleRPEUpdate}
                                    exerRpe={rpe} />
                            </Col>
                            <Col>
                                <label>Time</label>
                                <InputGroup
                                    as="input"
                                    placeholder="..."
                                    value={time}
                                    onChange={handleTimeUpdate}
                                    onFocus={e => e.currentTarget.select()}
                                />
                            </Col>
                            <Col>
                                <label>Repetitions</label>
                                <InputGroup
                                    as="input"
                                    placeholder="..."
                                    value={reps}
                                    onChange={handleRepsUpdate}
                                    onFocus={e => e.currentTarget.select()}
                                    type="text"
                                    maxLength="2"
                                />
                            </Col>
                            <Col>
                                <label>Weight</label>
                                <InputGroup
                                    as="input"
                                    placeholder="..."
                                    value={weight}
                                    onChange={handleWeightUpdate}
                                    onFocus={e => e.currentTarget.select()}
                                    type="text"
                                    maxLength="3"
                                />
                            </Col>

                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close</Button>
                        <Button variant="danger" type="submit">Edit</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
}

const RPEDropdown = ({ buttonHandler, exerRpe }) => {

    const determineRPE = (rpe) => {
        if (rpe == '') {
            return 'None'
        } else {
            return rpe
        }
    }

    const [currentRPE, setCurrentRPE] = useState(determineRPE(exerRpe))


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


export default EditExerciseModal;