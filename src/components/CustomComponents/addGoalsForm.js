import React, { useState } from 'react'
import { Modal, Button, Form, Input, Container, Icon } from 'semantic-ui-react'

import { Goal } from './goalFieldForm'
import InputLabel from './DarkModeInput'

const AddGoalsForm = ({ handleFormSubmit, buttonText, headerText, triggerElement, newMainGoalUID }) => {

    const [show, setShow] = useState(false);


    const updateGoal = (goalObject) => {
        setNumRenders(prevState => prevState + 1)
    }

    const [goal, setGoal] = useState(new Goal(newMainGoalUID, updateGoal, undefined))
    const [numRenders, setNumRenders] = useState(true)
    const handleSubmit = (event) => {
        setShow(false);
        handleFormSubmit(goal)
    }



    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={triggerElement}
        >
            <Modal.Header>{headerText}</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    {
                        goal.formHTML()
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button className='submitBtn' type="submit">{buttonText}</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

export default AddGoalsForm;