import React, { useState } from 'react'
import { Dropdown, Button, Form, Container, Input, Breadcrumb } from 'semantic-ui-react'
import ExerciseDifficultyDropdown from '../CustomComponents/exerciseDifficultyDropdown'


const CreateExerciseForm = ({ handleFormSubmit, anatomyObject, currentList }) => {

    const [show, setShow] = useState(false);

    const [exName, setExName] = useState('')
    const [primMusc, setPrimMusc] = useState([])
    const [secMusc, setSecMusc] = useState([])
    const [exDiff, setExDiff] = useState('')
    const [nameError, setNameError] = useState(false)

    const [pageNum, setPageNum] = useState(1)

    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }

    const handleExNameSubmit = (event) => {
        event.preventDefault()
        if (!nameError) {
            setPageNum(prevNum => prevNum + 1)
        }

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
        setExDiff(value)
    }

    const changeExName = (event, { value }) => {

        if (value.slice(-1) !== "_") {

            if (currentList.includes(value.toLowerCase())) {
                setNameError(true)
            } else {
                if (nameError) {
                    setNameError(false)
                }
            }
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

        let name = exName.trim()

        if (name.split(' ').length > 0) {
            var nameArr = name.split(' ')

            name = []
            nameArr.forEach(word => {
                if (word !== '') {
                    name.push(word.charAt(0).toUpperCase() + word.slice(1))
                }
            })

            name = name.join('_')
        } else {
            name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        handleFormSubmit(name, primMusc, secMusc, exDiff)

        setPageNum(1)
        setExName('')
        setPrimMusc([])
        setSecMusc([])
        setExDiff('')
    }

    return (
        <div className='centred-info'>
            <div className='half-width'>
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
                            <Breadcrumb.Section link active>Secondary Muscles</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 3)}>Secondary Muscles</Breadcrumb.Section>
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
                                    autoFocus
                                />
                            </Form.Field>
                            {
                                exName != '' ?
                                    < Button className='lightPurpleButton' type="submit">Next</Button>
                                    :
                                    <></>
                            }
                            <div id='signInEmailFooterMessagesContainer'>
                                {nameError && <p>Exercise Already Exists</p>}
                            </div>
                        </Form>
                    }
                    {
                        pageNum == 2 &&
                        <Form onSubmit={handlePrimMusclesSubmit}>
                            <MuscleSelectionDropdown
                                headerString='Select Primary Muscles'
                                selectHandler={handlePrimMusclesChange}
                                value={primMusc}
                                muscleGroups={anatomyObject}
                            />
                            {
                                (primMusc.length != 0) ?
                                    < Button className='lightPurpleButton' type="submit">Next</Button>
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
                                muscleGroups={anatomyObject}

                            />
                            {
                                (secMusc.length != 0) ?
                                    < Button className='lightPurpleButton' type="submit">Next</Button>
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
                                    < Button className='lightPurpleButton' type="submit">Create Exercise</Button>
                                    :
                                    <></>
                            }
                        </Form>
                    }
                </Container>
            </div>
        </div>

    );
}

const MuscleSelectionDropdown = ({ selectHandler, headerString, value, muscleGroups }) => {


    const generateDropData = () => {
        var inputData = []

        Object.keys(muscleGroups).forEach(muscleGroup => {
            inputData.push({
                key: muscleGroup,
                text: muscleGroup,
                value: muscleGroup,
                content: <Dropdown.Header content={muscleGroup}></Dropdown.Header>,
                disabled: true
            })
            // inputData.push({
            //     content: <Dropdown.Divider />
            // })

            muscleGroups[muscleGroup].forEach(muscle => {
                inputData.push({
                    key: muscle,
                    text: muscle,
                    value: muscle,
                })
            })

        })


        return inputData
    }

    const [dropdownData] = useState(generateDropData())

    const handleMuscleSelect = (event, { value }) => {
        event.preventDefault()
        selectHandler(value)
    }

    return (

        <Dropdown placeholder={headerString} fluid multiple selection options={dropdownData} onChange={handleMuscleSelect} value={value} />

    )
}

export default CreateExerciseForm;