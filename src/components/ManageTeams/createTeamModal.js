import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Container, Popup, Icon, Breadcrumb } from 'semantic-ui-react'

import InputLabel from '../CustomComponents/DarkModeInput'

import AthleteManagementTable from '../CustomComponents/athleteManagementTable'

const CreateTeamModal = ({ handleFormSubmit, athleteTableData }) => {

    const [show, setShow] = useState(false);
    const [programName, setProgramName] = useState('')
    const [pageNum, setPageNum] = useState(1)

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
        setProgramName(value)

    }

    const handleSubmit = (event) => {
        setShow(false);
        setProgramName('')

    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)

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
                            <Breadcrumb.Section link active>Add Athletes</Breadcrumb.Section>
                            :
                            <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 2)}>Add Athletes</Breadcrumb.Section>
                            :
                            <></>
                    }
                    {
                        pageNum == 3 &&
                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                    }
                    {
                        pageNum == 3 &&
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
                                    value={programName}
                                    onChange={changeTeamName}
                                    required
                                />
                            </Form.Field>
                            {
                                (programName != '') ?
                                    <Button className='submitBtn' type="submit">Next</Button>
                                    :
                                    <></>

                            }
                        </Form>

                    }
                    {
                        pageNum == 2 &&
                        <Form onSubmit={handleNonFinalSubmit}>
                            <AthleteManagementTable
                                columns={athleteTableColumns}
                                data={athleteTableData}
                            />
                            {
                                (programName != '') ?
                                    <Button className='submitBtn' type="submit">Next</Button>
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

export default CreateTeamModal;