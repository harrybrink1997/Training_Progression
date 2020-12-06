import React, { useState } from 'react'
import { Modal, Button, Form, Container, Input, Breadcrumb } from 'semantic-ui-react'
import MuscleSelectionDropdown from './muscleSelectionDropdown'


const CreateExerciseModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);

    const [exName, setExName] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault();
        setShow(false);

        // handleFormSubmit(selectedCurrPrograms, selectedPastPrograms)
    }

    const [pageNum, setPageNum] = useState(1)

    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }

    const handleExNameSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)

    }

    const handlePrimMusclesSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)
    }

    const changeExName = (event, { value }) => {
        setExName(value)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button>Create Exercise</Button>}
        >
            <Modal.Header >Create Your Own Exercise</Modal.Header>
            <Modal.Content>
                <Breadcrumb>
                    {
                        (pageNum >= 1) ? (pageNum == 1)
                            ?
                            <Breadcrumb.Section link active >Exercise Name</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 1)}>Exercise Name</Breadcrumb.Section>
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
                            <Breadcrumb.Section link active>Primary Muscles</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 2)}>Primary Muscles</Breadcrumb.Section>
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
                            <Breadcrumb.Section link active>Primary Muscles</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 3)}>Primary Muscles</Breadcrumb.Section>
                            :
                            <></>
                    }
                    {
                        pageNum == 4 &&
                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                    }
                    {
                        pageNum == 4 &&
                        <Breadcrumb.Section link active>Exercise Difficulty</Breadcrumb.Section>
                    }
                </Breadcrumb>
                <Container>
                    {
                        pageNum == 1 &&
                        <Form onSubmit={handleExNameSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    value={exName}
                                    onChange={changeExName}
                                    required
                                />
                            </Form.Field>
                        </Form>
                    }
                    {
                        pageNum == 2 &&
                        <Form onSubmit={handlePrimMusclesSubmit}>
                            <MuscleSelectionDropdown headerString='Select Primary Muscles' />
                        </Form>
                    }
                    {
                        pageNum == 3 &&
                        <MuscleSelectionDropdown headerString='Select Secondary Muscles' />
                    }
                </Container>
            </Modal.Content>
            <Modal.Actions>
                {
                    pageNum >= 1 && pageNum != 4 &&
                    < Button className='submitBtn'>Next</Button>
                }
                {
                    pageNum == 4 &&
                    <Button className='submitBtn' type="submit">Submit</Button>
                }
            </Modal.Actions>
        </Modal >
    );
}

export default CreateExerciseModal;