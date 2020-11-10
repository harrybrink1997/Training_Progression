import React, { useState, useEffect } from 'react'
// import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import ProgramsDropdown from './programsDropdown'
import { Modal, Button, Segment, Form } from 'semantic-ui-react'
import './home.css'



const DeleteProgramModal = ({ handleFormSubmit, currentProgramList, pastProgramList }) => {

    const [show, setShow] = useState(false);

    const [programName, setProgramName] = useState('')

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
            trigger={<Button>Delete Programs</Button>}
        >
            <Modal.Header >Delete Programs</Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <h5>WARNING! This action is irreversible. This will permanently delete the program and its data from the database.</h5>
                    <Segment.Group horizontal>
                        <Segment>
                            <ProgramsDropdown
                                programList={currentProgramList}
                                headerString={'Select Current Program'}
                                selectHandler={handleProgramSelect}
                                programType='current' />
                        </Segment>
                        <Segment>
                            <ProgramsDropdown
                                programList={pastProgramList}
                                headerString={'Select Past Program'}
                                selectHandler={handleProgramSelect}
                                programType='past' />
                        </Segment>
                    </Segment.Group>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShow(false)}>Close</Button>
                    <Button type="submit">Delete Programs</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

export default DeleteProgramModal;