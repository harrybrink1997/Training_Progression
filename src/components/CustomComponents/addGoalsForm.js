import React, { useState } from 'react'
import { Modal, Button, Form, Input, Container, Icon } from 'semantic-ui-react'


import InputLabel from './DarkModeInput'

const AddGoalsForm = ({ handleFormSubmit, buttonText, headerText, currentGoalData }) => {

    const [show, setShow] = useState(false);

    // const initialiseNumGoals = (gData) => {
    //     if (gData.length != 0) {
    //         var returnArray = []

    //         for (var index = 0; index < gData.length; index++) {
    //             returnArray.push(index)
    //         }
    //         return returnArray
    //     }
    //     return []
    // }

    // const initialiseGoalList = (gData) => {
    //     if (gData.length != 0) {
    //         var returnArray = []
    //         gData.forEach(goal => {
    //             returnArray.push(goal.description)
    //         });
    //         return returnArray
    //     }
    //     return []
    // }

    const [numGoals, setNumGoals] = useState([])
    const [goalList, setGoalList] = useState([])

    const handleSubmit = (event) => {
        setShow(false);

        handleFormSubmit(goalList)
    }


    const handleGoalNumUpdate = (increase) => {
        if (increase) {
            setGoalList([...goalList, ''])
            setNumGoals([...numGoals, numGoals.length])

        } else {

            if (numGoals.length == 1) {
                setGoalList([])
                setNumGoals([])
            } else {
                setGoalList(goalList.slice(0, -1))
                setNumGoals(numGoals.slice(0, -1))
            }
        }
        console.log(goalList)
    }

    const updateGoalInput = (event, data) => {
        let returnList = [...goalList]
        returnList[event.target.id] = data.value
        setGoalList(returnList)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='lightPurpleButton-inverted'>{buttonText}</Button>}
        >
            <Modal.Header>{headerText}</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <Container>
                        <Form.Field>
                            <div id='cpModalGoalsLabelContainer'>
                                <InputLabel
                                    text='Program Goals &nbsp;'
                                />
                                <Icon
                                    className='cpModalModifyNumGoalsBtn'
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
                            <div>
                                {
                                    numGoals.map((index) => {
                                        return (
                                            <div key={index} className='cpModalGoalInputChildContainer'>
                                                <InputLabel text={'Goal ' + (parseInt(index) + 1).toString()} />
                                                <Input
                                                    id={index}
                                                    value={goalList[index]}
                                                    onChange={updateGoalInput}
                                                    className='cpModalGoalInputTextArea'
                                                />
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
                    <Button className='submitBtn' type="submit">{buttonText}</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

export default AddGoalsForm;