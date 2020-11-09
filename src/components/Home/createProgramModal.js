import { fractionDependencies } from 'mathjs';
import React, { useState, useEffect } from 'react'
import './home.css'
// import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap'

// const CreateProgramModal = ({ handleFormSubmit }) => {

//     const [show, setShow] = useState(false);
//     const [rpeActive, setRPEActive] = useState(false)
//     const [weightActive, setWeightActive] = useState(true)

//     const [programName, setProgramName] = useState('')

//     const handleClose = (event) => {
//         setShow(false);
//     }

//     const onChange = (event) => {
//         if (event.target.name === 'programName') {
//             setProgramName(event.target.value)
//         }
//     }

//     const handleSubmit = (event) => {
//         event.preventDefault();
//         setShow(false);
//         setProgramName('')

//         if (rpeActive) {
//             handleFormSubmit(programName, 'rpe_time')
//         } else {
//             handleFormSubmit(programName, 'weight_reps')
//         }

//     }

//     const handleRadioToggle = (event) => {
//         if (event.target.id == 'rpe-time' && !rpeActive) {
//             setWeightActive(false)
//             setRPEActive(true)
//         } else if (event.target.id == 'weight-reps' && !weightActive) {
//             setRPEActive(false)
//             setWeightActive(true)
//         }
//     }

//     const handleShow = () => setShow(true);

//     return (
//         <div>
//             <Button variant="danger" onClick={handleShow}>
//                 Create Program
//             </Button>

//             <Modal
//                 show={show}
//                 onHide={handleClose}
//                 aria-labelledby="contained-modal-title-vcenter"
//                 centered
//             >
//                 <Modal.Header closeButton>
//                     <Modal.Title>Create A Program</Modal.Title>
//                 </Modal.Header>
//                 <Form onSubmit={handleSubmit}>
//                     <Modal.Body>
//                         <InputGroup
//                             name="programName"
//                             as="input"
//                             id="newProgramNameInput"
//                             onChange={onChange}
//                             value={programName}
//                             valueplaceholder="Enter Program Name..."
//                             required
//                         />
//                         <div key='rpe-time' className="mb-3">
//                             <Form.Check
//                                 type='radio'
//                                 id='weight-reps'
//                                 label='Weight / Repetitions'
//                                 checked={weightActive}
//                                 onClick={handleRadioToggle}
//                                 onChange={() => { }}

//                             />
//                             <Form.Check
//                                 type='radio'
//                                 id='rpe-time'
//                                 label='RPE / Time / Repetions'
//                                 checked={rpeActive}
//                                 onClick={handleRadioToggle}
//                                 onChange={() => { }}
//                             />

//                         </div>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="secondary" onClick={handleClose}>Close</Button>
//                         <Button variant="primary" type="submit">Create Program</Button>
//                     </Modal.Footer>
//                 </Form>
//             </Modal>
//         </div >
//     );
// }

import { Button, Modal, Form, Header, Image } from 'semantic-ui-react'


const CreateProgramModal = ({ handleFormSubmit }) => {

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
            trigger={<Button>Create Program</Button>}
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


export default CreateProgramModal;