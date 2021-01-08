import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'

const ManageAthleteModal = ({ athleteUID, athleteData }) => {

    const [show, setShow] = useState(false);
    const athleteId = athleteUID
    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

    }
    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={
                <Button className='lightPurpleButton-inverted'>Manage Athlete</Button>
            }
        >
            <Modal.Header>{athleteData.username}</Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                </Modal.Content>
            </Form>
        </Modal>
    );
}

export default ManageAthleteModal;