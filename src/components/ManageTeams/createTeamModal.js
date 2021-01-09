import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Container, Popup, Icon, Breadcrumb } from 'semantic-ui-react'

import InputLabel from '../CustomComponents/DarkModeInput'

import AthleteManagementTable from '../CustomComponents/athleteManagementTable'

const CreateTeamModal = ({ handleFormSubmit, athleteTableData, programTableData }) => {

    const [show, setShow] = useState(false);
    const [teamName, setTeamName] = useState('')
    const [teamDescription, setTeamDescription] = useState('')
    const [pageNum, setPageNum] = useState(1)
    const [selectedAthletes, setSelectedAthletes] = useState([])
    const [selectedPrograms, setSelectedPrograms] = useState([])

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

    const changeTeamName = (event, { value }) => {
        setTeamName(value)

    }
    const changeTeamDescription = (event, { value }) => {
        setTeamDescription(value)

    }

    const handleSubmit = (event) => {
        setShow(false);

        var athleteData = []

        Object.values(selectedAthletes).forEach(athlete => {
            athleteData.push(athlete.original)
        })

        handleFormSubmit(teamName, teamDescription, athleteData, selectedPrograms)
        setTeamName('')
        setTeamDescription('')
        setSelectedAthletes([])
        setSelectedPrograms([])


    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)

    }

    const handleAthleteSelection = (athleteTableSelection) => {
        setSelectedAthletes(athleteTableSelection)
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
                        (pageNum >= 1) ? (pageNum == 1)
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
                        (pageNum >= 2) ? (pageNum == 2)
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
                        (pageNum >= 3) ? (pageNum == 3)
                            ?
                            <Breadcrumb.Section link active>Add Athletes</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 2)}>Add Athletes</Breadcrumb.Section>
                            :
                            <></>
                    }
                    {
                        pageNum == 4 &&
                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                    }
                    {
                        pageNum == 4 &&
                        <Breadcrumb.Section link active>Assign Programs</Breadcrumb.Section>
                    }
                </Breadcrumb>
                <Container>
                    {
                        pageNum == 1 &&
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

                    }
                    {
                        pageNum == 2 && athleteTableData !== undefined &&
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
                        pageNum == 2 && athleteTableData === undefined &&
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
                        pageNum == 3 && programTableData !== undefined &&
                        <Form onSubmit={handleNonFinalSubmit}>
                            <AthleteManagementTable
                                columns={athleteTableColumns}
                                data={athleteTableData}
                                rowSelectChangeHanlder={handleAthleteSelection}
                            />
                            <Button className='submitBtn' type="submit">Next</Button>
                        </Form>

                    }
                    {
                        pageNum == 3 && programTableData === undefined &&
                        <Form onSubmit={handleSubmit}>
                            <AthleteManagementTable
                                columns={athleteTableColumns}
                                data={athleteTableData}
                                rowSelectChangeHanlder={handleAthleteSelection}
                            />
                            <Button className='submitBtn' type="submit">Create Team</Button>
                        </Form>

                    }
                    {
                        pageNum == 4 && programTableData !== undefined &&
                        <Form onSubmit={handleSubmit}>
                            <Button className='submitBtn' type="submit">Create Team</Button>
                        </Form>
                    }
                </Container>
            </Modal.Content>
        </Modal >
    );
}

export default CreateTeamModal;