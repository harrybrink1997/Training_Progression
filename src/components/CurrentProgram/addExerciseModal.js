import React, { useState } from 'react'
import { Dropdown, Button, Input, Modal, Form, Segment, Grid } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'


const AddExerciseModalRpeTime = ({ submitHandler, name, primMusc }) => {

    const [show, setShow] = useState(false);
    const [rpe, setRpe] = useState('')
    const [time, setTime] = useState('')
    const [reps, setReps] = useState('')
    const [sets, setSets] = useState('')
    const [dayInsert, setDayInsert] = useState(1)

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
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setReps(event.target.value)
        } else if (event.target.value == '') {
            setReps(event.target.value)
        }
    }

    const handleSetsUpdate = (event) => {
        event.preventDefault()
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setSets(event.target.value)
        } else if (event.target.value == '') {
            setSets(event.target.value)
        }
    }

    const handleInsertDay = (day) => {
        setDayInsert(day)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='addExerciseButton'>Add Exercise</Button>}
        >
            <Modal.Header>Add an Exercise</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <Grid columns='equal' padded>
                        <Grid.Column>
                            <InputLabel text='Sets' />
                            <Input
                                value={sets}
                                onChange={handleSetsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='Repetitions' />
                            <Input
                                value={reps}
                                onChange={handleRepsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='Time' />
                            <Input
                                value={time}
                                onChange={handleTimeUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='RPE' />
                            <RPEDropdown buttonHandler={handleRPEUpdate} />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='Day' />
                            <DayDropdown
                                buttonHandler={handleInsertDay}
                                currDay={dayInsert}
                            />
                        </Grid.Column>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button className='lightPurpleButton-inverted' onClick={() => setShow(false)}>Close</Button>
                    <Button className='submitBtn' type="submit">Add to Day</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

const AddExerciseModalWeightReps = ({ submitHandler, name, primMusc }) => {


    const [show, setShow] = useState(false);
    const [time, setTime] = useState('')
    const [rpe, setRpe] = useState('')
    const [reps, setReps] = useState('')
    const [weight, setWeight] = useState('')
    const [sets, setSets] = useState('')
    const [dayInsert, setDayInsert] = useState(1)

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        var exerciseObj = {
            name: name,
            day: dayInsert,
            time: time,
            reps: reps,
            rpe: rpe,
            weight: weight,
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
        if (event.target.value.slice(-1) >= '0' && event.target.value.slice(-1) <= '9') {
            setReps(event.target.value)
        } else if (event.target.value == '') {
            setReps(event.target.value)
        }
    }

    const handleSetsUpdate = (event) => {
        event.preventDefault()
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
        setDayInsert(day)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='addExerciseButton'>Add Exercise</Button>}
        >
            <Modal.Header>Add Exercise</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <Grid columns='equal' padded>
                        <Grid.Column>
                            <InputLabel text='Sets' />
                            <Input
                                value={sets}
                                onChange={handleSetsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='Repetitions' />
                            <Input
                                value={reps}
                                onChange={handleRepsUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='Weight' />
                            <Input
                                value={weight}
                                onChange={handleWeightUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='Time' />
                            <Input
                                value={time}
                                onChange={handleTimeUpdate}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='RPE' />
                            <RPEDropdown buttonHandler={handleRPEUpdate} />
                        </Grid.Column>
                        <Grid.Column>
                            <InputLabel text='Day' />
                            <DayDropdown
                                buttonHandler={handleInsertDay}
                                currDay={dayInsert}
                            />
                        </Grid.Column>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button className='lightPurpleButton-inverted' onClick={() => setShow(false)}>Close</Button>
                    <Button className='submitBtn' type="submit">Add to Day</Button>
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

    const processData = () => {

        var returnData = []
        var dataArray = ['None', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

        dataArray.forEach(rpe => {
            returnData.push({
                key: rpe,
                value: rpe,
                text: rpe
            })
        })

        return returnData
    }

    const [dropDownData] = useState(processData())

    return (

        <Dropdown
            fluid
            selection
            text={currentRPE.toString()}
            options={dropDownData}
            onChange={handleClick}
        />
    )
}

const DayDropdown = ({ buttonHandler, currDay }) => {

    const [currentDay, setCurrentDay] = useState(currDay)


    const handleClick = (event, { value }) => {
        event.preventDefault()
        setCurrentDay(value)
        buttonHandler(value)
    }

    const processData = () => {

        var returnData = []

        var dataArray = []

        for (var day = 1; day <= 7; day++) {
            dataArray.push(day.toString())
        }

        // var dataArray = ['1', '2', '3', '4', '5', '6', '7']

        dataArray.forEach(day => {
            returnData.push({
                key: day,
                value: day,
                text: day
            })
        })

        return returnData
    }

    const [dropDownData] = useState(processData())

    return (

        <Dropdown
            fluid
            selection
            text={currentDay.toString()}
            options={dropDownData}
            onChange={handleClick}
        />

        // <Dropdown selection fluid text={currentDay.toString()}>
        //     <Dropdown.Menu>
        //         {['1', '2', '3', '4', '5', '6', '7'].map(day => {
        //             return (
        //                 <Dropdown.Item
        //                     onClick={handleClick}
        //                     key={day}
        //                     value={day}
        //                     text={day} />
        //             )

        //         })}
        //     </Dropdown.Menu>
        // </Dropdown>
    )
}

export { AddExerciseModalWeightReps, AddExerciseModalRpeTime };