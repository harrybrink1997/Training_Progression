import React, { useState } from 'react'
import { Button, Form, Modal, Input, Dropdown, Segment, Grid } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

import { Goal, SubGoal } from '../CustomComponents/goalFieldForm'

const EditGoalModal = ({ submitHandler, uid, currentData, isSubGoalBoolean }) => {

    const [show, setShow] = useState(false);
    const goalUID = uid + '_editGoal'
    const isSubGoal = isSubGoalBoolean

    const initialiseGoalData = (data) => {
        console.log('initialising goal modal')
        console.log(data)
        console.log(isSubGoal)
        if (isSubGoal) {
            let subGoal = new SubGoal(uid, undefined, undefined)
            subGoal.setDate = data.closeOffDate
            subGoal.setDescription = data.description
            subGoal.setDifficulty = data.difficulty

            return subGoal
        }
    }

    const [goalList, setGoalList] = useState(() => initialiseGoalData(currentData))

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
                    {
                        isSubGoal && goalList.formHTML()
                    }
                    {
                        !isSubGoal && <div> the bois</div>
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