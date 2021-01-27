import React, { useState } from 'react'
// import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { Modal, Button, Form, Input, Container, Breadcrumb } from 'semantic-ui-react'
import ProgramClassification from '../CustomComponents/programClassification'
import RowSelectTable from '../CustomComponents/rowSelectTable'




const CreateProgramGroupModal = ({ handleFormSubmit, programTableData }) => {

    const [show, setShow] = useState(false);
    const [groupName, setGroupName] = useState('')
    const [pageNum, setPageNum] = useState(1)
    const [selectedPrograms, setSelectedPrograms] = useState([])

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
    }

    const handleSubmit = (programData) => {
        setShow(false);
        handleFormSubmit(groupName, programData)

        setGroupName('')
        setPageNum(1)
        setSelectedPrograms([])
    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)

    }

    const handleProgramSelection = (programTableSelection) => {
        console.log(programTableSelection)
        setSelectedPrograms(programTableSelection)
    }

    const handleProgramAssignmentSubmission = (programAssignment) => {
        handleSubmit(programAssignment)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='lightPurpleButton-inverted'>Create Program Group</Button>}
        >
            <Modal.Header >Create Program Group</Modal.Header>
            <Modal.Content>
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
                </Container>
            </Modal.Content>
        </Modal>
    );
}

export default CreateProgramGroupModal;