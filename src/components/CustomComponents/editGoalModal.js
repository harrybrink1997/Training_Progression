import React, { useState } from 'react'
import { Button, Form, Modal, Input, Dropdown, Segment, Grid } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

const EditGoalModal = ({ submitHandler, uid, currentData, isSubGoal }) => {

    const [show, setShow] = useState(false);
    const goalUID = uid + '_editGoal'


    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        // submitHandler()

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
            <Modal.Header>{'Edit ' + ((isSubGoal) ? 'Sub Goal' : 'Goal')}</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content className='editModalContent'>
                </Modal.Content>
                <Modal.Actions className='editModalActions'>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button type="submit">Edit</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}
export default EditGoalModal