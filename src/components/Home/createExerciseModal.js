import React, { useState } from 'react'
import { Modal, Button, Form, Container, Input, Breadcrumb } from 'semantic-ui-react'
import MuscleSelectionDropdown from './muscleSelectionDropdown'
import ExerciseDifficultyDropdown from '../CustomComponents/exerciseDifficultyDropdown'


const CreateExerciseModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);

    const [exName, setExName] = useState('')
    const [primMusc, setPrimMusc] = useState([])
    const [secMusc, setSecMusc] = useState([])
    const [exDiff, setExDiff] = useState('')

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
        if (primMusc.length != 0) {
            setPageNum(prevNum => prevNum + 1)
        }
    }

    const handlePrimMusclesChange = (value) => {
        setPrimMusc(value)
    }

    const handleSecMusclesChange = (value) => {
        setSecMusc(value)
    }

    const handleExDiffChange = (value) => {
        console.log(value)
        setExDiff(value)
    }

    const changeExName = (event, { value }) => {
        if (value !== '_') {
            setExName(value)
        }
    }

    const handleSecMusclesSubmit = (event) => {
        event.preventDefault()
        if (primMusc.length != 0) {
            setPageNum(prevNum => prevNum + 1)
        }
    }


    const handeExDiffSubmit = (event) => {
        event.preventDefault();
        setShow(false);
        handleFormSubmit(exName, primMusc, secMusc, exDiff)

        setPageNum(1)
        setExName('')
        setPrimMusc([])
        setSecMusc([])
        setExDiff('')
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
                        <Breadcrumb.Section link active>Experience Level</Breadcrumb.Section>
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
                            {
                                exName != '' ?
                                    < Button className='submitBtn' type="submit">Next</Button>
                                    :
                                    <></>
                            }
                        </Form>
                    }
                    {
                        pageNum == 2 &&
                        <Form onSubmit={handlePrimMusclesSubmit}>
                            <MuscleSelectionDropdown
                                headerString='Select Primary Muscles'
                                selectHandler={handlePrimMusclesChange}
                                value={primMusc}
                            />
                            {
                                (primMusc.length != 0) ?
                                    < Button className='submitBtn' type="submit">Next</Button>
                                    :
                                    <></>
                            }
                        </Form>
                    }
                    {
                        pageNum == 3 &&
                        <Form onSubmit={handleSecMusclesSubmit}>
                            <MuscleSelectionDropdown
                                headerString='Select Secondary Muscles'
                                selectHandler={handleSecMusclesChange}
                                value={secMusc}
                            />
                            {
                                (secMusc.length != 0) ?
                                    < Button className='submitBtn' type="submit">Next</Button>
                                    :
                                    <></>
                            }
                        </Form>
                    }
                    {
                        pageNum == 4 &&
                        <Form onSubmit={handeExDiffSubmit}>
                            <ExerciseDifficultyDropdown
                                value={exDiff}
                                buttonHandler={handleExDiffChange}
                            />
                            {
                                exDiff != '' ?
                                    < Button className='submitBtn' type="submit">Create Exercise</Button>
                                    :
                                    <></>
                            }
                        </Form>
                    }
                </Container>
            </Modal.Content>
        </Modal >
    );
}

export default CreateExerciseModal;