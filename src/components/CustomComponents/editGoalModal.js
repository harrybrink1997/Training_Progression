import React, { useState } from 'react'
import { Button, Form, Modal, Input, Dropdown, Segment, Grid } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

import { Goal, SubGoal } from '../CustomComponents/goalFieldForm'


import convertDateStringToObject from '../../constants/convertDateStringToObject'

const EditGoalModal = ({ submitHandler, uid, currentData, isSubGoal }) => {

    const [show, setShow] = useState(false);
    const goalUID = uid + '_editGoal'

    const initialiseGoalData = (data) => {
        if (data != undefined) {
            let goal = new SubGoal(uid, undefined, undefined)
            goal.setDate(convertDateStringToObject(data.closeOffDate, '.'))
            goal.setDescription(data.description)
            goal.setDifficulty(data.difficulty)
            goal.setCompleted(data.completed)
            return goal
        }
        return false
    }

    const [goal, setGoal] = useState(() => initialiseGoalData(currentData))

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

        submitHandler(goalUID, goal)

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
                    {
                        goal != false && goal.formHTML()
                    }
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