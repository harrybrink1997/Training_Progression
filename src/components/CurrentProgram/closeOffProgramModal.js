import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'

const CloseOffProgramModal = ({ handleFormSubmit }) => {

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
            trigger={<Button className='lightPurpleButton-inverted'>Close Off Program</Button>}
        >
            <Modal.Header>Close Off Program</Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <div className='modalContentWarningHeader'>
                        WARNING!
                    </div>
                    <div id='cpPageSubmitDayWarningContent'>
                        This action is not reversible. Once closed off a program is no longer editable and you
                        will only be able to access the historical data.
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button className='lightPurpleButton-inverted' onClick={handleClose}>Cancel</Button>
                    <Button className='submitBtn' type="submit">Proceed</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}


export default CloseOffProgramModal;