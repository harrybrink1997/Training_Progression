import React, { useState } from 'react'
// import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import ProgramsDropdown from '../Home/programsDropdown'
import { Modal, Button, Segment, Form, Grid } from 'semantic-ui-react'



const DeleteProgramModal = ({ userType, handleFormSubmit, currentProgramList, pastProgramList }) => {

    const [show, setShow] = useState(false);

    const [selectedPastPrograms, setSelectedPastPrograms] = useState([])
    const [selectedCurrPrograms, setSelectedCurrPrograms] = useState([])

    const handleSubmit = (event) => {
        event.preventDefault();
        setShow(false);

        handleFormSubmit(selectedCurrPrograms, selectedPastPrograms)
    }

    const handleProgramSelect = (programType, programList) => {
        if (programType == 'past') {
            setSelectedPastPrograms(programList)

        } else {
            setSelectedCurrPrograms(programList)

        }
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button className='lightPurpleButton-inverted'>Delete Program</Button>}
        >
            <Modal.Header >Delete Programs</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <h5>WARNING! This action is irreversible. This will permanently delete the program and its data from the database.</h5>
                    <Grid columns='equal' padded>
                        <Grid.Column>
                            <ProgramsDropdown
                                programList={currentProgramList}
                                headerString={'Select Current Program'}
                                selectHandler={handleProgramSelect}
                                programType='current' />
                        </Grid.Column>
                        <Grid.Column>
                            <ProgramsDropdown
                                programList={pastProgramList}
                                headerString={'Select Past Program'}
                                selectHandler={handleProgramSelect}
                                programType='past' />
                        </Grid.Column>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button className='deleteBtn' type="submit">Delete Programs</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

export default DeleteProgramModal;