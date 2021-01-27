import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Container, Card, Icon, Breadcrumb } from 'semantic-ui-react'

import InputLabel from '../CustomComponents/DarkModeInput'

import RowSelectTable from '../CustomComponents/rowSelectTable'
import OnRowClickBasicTableWithPageination from '../CustomComponents/onRowClickBasicTable'
import ProgramAssignment from '../CustomComponents/programAssignment'
import ProgramDeployment from '../CustomComponents/programDeployment'


const CreateTeamModal = ({ handleFormSubmit, athleteTableData, programTableData, programGroupTableData }) => {

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

    const athleteTableColumns =
        [
            {
                Header: 'Athlete',
                accessor: 'athlete',
                filter: 'fuzzyText'
            },
            {
                Header: 'Email',
                accessor: 'email',
                filter: 'fuzzyText'
            },
            {
                Header: 'Current Team',
                accessor: 'currentTeam',
                filter: 'fuzzyText'
            },
        ]

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
        if (value === 'none') {
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

        handleFormSubmit(teamName, teamDescription, athleteData, programData)
        setTeamName('')
        setTeamDescription('')
        setSelectedAthletes([])
        setSelectedPrograms([])
        setPageNum(1)
    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        if (!reservedWordError) {
            setPageNum(prevNum => prevNum + 1)
        }
    }

    const handleAthleteSelection = (athleteTableSelection) => {
        setSelectedAthletes(athleteTableSelection)
        console.log(athleteTableSelection)
    }

    const handleProgramSelection = (programTableSelection) => {
        console.log(programTableSelection)
        setSelectedPrograms(programTableSelection)
    }

    const handleProgramGroupSelection = (programGroupTableSelection) => {

        var unlimitedPrograms = false

        if (programGroupTableSelection.original.unlimitedRawData) {
            unlimitedPrograms = []
            programGroupTableSelection.original.unlimitedRawData.forEach(targetProgram => {
                for (var program in rawProgramData) {
                    var programData = rawProgramData[program]
                    if (targetProgram === programData.programUID) {
                        unlimitedPrograms.push(programData)
                        break
                    }
                }
            })
        }

        var sequentialPrograms = false

        if (programGroupTableSelection.original.sequentialRawData) {
            sequentialPrograms = []
            Object.keys(programGroupTableSelection.original.sequentialRawData).forEach(targetProgram => {
                for (var program in rawProgramData) {
                    var programData = rawProgramData[program]
                    if (targetProgram === programData.programUID) {
                        programData.order = programGroupTableSelection.original.sequentialRawData[targetProgram]

                        sequentialPrograms.push(programData)
                        break
                    }
                }
            })
        }

        var payLoad = {
            sequenceName: 'preDetermined',
            sequential: sequentialPrograms,
            unlimited: unlimitedPrograms
        }

        handleSubmit(payLoad)
    }

    const handleProgramAssignmentSubmission = (programAssignment) => {
        handleSubmit(programAssignment)
    }

    const processDontUseExistingProgGroup = (event) => {
        event.preventDefault()
        setPageNum(7)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='lightPurpleButton'>Create Team</Button>}
        >
            <Modal.Header>Create A Team</Modal.Header>
            <Modal.Content>
                <Breadcrumb>
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
                <Container>
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
                                        <Button className='submitBtn' type="submit">Next</Button>
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
                        pageNum === 2 && athleteTableData !== undefined &&
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
                                    <Button className='submitBtn' type="submit">Next</Button>
                                    :
                                    <></>

                            }
                        </Form>
                    }
                    {
                        pageNum === 2 && athleteTableData === undefined &&
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
                                    <Button className='submitBtn' type="submit">Create Team</Button>
                                    :
                                    <></>

                            }
                        </Form>
                    }
                    {
                        pageNum === 3 && programTableData !== undefined &&
                        <Form onSubmit={handleNonFinalSubmit}>
                            <RowSelectTable
                                columns={athleteTableColumns}
                                data={athleteTableData}
                                rowSelectChangeHandler={handleAthleteSelection}
                            />
                            <Button className='submitBtn' type="submit">Next</Button>
                        </Form>

                    }
                    {
                        pageNum === 3 && programTableData === undefined &&
                        <Form onSubmit={handleSubmit}>
                            <RowSelectTable
                                columns={athleteTableColumns}
                                data={athleteTableData}
                                rowSelectChangeHandler={handleAthleteSelection}
                            />
                            <Button className='submitBtn' type="submit">Create Team</Button>
                        </Form>

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
            </Modal.Content>
        </Modal >
    );
}

export default CreateTeamModal;