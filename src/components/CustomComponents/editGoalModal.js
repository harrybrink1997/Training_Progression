import React, { useState } from 'react'
import { Button, Form, Modal, Input, Dropdown, Segment, Grid } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

import { Goal, SubGoal } from '../CustomComponents/goalFieldForm'


import convertDateStringToObject from '../../constants/convertDateStringToObject'

const EditGoalModal = ({ submitHandler, uid, currentData, isSubGoal }) => {

    const [show, setShow] = useState(false);
    const goalUID = uid + '_editGoal'

    const initialiseGoalData = (data) => {
        if (data) {
            if (isSubGoal) {
                var goal = new SubGoal(uid, undefined, undefined)
                goal.setDate(convertDateStringToObject(data.closeOffDate, '.'))
                goal.setDescription(data.description)
                goal.setDifficulty(data.difficulty)
                goal.setCompleted(data.completed)

            } else {
                goal = new Goal(uid, undefined, undefined, false)
                goal.setDate(convertDateStringToObject(data.closeOffDate, '.'))
                goal.setDescription(data.description)
                goal.setDifficulty(data.difficulty)
                goal.setCompleted(data.completed)

            }
            return goal
        }
        return undefined
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
                        goal && goal.formHTML()
                    }
                </Modal.Content>
                <Modal.Actions className='editModalActions'>
                    <Button className='lightPurpleButton-inverted' onClick={() => setShow(false)}>Close</Button>
                    <Button className='submitBtn' type="submit">Edit</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}
export default EditGoalModal