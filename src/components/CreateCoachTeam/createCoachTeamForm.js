import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Container, Card, Icon, Breadcrumb } from 'semantic-ui-react'

import InputLabel from '../CustomComponents/DarkModeInput'
import ProgramDeployment from '../CustomComponents/programDeployment'
import SelectAthletesTable from '../ManageCoachTeams/selectAthletesTable'
import PageForm from '../CustomComponents/pageForm'

const CreateCoachTeamForm = ({ handleFormSubmit, athleteTableData, programTableData, programGroupTableData, currTeamListArray }) => {
    const [show, setShow] = useState(false);
    const [teamName, setTeamName] = useState('')
    const [teamDescription, setTeamDescription] = useState('')
    const [pageNum, setPageNum] = useState(1)
    const [selectedAthletes, setSelectedAthletes] = useState([])
    const [selectedPrograms, setSelectedPrograms] = useState([])
    const [reservedWordError, setReservedWordError] = useState(false)
    const rawProgramData = programTableData

    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }

    const programTableColumns =
        [
            {
                Header: 'Program',
                accessor: 'program',
                filter: 'fuzzyText'
            },
            {
                Header: 'Acute Period',
                accessor: 'acutePeriod',
                filter: 'fuzzyText'
            },
            {
                Header: 'Chronic Period',
                accessor: 'chronicPeriod',
                filter: 'fuzzyText'
            },
            {
                Header: 'Loading Scheme',
                accessor: 'loadingScheme',
                filter: 'fuzzyText'
            },
            {
                Header: 'Program Length (Weeks)',
                accessor: 'programLength',
                filter: 'fuzzyText'
            },
        ]

    const programGroupTableColumns =
        [
            {
                Header: 'Program Group',
                accessor: 'programGroup',
                filter: 'fuzzyText'
            },
            {
                Header: 'Unlimited Programs',
                accessor: 'unlimited',
            },
            {
                Header: 'Sequential Programs',
                accessor: 'sequential',
            }
        ]

    const changeTeamName = (event, { value }) => {
        value = value.trim()
        if (currTeamListArray.includes(value)) {
            setTeamName(value)
            setReservedWordError(true)
        } else {
            setTeamName(value)
            if (reservedWordError) {
                setReservedWordError(false)
            }
        }

    }
    const changeTeamDescription = (event, { value }) => {
        setTeamDescription(value)

    }

    const handleSubmit = (programData = undefined) => {
        setShow(false);

        var athleteData = []

        Object.values(selectedAthletes).forEach(athlete => {
            athleteData.push(athlete.original)
        })

        handleFormSubmit(teamName.trim(), teamDescription.trim(), athleteData, programData)
        setTeamName('')
        setTeamDescription('')
        setSelectedAthletes([])
        setSelectedPrograms([])
        setPageNum(1)
    }

    const handleNonFinalSubmit = () => {
        if (!reservedWordError) {
            setPageNum(prevNum => prevNum + 1)
        }
    }

    const handleAthleteSelection = (athleteTableSelection) => {
        setSelectedAthletes(athleteTableSelection)
    }
    // Use effect to determine next step once athletes are assigned. 
    useEffect(() => {
        // Check if team name has been entered. 
        if (teamName !== '') {
            if (programTableData) {
                handleNonFinalSubmit()
            } else {
                handleSubmit()
            }
        }
    }, [selectedAthletes])

    const handleProgramAssignmentSubmission = (programAssignment) => {
        handleSubmit(programAssignment)
    }

    return (
        <PageForm>
            <Breadcrumb className=''>
                {
                    (pageNum >= 1) ? (pageNum === 1)
                        ?
                        <Breadcrumb.Section link active >Team Name</Breadcrumb.Section>
                        :
                        <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 1)}>Team Name</Breadcrumb.Section>
                        :
                        <></>

                }
                {
                    pageNum >= 2 &&
                    <Breadcrumb.Divider>/</Breadcrumb.Divider>
                }
                {
                    (pageNum >= 2) ? (pageNum === 2)
                        ?
                        <Breadcrumb.Section link active>Team Description</Breadcrumb.Section>
                        :
                        <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 2)}>Team Description</Breadcrumb.Section>
                        :
                        <></>
                }
                {
                    pageNum >= 3 &&
                    <Breadcrumb.Divider>/</Breadcrumb.Divider>
                }
                {
                    (pageNum >= 3) ? (pageNum === 3)
                        ?
                        <Breadcrumb.Section link active>Add Athletes</Breadcrumb.Section>
                        :
                        <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 3)}>Add Athletes</Breadcrumb.Section>
                        :
                        <></>
                }
                {
                    pageNum >= 4 &&
                    <Breadcrumb.Divider>/</Breadcrumb.Divider>
                }
                {
                    (pageNum >= 4) ? (pageNum === 4)
                        ?
                        <Breadcrumb.Section link active>Assign Programs?</Breadcrumb.Section>
                        :
                        <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 4)}>Assign Programs?</Breadcrumb.Section>
                        :
                        <></>
                }
                {
                    pageNum >= 5 &&
                    <Breadcrumb.Divider>/</Breadcrumb.Divider>
                }
                {
                    (pageNum >= 5) ? (pageNum === 5)
                        ?
                        <Breadcrumb.Section link active>Program Deployment</Breadcrumb.Section>
                        :
                        <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 5)}>Program Deployment</Breadcrumb.Section>
                        :
                        <></>
                }
            </Breadcrumb>
            <Container className='sml-margin-top'>
                {
                    pageNum === 1 &&
                    <div>
                        <Form onSubmit={handleNonFinalSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    autoFocus={true}
                                    value={teamName}
                                    onChange={changeTeamName}
                                    required
                                />
                            </Form.Field>
                            {
                                (teamName != '') ?
                                    <Button className='lightPurpleButton' type="submit">Next</Button>
                                    :
                                    <></>

                            }
                        </Form>
                        <div id='signInEmailFooterMessagesContainer'>
                            {reservedWordError && <p>Invalid Team Name</p>}
                        </div>
                    </div>

                }
                {
                    pageNum === 2 && athleteTableData.data.length > 0 &&
                    <Form onSubmit={handleNonFinalSubmit}>
                        <Form.Field>
                            <Input
                                fluid
                                autoFocus={true}
                                value={teamDescription}
                                onChange={changeTeamDescription}
                                required
                            />
                        </Form.Field>
                        {
                            (teamDescription != '') ?
                                <Button className='lightPurpleButton' type="submit">Next</Button>
                                :
                                <></>

                        }
                    </Form>
                }
                {
                    pageNum === 2 && athleteTableData.data.length === 0 &&
                    <Form onSubmit={handleSubmit}>
                        <Form.Field>
                            <Input
                                fluid
                                autoFocus={true}
                                value={teamDescription}
                                onChange={changeTeamDescription}
                                required
                            />
                        </Form.Field>
                        {
                            (teamDescription != '') ?
                                <Button className='lightPurpleButton' type="submit">Create Team</Button>
                                :
                                <></>

                        }
                    </Form>
                }
                {
                    pageNum === 3 &&
                    <SelectAthletesTable
                        data={athleteTableData.data}
                        columns={athleteTableData.columns}
                        submitHandler={handleAthleteSelection}
                        buttonText={programTableData ? 'Next' : 'Create Team'}
                    />
                }
                {
                    pageNum === 4 &&
                    <div>
                        <InputLabel
                            text='Would you like to assign programs to this team now?'
                            custID='assignProgramsToTeamNowHeader'
                        />
                        <div id='assignProgramsCardGroupContainer'>

                            <Card.Group>
                                <div>
                                    <Card onClick={handleNonFinalSubmit}>

                                        <Card.Content className='iconContent'>
                                            <Icon name='thumbs up outline' size='huge' />
                                        </Card.Content>
                                    </Card>
                                </div>
                                <div>
                                    <Card onClick={handleSubmit}>
                                        <Card.Content className='iconContent'>
                                            <Icon name='thumbs down outline' size='huge' />
                                        </Card.Content>
                                    </Card>
                                </div>
                            </Card.Group>
                        </div>
                    </div>
                }
                {
                    pageNum === 5 && programTableData !== undefined &&
                    <ProgramDeployment
                        initProgTabData={programTableData}
                        initProgTabColumns={programTableColumns}
                        submitHandler={handleProgramAssignmentSubmission}
                        initProgGroupTabData={programGroupTableData}
                    />
                }
            </Container>
        </PageForm>
    );
}

export default CreateCoachTeamForm;