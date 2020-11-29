import React, { useState } from 'react'
import { Button, Form, Modal, Input, Dropdown, Segment, Grid } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

import { Goal, SubGoal } from '../CustomComponents/goalFieldForm'


import convertDateStringToObject from '../../constants/convertDateStringToObject'

const AddSubGoalModal = ({ submitHandler, uid, currentData }) => {

    const [show, setShow] = useState(false);
    const mainGoalUID = uid + '_editGoal'

    const initialiseGoalData = (data) => {
        console.log(data)
        if (data != undefined) {
            let goal = new SubGoal(uid, undefined, undefined)
            return goal
        }
        return false
    }

    const [goal, setGoal] = useState(() => initialiseGoalData(currentData))

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);
        submitHandler(goal, mainGoalUID)

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
                    <Button circular icon='plus' className='addSubGoal' />
                </div>
            }
        >
            <Modal.Header>Create Sub Goals</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content className='editModalContent'>
                    {
                        goal != false && goal.formHTML()
                    }
                </Modal.Content>
                <Modal.Actions className='editModalActions'>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button type="submit">Create Sub Goal</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}
export default AddSubGoalModal