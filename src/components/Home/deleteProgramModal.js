import React, { useState, useEffect } from 'react'
// import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import ProgramsDropdown from './programsDropdown'
import { Modal, Header, Image, Button } from 'semantic-ui-react'
import './home.css'



// const DeleteProgramModal = ({ handleFormSubmit, currentProgramList, pastProgramList }) => {

//     const [show, setShow] = useState(false);

//     const [programName, setProgramName] = useState('')

//     const [selectedPastPrograms, setSelectedPastPrograms] = useState([])
//     const [selectedCurrPrograms, setSelectedCurrPrograms] = useState([])


//     const handleClose = (event) => {
//         setShow(false);
//     }

//     const handleSubmit = (event) => {
//         event.preventDefault();
//         setShow(false);

//         handleFormSubmit(selectedCurrPrograms, selectedPastPrograms)
//     }

//     const handleProgramSelect = (programType, programList) => {
//         if (programType == 'past') {
//             setSelectedPastPrograms(programList)

//         } else {
//             setSelectedCurrPrograms(programList)

//         }
//     }

//     const handleShow = () => setShow(true);

//     return (
//         <div>
//             <Button variant="danger" onClick={handleShow}>
//                 Delete Program
//             </Button>

//             <Modal show={show}
//                 onHide={handleClose}
//             >
//                 <Modal.Header closeButton>
//                     <Modal.Title>Delete Programs</Modal.Title>
//                 </Modal.Header>
//                 <Form onSubmit={handleSubmit}>
//                     <Modal.Body>
//                         <Row>
//                             <h5>WARNING! This action is irreversible. This will permanently delete the program and its data from the database.</h5>
//                         </Row>
//                         <Row className="justify-content-md-center">
//                             <Col>
//                                 <ProgramsDropdown
//                                     programList={currentProgramList}
//                                     headerString={'Select Current Program'}
//                                     selectHandler={handleProgramSelect}
//                                     programType='current' />
//                             </Col>
//                             <Col>
//                                 <ProgramsDropdown
//                                     programList={pastProgramList}
//                                     headerString={'Select Past Program'}
//                                     selectHandler={handleProgramSelect}
//                                     programType='past' />
//                             </Col>
//                         </Row>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="secondary" onClick={handleClose}>Close</Button>
//                         <Button variant="primary" type="submit">Delete Programs</Button>
//                     </Modal.Footer>
//                 </Form>
//             </Modal>
//         </div >
//     );
// }



const DeleteProgramModal = ({ handleFormSubmit, currentProgramList, pastProgramList }) => {

    const [open, setOpen] = useState(false)

    const [value, setValue] = useState('')

    const handleChange = (e, { value }) => {
        setValue(value)
    }


    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<Button>Delete Programs</Button>}
        >
            <Modal.Header>Select a Photo</Modal.Header>
            <Modal.Content image>
                <Image size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' wrapped />
                <Modal.Description>
                    <Header>Default Profile Image</Header>
                    <p>
                        We've found the following gravatar image associated with your e-mail
                        address.
                    </p>
                    <p>Is it okay to use this photo?</p>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={() => setOpen(false)}>
                    Nope
                </Button>
                <Button
                    content="Yep, that's me"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={() => setOpen(false)}
                    positive
                />
            </Modal.Actions>
        </Modal>
    );
}

export default DeleteProgramModal;