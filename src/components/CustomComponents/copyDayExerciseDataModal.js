import React, { useState } from 'react'
import { Modal, Button, Form, Input } from 'semantic-ui-react'
import InputLabel from './DarkModeInput';

const CopyExerciseDayDataModal = ({ handleFormSubmit, defaultDay }) => {

    const [show, setShow] = useState(false);
    const dayToCopy = defaultDay
    const [insertionDay, setInsertionDay] = useState(defaultDay)

    const changeInsertionDay = (event, { value }) => {
        console.log(value)
        setInsertionDay(value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (insertionDay !== '') {
            setShow(false);
            handleFormSubmit(dayToCopy, insertionDay)
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
                <div className='copyDayExerciseDataModalTextTrigger'>Copy Day</div>
            }
        >
            <Modal.Header>Copy Exercise Data</Modal.Header>

            <Modal.Content>
                <Form onSubmit={handleSubmit}>
                    <InputLabel
                        text='What day would you like to copy this data to?'
                    />
                    <Form.Field>
                        <Input
                            fluid
                            autoFocus={true}
                            value={insertionDay}
                            onChange={changeInsertionDay}
                            required
                        />
                    </Form.Field>
                    {
                        (insertionDay != '') ?
                            <Button className='submitBtn' type="submit">Copy Day</Button>
                            :
                            <></>
                    }
                </Form>
            </Modal.Content>
        </Modal>
    );
}

export default CopyExerciseDayDataModal;