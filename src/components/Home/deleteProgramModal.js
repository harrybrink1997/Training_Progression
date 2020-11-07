import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import ProgramsDropdown from './programsDropdown'

const DeleteProgramModal = ({ handleFormSubmit, currentProgramList, pastProgramList }) => {

    const [show, setShow] = useState(false);

    const [programName, setProgramName] = useState('')

    const [selectedPastPrograms, setSelectedPastPrograms] = useState([])
    const [selectedCurrPrograms, setSelectedCurrPrograms] = useState([])


    const handleClose = (event) => {
        setShow(false);
    }

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

    const handleShow = () => setShow(true);

    return (
        <div>
            <Button variant="danger" onClick={handleShow}>
                Delete Program
            </Button>

            <Modal show={show}
                onHide={handleClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Programs</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <h5>WARNING! This action is irreversible. This will permanently delete the program and its data from the database.</h5>
                        </Row>
                        <Row className="justify-content-md-center">
                            <Col>
                                <ProgramsDropdown
                                    programList={currentProgramList}
                                    headerString={'Select Current Program'}
                                    selectHandler={handleProgramSelect}
                                    programType='current' />
                            </Col>
                            <Col>
                                <ProgramsDropdown
                                    programList={pastProgramList}
                                    headerString={'Select Past Program'}
                                    selectHandler={handleProgramSelect}
                                    programType='past' />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close</Button>
                        <Button variant="primary" type="submit">Delete Programs</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
}

export default DeleteProgramModal;