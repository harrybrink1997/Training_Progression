import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'

const SubmitDayModal = ({ handleFormSubmit, submitDataProcessing }) => {

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
            trigger=
            {
                submitDataProcessing ?
                    <Button loading className='closeOffPeriod'>Submit Day</Button>
                    :
                    <Button className='closeOffPeriod'>Submit Day</Button>

            }
        >
            <Modal.Header>Submit Day</Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <div className='modalContentWarningHeader'>
                        WARNING!
                    </div>
                    <div id='cpPageSubmitDayWarningContent'>
                        This action is not reversible. Once you submit a day, you can no longer add, remove or edit exercises for that day.
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button className='lightPurpleButton-inverted' onClick={handleClose}>Close</Button>
                    <Button className='submitBtn' type="submit">Submit Day</Button>
                </Modal.Actions>
            </Form>
        </Modal>
    );
}

export default SubmitDayModal;