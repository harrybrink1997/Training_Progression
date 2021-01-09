import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Container, Popup, Icon, Label, Grid, Breadcrumb } from 'semantic-ui-react'

import SemanticDatepicker from 'react-semantic-ui-datepickers';

import InputLabel from '../CustomComponents/DarkModeInput'
import AddGoalsForm from '../CustomComponents/addGoalsForm'
// import GoalFieldForm from '../CustomComponents/goalFieldForm'
import { Goal } from '../CustomComponents/goalFieldForm'

const CreateProgramModal = ({ handleFormSubmit, userType }) => {

    const [show, setShow] = useState(false);
    const [acutePeriod, setAcutePeriod] = useState(7)
    const [chronicPeriod, setChronicPeriod] = useState(28)
    const [programName, setProgramName] = useState('')
    const [loadingScheme, setLoadingScheme] = useState('rpe_time')
    const [date, setDate] = useState(new Date())
    const [pageNum, setPageNum] = useState(1)
    const [goalList, setGoalList] = useState(() => { return {} })

    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }

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

        if (userType === 'athlete') {
            handleFormSubmit(programName, acutePeriod, chronicPeriod, loadingScheme, generateTodaysDate(date), goalList)
        } else {
            handleFormSubmit(programName, acutePeriod, chronicPeriod, loadingScheme, undefined, undefined)
        }


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

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)

    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='lightPurpleButton'>Create Program</Button>}
        >
            <Modal.Header>Create A Program</Modal.Header>
            <Modal.Content>
                <Breadcrumb>
                    {
                        (pageNum >= 1) ? (pageNum == 1)
                            ?
                            <Breadcrumb.Section link active >Program Name</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 1)}>Program Name</Breadcrumb.Section>
                            :
                            <></>

                    }
                    {
                        pageNum >= 2 &&
                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                    }
                    {
                        (pageNum >= 2) ? (pageNum == 2)
                            ?
                            <Breadcrumb.Section link active>Loading Timeframes</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 2)}>Loading Timeframes</Breadcrumb.Section>
                            :
                            <></>
                    }
                    {
                        pageNum >= 3 &&
                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                    }
                    {
                        (pageNum >= 3) ? (pageNum == 3)
                            ?
                            <Breadcrumb.Section link active>Loading Scheme</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 3)}>Loading Scheme</Breadcrumb.Section>
                            :
                            <></>
                    }
                    {
                        pageNum >= 4 &&
                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                    }
                    {
                        (pageNum >= 4) ? (pageNum == 4)
                            ?
                            <Breadcrumb.Section link active>Goals</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 3)}>Goals</Breadcrumb.Section>
                            :
                            <></>
                    }
                    {
                        pageNum == 5 &&
                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                    }
                    {
                        pageNum == 5 &&
                        <Breadcrumb.Section link active>Start Date</Breadcrumb.Section>
                    }
                </Breadcrumb>
                <Container>
                    {
                        pageNum == 1 &&
                        <Form onSubmit={handleNonFinalSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    autoFocus={true}
                                    value={programName}
                                    onChange={changeProgramName}
                                    required
                                />
                            </Form.Field>
                            {
                                (programName != '') ?
                                    <Button className='submitBtn' type="submit">Next</Button>
                                    :
                                    <></>

                            }
                        </Form>

                    }
                    {
                        pageNum == 2 &&
                        <Form onSubmit={handleNonFinalSubmit} >
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <InputLabel
                                        text='Acute Workload Timeframe (Measured in Days) &nbsp;'
                                        toolTip={<Popup
                                            basic
                                            trigger={<Icon name='question circle outline' />}
                                            header='Recommended 7'
                                            content='This number will determine your acute workload timeframe. This should be modified based on training cycle.'
                                            position='right center'
                                        />}
                                    />
                                    <Input
                                        fluid
                                        autoFocus={true}
                                        value={acutePeriod}
                                        onChange={changeAcutePeriod}
                                        required
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <InputLabel
                                        text='Chronic Workload Timeframe (Measured in Days) &nbsp;'
                                        toolTip={<Popup
                                            basic
                                            trigger={<Icon name='question circle outline' />}
                                            header='Recommended 28'
                                            content='This number will determine your chronic workload timeframe. This should be modified based on training cycle.'
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
                            <Button className='submitBtn' type="submit">Next</Button>
                        </Form>
                    }
                    {
                        pageNum == 3 && userType === 'athlete' &&
                        <Form onSubmit={handleNonFinalSubmit}>
                            <Form.Field>
                                <InputLabel
                                    text='Selected A Loading Scheme &nbsp;'
                                    toolTip={<Popup
                                        basic
                                        trigger={<Icon name='question circle outline' />}
                                        content='This will determine your loading scheme for the program. Choose RPE/Time if tracking on weight is not required. Otherwise choose Weight/Repetions.'
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
                            <Button className='submitBtn' type="submit">Next</Button>
                        </Form>
                    }
                    {
                        pageNum == 3 && userType === 'coach' &&
                        <Form onSubmit={handleSubmit}>
                            <Form.Field>
                                <InputLabel
                                    text='Selected A Loading Scheme &nbsp;'
                                    toolTip={<Popup
                                        basic
                                        trigger={<Icon name='question circle outline' />}
                                        content='This will determine your loading scheme for the program. Choose RPE/Time if tracking on weight is not required. Otherwise choose Weight/Repetions.'
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
                            <Button className='submitBtn' type="submit">Create Program</Button>
                        </Form>
                    }
                    {
                        pageNum == 4 && userType === 'athlete' &&
                        <Form onSubmit={handleNonFinalSubmit}>
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
                            <Button className='submitBtn' type="submit">Next</Button>

                        </Form>
                    }
                    {
                        pageNum == 5 && userType === 'athlete' &&
                        <Form onSubmit={handleSubmit}>
                            <Form.Field>
                                <InputLabel
                                    text='Select Starting Date'
                                />
                                <SemanticDatepicker
                                    today
                                    type='basic'
                                    onChange={handleDateChange}
                                    format='DD-MM-YYYY'
                                    value={date}
                                />
                            </Form.Field>
                            <Button className='submitBtn' type="submit">Create Program</Button>
                        </Form>
                    }

                </Container>
            </Modal.Content>
        </Modal >
    );
}

export default CreateProgramModal;