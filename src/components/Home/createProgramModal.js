import React, { useState } from 'react'
import './home.css'
import { Modal, Button, Form, Input, Container, Popup, Icon, Label } from 'semantic-ui-react'

import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import InputLabel from '../CustomComponents/DarkModeInput'

const CreateProgramModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);
    const [acutePeriod, setAcutePeriod] = useState(7)
    const [chronicPeriod, setChronicPeriod] = useState(28)
    const [programName, setProgramName] = useState('')
    const [loadingScheme, setLoadingScheme] = useState('rpe_time')
    const [date, setDate] = useState(new Date())

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

        handleFormSubmit(programName, acutePeriod, chronicPeriod, loadingScheme, generateTodaysDate(date))

        setProgramName('')
        setDate(new Date())
        setLoadingScheme('rpe-time')
        setChronicPeriod(28)
        setAcutePeriod(7)
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

                        <Form.Group inline widths='equal'>
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
                        </Form.Group>
                    </Container>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button className='submitBtn' type="submit">Create Program</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}


export default CreateProgramModal;