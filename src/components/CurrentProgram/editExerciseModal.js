import React, { useState } from 'react'
import { Button, Form, Modal, Input, Dropdown, Segment, Grid } from 'semantic-ui-react'

import './css/currDayExTable.css'
import './css/editExerciseModal.css'

const EditExerciseModalRpeTime = ({ submitHandler, exUid, currentData }) => {

    const [show, setShow] = useState(false);
    const [rpe, setRpe] = useState(currentData.rpe)
    const [time, setTime] = useState(currentData.time)
    const [reps, setReps] = useState(currentData.reps)
    const [sets, setSets] = useState(currentData.sets)

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        var exerciseObj = {
            exercise: currentData.exercise,
            exUid: exUid,
            sets: sets,
            rpe: rpe,
            time: time,
            reps: reps,
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

    const handleSetsUpdate = (event) => {
        event.preventDefault()
        console.log(event.target.value.slice(-1))
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setSets(event.target.value)
        } else if (event.target.value == '') {
            setSets(event.target.value)
        }
    }

    const InputLabel = ({ text }) => (
        <label className='editModalContentInputLabel'>{text}</label>
    )

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger=
            {
                <div className='editExBtnTrigger'>
                    <Button circular icon='edit' />
                </div>
            }
        >
            <Modal.Header className='editModalHeaderContainer'>Edit Current Exercise</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content className='editModalContent'>
                    <Grid columns='equal' padded>
                        <Grid.Column>
                            {/* <label>Sets</label> */}
                            <InputLabel text='Sets' />
                            <Input
                                value={sets}
                                onChange={handleSetsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <label>Repetitions</label>
                            <Input
                                value={reps}
                                onChange={handleRepsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <label>Time</label>
                            <Input
                                value={time}
                                onChange={handleTimeUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <label>RPE</label>
                            <RPEDropdown
                                buttonHandler={handleRPEUpdate}
                                exerRpe={rpe} />
                        </Grid.Column>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button type="submit">Edit</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

const EditExerciseModalWeightSets = ({ submitHandler, exUid, currentData }) => {

    const [show, setShow] = useState(false);
    const [time, setTime] = useState(currentData.time)
    const [reps, setReps] = useState(currentData.reps)
    const [sets, setSets] = useState(currentData.sets)
    const [weight, setWeight] = useState(currentData.weight)

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        var exerciseObj = {
            exercise: currentData.exercise,
            exUid: exUid,
            sets: sets,
            time: time,
            reps: reps,
            weight: weight,
            primMusc: currentData.primMusc
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

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger=
            {
                <div className='editExBtnTrigger'>
                    <Button circular icon='edit' />
                </div>
            }
        >
            <Modal.Header>Edit Current Exercise</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content className='editModalContent'>

                    <Grid columns='equal' padded>
                        <Grid.Column>
                            <label>Sets</label>
                            <Input
                                value={sets}
                                onChange={handleSetsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <label>Repetitions</label>
                            <Input
                                value={reps}
                                onChange={handleRepsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <label>Weight</label>
                            <Input
                                value={weight}
                                onChange={handleWeightUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <label>Time</label>
                            <Input
                                value={time}
                                onChange={handleTimeUpdate}
                            />
                        </Grid.Column>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button type="submit">Edit</Button>
                </Modal.Actions>
            </Form>
        </Modal>
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


    const handleClick = (event, { value }) => {
        event.preventDefault()
        setCurrentRPE(value)

        if (value == 'None') {
            value = ''
        }
        buttonHandler(value)
    }

    return (
        <Dropdown
            fluid
            selection
            text={currentRPE.toString()}>
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


export { EditExerciseModalWeightSets, EditExerciseModalRpeTime }