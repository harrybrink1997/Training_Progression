import React, { useState } from 'react'
import { Dropdown, Button, Input, Modal, Form, Segment } from 'semantic-ui-react'



const AddExerciseModalRpeTime = ({ submitHandler, name, currDay, primMusc }) => {

    const [show, setShow] = useState(false);
    const [rpe, setRpe] = useState('')
    const [time, setTime] = useState('')
    const [reps, setReps] = useState('')
    const [sets, setSets] = useState('')
    const [dayInsert, setDayInsert] = useState(currDay)

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

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button>Add Exercise</Button>}
        >
            <Modal.Header>Add an Exercise</Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <Segment.Group horizontal>
                        <Segment>
                            <label>Sets</label>
                            <Input
                                value={sets}
                                onChange={handleSetsUpdate}
                            />
                        </Segment>
                        <Segment>
                            <label>Repetitions</label>
                            <Input
                                value={reps}
                                onChange={handleRepsUpdate}
                            />
                        </Segment>
                        <Segment>
                            <label>Time</label>
                            <Input
                                value={time}
                                onChange={handleTimeUpdate}
                            />
                        </Segment>
                        <Segment>
                            <label>RPE</label>
                            <RPEDropdown buttonHandler={handleRPEUpdate} />
                        </Segment>
                        <Segment>
                            <label>Day</label>
                            <DayDropdown
                                buttonHandler={handleInsertDay}
                                currDay={dayInsert}
                            />
                        </Segment>
                    </Segment.Group>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button type="submit">Add to Day</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

const AddExerciseModalWeightReps = ({ submitHandler, name, currDay, primMusc }) => {

    const [show, setShow] = useState(false);
    const [time, setTime] = useState('')
    const [reps, setReps] = useState('')
    const [weight, setWeight] = useState('')
    const [sets, setSets] = useState('')
    const [dayInsert, setDayInsert] = useState(currDay)

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

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button>Add Exercise</Button>}
        >
            <Modal.Header>Add Exercise</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <Segment.Group horizontal>
                        <Segment>
                            <label>Sets</label>
                            <Input
                                value={sets}
                                onChange={handleSetsUpdate}
                            />
                        </Segment>
                        <Segment>
                            <label>Repetitions</label>
                            <Input
                                value={reps}
                                onChange={handleRepsUpdate}
                            />
                        </Segment>
                        <Segment>
                            <label>Weight</label>
                            <Input
                                value={weight}
                                onChange={handleWeightUpdate}
                            />
                        </Segment>
                        <Segment>
                            <label>Time</label>
                            <Input
                                value={time}
                                onChange={handleTimeUpdate}
                            />
                        </Segment>
                        <Segment>
                            <label>Day</label>
                            <DayDropdown
                                buttonHandler={handleInsertDay}
                                currDay={dayInsert}
                            />
                        </Segment>

                    </Segment.Group>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button type="submit">Add to Day</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

const RPEDropdown = ({ buttonHandler }) => {

    const [currentRPE, setCurrentRPE] = useState('None')


    const handleClick = (event, { value }) => {
        event.preventDefault()
        setCurrentRPE(value)

        if (value == 'None') {
            value = ''
        }
        buttonHandler(value)
    }

    return (
        <Dropdown text={currentRPE.toString()}>
            <Dropdown.Menu>
                {['None', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(rpe => {
                    return (
                        <Dropdown.Item
                            onClick={handleClick}
                            key={rpe}
                            value={rpe}
                            text={rpe} />
                    )

                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}

const DayDropdown = ({ buttonHandler, currDay }) => {

    const [currentDay, setCurrentDay] = useState(currDay)


    const handleClick = (event, { value }) => {
        event.preventDefault()
        console.log(value)
        setCurrentDay(value)
        buttonHandler(value)
    }

    return (
        <Dropdown text={currentDay.toString()}>
            <Dropdown.Menu>
                {['1', '2', '3', '4', '5', '6', '7'].map(day => {
                    return (
                        <Dropdown.Item
                            onClick={handleClick}
                            key={day}
                            value={day}
                            text={day} />
                    )

                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export { AddExerciseModalWeightReps, AddExerciseModalRpeTime };