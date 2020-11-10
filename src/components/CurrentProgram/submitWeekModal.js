import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'

const SubmitWeekModal = ({ handleFormSubmit }) => {

    const [show, setShow] = useState(false);

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);
        handleFormSubmit()

    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={<Button>Submit Week</Button>}
        >
            <Modal.Header>Submit Week</Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    WARNING! <br /> This action is not reversible. Once closed out a program week is no longer editable and you
                        will be moved to the next week.
                    </Modal.Content>
                <Modal.Actions>
                    <Button onClick={handleClose}>Close</Button>
                    <Button type="submit">Submit Week</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}
// const SubmitWeekModal = ({ handleFormSubmit }) => {

// const [show, setShow] = useState(false);

// const handleClose = (event) => {
//     setShow(false);
// }

// const handleSubmit = (event) => {
//     event.preventDefault()
//     setShow(false);
//     handleFormSubmit()

// }

// const handleShow = () => setShow(true);

//     return (
//         <div>
//             <Button variant="danger" onClick={handleShow}>
//                 Submit Week
//             </Button>

//             <Modal
//                 show={show}
//                 onHide={handleClose}
//                 aria-labelledby="contained-modal-title-vcenter"
//                 centered
//             >
//                 <Modal.Header closeButton>
//                     <Modal.Title>Submit Current Week</Modal.Title>
//                 </Modal.Header>
// <Form onSubmit={handleSubmit}>
//     <Modal.Body>
//         WARNING! <br /> This action is not reversible. Once closed out a program week is no longer editable and you
//         will be moved to the next week.
//     </Modal.Body>
//     <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>Close</Button>
//         <Button variant="warning" type="submit">Submit Week</Button>
//     </Modal.Footer>
// </Form>
//             </Modal>
//         </div >
//     );
// }


export default SubmitWeekModal;