import React, { useEffect, useState } from 'react'
import './home.css'
import { Modal, Button, Form, Input, Container, Popup, Icon, Label, Grid } from 'semantic-ui-react'

import SemanticDatepicker from 'react-semantic-ui-datepickers';

import InputLabel from '../CustomComponents/DarkModeInput'
import AddGoalsForm from '../CustomComponents/addGoalsForm'
// import GoalFieldForm from '../CustomComponents/goalFieldForm'
import { Goal } from '../CustomComponents/goalFieldForm'

const CreateProgramModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);
    const [acutePeriod, setAcutePeriod] = useState(7)
    const [chronicPeriod, setChronicPeriod] = useState(28)
    const [programName, setProgramName] = useState('')
    const [loadingScheme, setLoadingScheme] = useState('rpe_time')
    const [date, setDate] = useState(new Date())

    const [goalList, setGoalList] = useState(() => { return {} })

    const generateTodaysDate = (inputDay) => {

        var day = String(inputDay.getDate()).padStart(2, '0');
        var month = String(inputDay.getMonth() + 1).padStart(2, '0'); //January is 0!
        var year = inputDay.getFullYear();

        var date = day + '-' + month + '-' + year;

        return date
    }

    const changeProgramName = (event, { value }) => {
        setProgramName(value)

    }

    const changeChronicPeriod = (event, { value }) => {
        setChronicPeriod(value)
    }
    const changeAcutePeriod = (event, { value }) => {
        setAcutePeriod(value)
    }

    const handleLoadingSchemeChange = (event, { value }) => {
        setLoadingScheme(value)
    }

    const handleDateChange = (event, { value }) => {
        setDate(value)
    }
    const handleSubmit = (event) => {
        setShow(false);

        handleFormSubmit(programName, acutePeriod, chronicPeriod, loadingScheme, generateTodaysDate(date), goalList)

        setProgramName('')
        setDate(new Date())
        setLoadingScheme('rpe_time')
        setChronicPeriod(28)
        setAcutePeriod(7)
        setGoalList({})
    }

    const handleGoalNumUpdate = (increase) => {
        console.log("going in big update")
        if (increase) {
            var newGoalIndex = Object.keys(goalList).length
            let newGoalList = { ...goalList }
            newGoalList[newGoalIndex] = new Goal(newGoalIndex, updateGoalList)
            setGoalList(newGoalList)
        } else {

            if (Object.keys(goalList).length == 1) {
                console.log("minus length one")
                setGoalList({})
            } else {
                console.log("minus length +")
                var lastGoalIndex = Object.keys(goalList).length - 1
                let newGoalList = { ...goalList }
                delete newGoalList[lastGoalIndex]
                setGoalList(newGoalList)
            }
        }
    }

    useEffect(() => {
        Object.values(goalList).forEach(goal => {
            goal.setCurrentGoalList(goalList)
        })

    }, [goalList]);


    const updateGoalList = (goalObject, index, currList) => {
        let newGoalList = { ...currList }
        newGoalList[index] = goalObject
        setGoalList(newGoalList)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button>Create A Program</Button>}
        >
            <Modal.Header>Create A Program</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <Container>
                        <Form.Field>
                            <InputLabel text='Program Name' />
                            <Input
                                fluid
                                value={programName}
                                onChange={changeProgramName}
                                required
                            />
                        </Form.Field>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <InputLabel
                                    text='Acute Workload Timeframe (Measured in Days) &nbsp;'
                                    toolTip={<Popup
                                        trigger={<Icon name='question circle outline' />}
                                        content='(Recommended 7)'
                                        position='right center'
                                    />}
                                />
                                <Input
                                    fluid
                                    value={acutePeriod}
                                    onChange={changeAcutePeriod}
                                    required
                                />
                            </Form.Field>

                            <Form.Field>
                                <InputLabel
                                    text='Chronic Workload Timeframe (Measured in Days) &nbsp;'
                                    toolTip={<Popup
                                        trigger={<Icon name='question circle outline' />}
                                        content='(Recommended 28)'
                                        position='right center'
                                    />}
                                />
                                <Input
                                    fluid
                                    value={chronicPeriod}
                                    onChange={changeChronicPeriod}
                                    required
                                />
                            </Form.Field>
                        </Form.Group>

                        <Grid columns='equal'>
                            <Grid.Column>
                                <Form.Field>
                                    <InputLabel
                                        text='Loading Scheme &nbsp;'
                                        toolTip={<Popup
                                            trigger={<Icon name='question circle outline' />}
                                            content='This is the loading scheme tooltip'
                                            position='right center'
                                        />}
                                    />
                                    <Form.Radio
                                        label='RPE / Time'
                                        value='rpe_time'
                                        checked={loadingScheme === 'rpe_time'}
                                        onChange={handleLoadingSchemeChange}
                                    />
                                    <Form.Radio
                                        label='Weight / Repetitions'
                                        value='weight_reps'
                                        checked={loadingScheme === 'weight_reps'}
                                        onChange={handleLoadingSchemeChange}
                                    />
                                </Form.Field>
                            </Grid.Column>
                            <Grid.Column>
                                <Form.Field>
                                    <InputLabel
                                        text='Starting Date &nbsp;'
                                        toolTip={<Popup
                                            trigger={<Icon name='question circle outline' />}
                                            content='This is the date tooltip'
                                            position='right center'
                                        />}
                                    />
                                    <SemanticDatepicker
                                        today
                                        type='basic'
                                        onChange={handleDateChange}
                                        format='DD-MM-YYYY'
                                        value={date}
                                    />
                                </Form.Field>
                            </Grid.Column>
                        </Grid>
                        <Form.Field>
                            <div id='hpModalGoalsLabelContainer'>
                                <InputLabel
                                    text='Program Goals &nbsp;'
                                />
                                <Icon
                                    className='hpModalModifyNumGoalsBtn'
                                    style={{ color: 'white' }}
                                    name='minus square outline'
                                    onClick={() => handleGoalNumUpdate(false)}
                                />
                                <Icon
                                    className='cpModalModifyNumGoalsBtn'
                                    style={{ color: 'white' }}
                                    name='plus square outline'
                                    onClick={() => handleGoalNumUpdate(true)}
                                />
                            </div>
                            <div id='hpModalGoalsInputContainer'>
                                {
                                    Object.values(goalList).map((value, index) => {
                                        return (
                                            <div key={index}>
                                                {value.formHTML()}
                                            </div>
                                        )
                                    })
                                }
                            </div>

                        </Form.Field>
                    </Container>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button className='submitBtn' type="submit">Create Program</Button>
                </Modal.Actions>
            </Form>
        </Modal >
    );
}

// const initialGoalListState = []

// const reducer = (state, action) => {
//     switch (action.type) {
//         case 'add':
//             var newGoalIndex = Object.keys(state).length
//             let newState = { ...state }
//             newState[newGoalIndex] = action.item
//             return newState
//             newGoalList[newGoalIndex] = new Goal(newGoalIndex, updateGoalList)
//         case 'remove':


//         case 'update':

//         default:
//             throw new Error()
//     }
// }

export default CreateProgramModal;