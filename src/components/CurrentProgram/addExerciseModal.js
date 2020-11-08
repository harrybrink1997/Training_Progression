import React, { useState } from 'react'
import { Modal, Button, Form, InputGroup, Dropdown, Row, Col } from 'react-bootstrap'

const AddExerciseModalRpeTime = ({ submitHandler, name, currDay, primMusc }) => {

    const [show, setShow] = useState(false);
    const [rpe, setRpe] = useState('')
    const [time, setTime] = useState('')
    const [reps, setReps] = useState('')
    const [sets, setSets] = useState('')
    const [dayInsert, setDayInsert] = useState(currDay)

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        var exerciseObj = {
            name: name,
            day: dayInsert,
            rpe: rpe,
            time: time,
            reps: reps,
            sets: sets,
            primMusc: primMusc
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

    const handleSetsUpdate = (event) => {
        event.preventDefault()
        console.log(event.target.value.slice(-1))
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setSets(event.target.value)
        } else if (event.target.value == '') {
            setSets(event.target.value)
        }
    }

    const handleInsertDay = (day) => {
        console.log(day)
        setDayInsert(day)
    }

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="danger" onClick={handleShow}>
                Add to Day
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add an Exercise</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <label>Sets</label>
                                <InputGroup
                                    as="input"
                                    value={sets}
                                    onChange={handleSetsUpdate}
                                />
                            </Col>
                            <Col>
                                <label>Repetitions</label>
                                <InputGroup
                                    as="input"
                                    value={reps}
                                    onChange={handleRepsUpdate}
                                />
                            </Col>
                            <Col>
                                <label>Time</label>
                                <InputGroup
                                    as="input"
                                    value={time}
                                    onChange={handleTimeUpdate}
                                />
                            </Col>
                            <Col>
                                <label>RPE</label>
                                <RPEDropdown buttonHandler={handleRPEUpdate} />
                            </Col>
                            <Col>
                                <label>Day</label>
                                <DayDropdown
                                    buttonHandler={handleInsertDay}
                                    currDay={dayInsert}
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

const AddExerciseModalWeightReps = ({ submitHandler, name, currDay, primMusc }) => {

    const [show, setShow] = useState(false);
    const [time, setTime] = useState('')
    const [reps, setReps] = useState('')
    const [weight, setWeight] = useState('')
    const [sets, setSets] = useState('')
    const [dayInsert, setDayInsert] = useState(currDay)

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        var exerciseObj = {
            name: name,
            day: dayInsert,
            time: time,
            reps: reps,
            weight: weight,
            sets: sets,
            primMusc: primMusc
        }
        submitHandler(exerciseObj)

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

    const handleSetsUpdate = (event) => {
        event.preventDefault()
        console.log(event.target.value.slice(-1))
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setSets(event.target.value)
        } else if (event.target.value == '') {
            setSets(event.target.value)
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

    const handleInsertDay = (day) => {
        console.log(day)
        setDayInsert(day)
    }

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="danger" onClick={handleShow}>
                Add to Day
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Submit Current Week</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <label>Sets</label>
                                <InputGroup
                                    as="input"
                                    value={sets}
                                    onChange={handleSetsUpdate}
                                />
                            </Col>
                            <Col>
                                <label>Repetitions</label>
                                <InputGroup
                                    as="input"
                                    value={reps}
                                    onChange={handleRepsUpdate}
                                />
                            </Col>
                            <Col>
                                <label>Weight</label>
                                <InputGroup
                                    as="input"
                                    value={weight}
                                    onChange={handleWeightUpdate}
                                />
                            </Col>
                            <Col>
                                <label>Time</label>
                                <InputGroup
                                    as="input"
                                    value={time}
                                    onChange={handleTimeUpdate}
                                />
                            </Col>

                            <Col>
                                <label>Day</label>
                                <DayDropdown
                                    buttonHandler={handleInsertDay}
                                    currDay={dayInsert}
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

const DayDropdown = ({ buttonHandler, currDay }) => {

    const [currentDay, setCurrentDay] = useState(currDay)


    const handleClick = (event) => {
        event.preventDefault()
        setCurrentDay(event.target.value)
        buttonHandler(event.target.value)
    }

    return (
        <Dropdown >
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
                {currentDay}
            </Dropdown.Toggle>
            <Dropdown.Menu variant="dark">
                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                    return (
                        <Dropdown.Item
                            as="button"
                            onClick={handleClick}
                            key={day}
                            value={day}
                        >
                            {day}
                        </Dropdown.Item>
                    )

                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export { AddExerciseModalWeightReps, AddExerciseModalRpeTime };