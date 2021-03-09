import React, { useEffect, useState } from 'react'
// import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { Modal, Button, Card, Icon, Form, Input, Container, Breadcrumb } from 'semantic-ui-react'
import ProgramClassification from '../CustomComponents/programClassification'
import RowSelectTable from '../CustomComponents/rowSelectTable'
import NoDataMessage from '../CustomComponents/noDataMessage'



const CreateProgramGroupModal = ({ handleCreateFormSubmit, programTableData, tableGroupTableData, currentGroupList, handleDeleteFormSubmit }) => {

    const [show, setShow] = useState(false);
    const [pageView, setPageView] = useState('home')


    const handleCreateGroup = (groupName, programData) => {
        setShow(false);
        setPageView('home')
        handleCreateFormSubmit(groupName, programData)
    }

    const handleDeleteGroup = (groupNames) => {
        setShow(false);
        setPageView('home')
        handleDeleteFormSubmit(groupNames)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='lightPurpleButton-inverted'>Manage Program Groups</Button>}
        >
            <Modal.Header >Manage Program Groups</Modal.Header>
            <Modal.Content>
                {
                    pageView !== 'home' &&
                    <div className='rowContainer clickableDiv'>
                        <Button
                            content='Back'
                            className='backButton-inverted'
                            circular
                            icon='arrow left'
                            onClick={() => { setPageView('home') }}
                        />
                    </div>
                }
                {
                    pageView === 'home' &&
                    <div id='programAssignmentCardGroupContainer'>
                        <Card.Group>
                            <div>
                                <Card onClick={() => setPageView('createGroup')}>
                                    <Card.Content className='iconContent'>
                                        <Icon name='file alternate outline' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>Create <br /> Group</Card.Header>
                                    </Card.Content>
                                </Card>
                            </div>
                            <div>
                                <Card onClick={() => { setPageView('deleteGroup') }}>
                                    <Card.Content className='iconContent'>
                                        <Icon name='group' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>Delete <br /> Group</Card.Header>
                                    </Card.Content>
                                </Card>
                            </div>
                        </Card.Group>
                    </div>
                }
                {
                    pageView === 'createGroup' &&
                    <div>
                        <CreateProgramGroup
                            handleFormSubmit={handleCreateGroup}
                            programTableData={programTableData}
                            currentList={currentGroupList}
                        />
                    </div>
                }
                {
                    pageView === 'deleteGroup' &&
                    <div>
                        <DeleteProgramGroup
                            handleFormSubmit={handleDeleteGroup}
                            programGroupTableData={tableGroupTableData}
                        />
                    </div>
                }
            </Modal.Content>
        </Modal>
    );
}


const CreateProgramGroup = ({ handleFormSubmit, programTableData, currentList }) => {

    const [groupName, setGroupName] = useState('')
    const [pageNum, setPageNum] = useState(1)
    const [selectedPrograms, setSelectedPrograms] = useState([])
    const [groupExistsError, setGroupExistsError] = useState(false)

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

    const changeGroupName = (event, { value }) => {
        setGroupName(value)
        if (currentList.includes(value.trim())) {
            setGroupExistsError(true)
        } else {
            if (groupExistsError) {
                setGroupExistsError(false)
            }
        }
    }

    const handleSubmit = (programData) => {
        handleFormSubmit(groupName.trim(), programData)

        setGroupName('')
        setPageNum(1)
        setSelectedPrograms([])
    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        if (!groupExistsError) {
            setPageNum(prevNum => prevNum + 1)
        }

    }

    const handleProgramSelection = (programTableSelection) => {
        console.log(programTableSelection)
        setSelectedPrograms(programTableSelection)
    }

    const handleProgramAssignmentSubmission = (programAssignment) => {
        handleSubmit(programAssignment)
    }
    return (
        <>
            <Breadcrumb>
                {
                    (pageNum >= 1) ? (pageNum == 1)
                        ?
                        <Breadcrumb.Section link active >Group Name</Breadcrumb.Section>
                        :
                        <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 1)}>Group Name</Breadcrumb.Section>
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
                        <Breadcrumb.Section link active>Choose Programs</Breadcrumb.Section>
                        :
                        <Breadcrumb.Section link onClick={(e) => handlePageChange(e, 2)}>Assign Programs</Breadcrumb.Section>
                        :
                        <></>
                }
                {
                    pageNum >= 3 &&
                    <Breadcrumb.Divider>/</Breadcrumb.Divider>
                }
                {
                    pageNum >= 3 &&
                    <Breadcrumb.Section link active>Group Accessbility</Breadcrumb.Section>
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
                                value={groupName}
                                onChange={changeGroupName}
                                required
                            />
                        </Form.Field>
                        {
                            (groupName != '') ?
                                <Button className='submitBtn' type="submit">Next</Button>
                                :
                                <></>

                        }
                    </Form>

                }
                {
                    pageNum == 2 && programTableData !== undefined &&
                    <div>
                        <RowSelectTable
                            columns={programTableColumns}
                            data={programTableData}
                            rowSelectChangeHandler={handleProgramSelection}
                        />
                        {
                            selectedPrograms.length !== 0 &&
                            <Button
                                className='submitBtn'
                                onClick={handleNonFinalSubmit}
                            >Next</Button>
                        }
                    </div>
                }
                {
                    pageNum == 3 && selectedPrograms.length > 0 &&
                    <ProgramClassification
                        programTableData={selectedPrograms}
                        programTableColumns={programTableColumns}
                        handleFormSubmit={handleProgramAssignmentSubmission}
                    />
                }
                <div id='signInEmailFooterMessagesContainer'>
                    {groupExistsError && <p>Group Name Already Exists.</p>}
                </div>
            </Container>
        </>
    )
}

const DeleteProgramGroup = ({ handleFormSubmit, programGroupTableData }) => {

    const [selectedList, setSelectedList] = useState([])

    const handleDeleteGroups = (event) => {
        event.preventDefault()
        let payload = selectedList.map(group => {
            return group.original.programGroup
        })

        handleFormSubmit(payload)
    }


    useEffect(() => {
        console.log(selectedList)
    }, [selectedList])

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

    return (
        <>
            {
                programGroupTableData ?
                    <div>
                        <Form onSubmit={handleDeleteGroups}>
                            <RowSelectTable
                                data={programGroupTableData}
                                columns={programGroupTableColumns}
                                rowSelectChangeHandler={setSelectedList}
                            />
                            <Button
                                type="submit"
                                className="lightPurpleButton"
                            >
                                Delete Groups
                        </Button>
                        </Form>
                    </div>
                    :
                    <NoDataMessage>
                        No program groups to show.
                    </NoDataMessage>
            }
        </>
    )


}
export default CreateProgramGroupModal;