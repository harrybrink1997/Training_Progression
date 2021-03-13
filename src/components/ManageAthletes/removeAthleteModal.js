import React, { useState } from 'react'
import { Modal, Button, Card, Icon, List } from 'semantic-ui-react'

const RemoveAthleteModal = ({ handleFormSubmit }) => {

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
            trigger={
                <div className='clickableDiv'>
                    <Card>
                        <Card.Content className='iconContent'>
                            <Icon name='group' size='huge' />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header textAlign='center'>Remove <br /> Athlete</Card.Header>
                        </Card.Content>
                    </Card>
                </div>
            }
        >
            <Modal.Header>Submit Day</Modal.Header>

            <Modal.Content>
                <div className='modalContentWarningHeader'>
                    WARNING!
                    </div>
                <div id='cpPageSubmitDayWarningContent'>
                    This action is not reversible. Once you remove an athlete the following will occur:
                    <br />
                    <List bulleted>
                        <List.Item key='cantAssign'>
                            You will no longer be able to assign programs.
                        </List.Item>
                        <List.Item key='noAccess'>
                            You will no longer have access to any of their pending, current and past data.
                        </List.Item>
                        <List.Item key='programRemoval'>
                            All programs you have recently assigned to them in their pending or current programs will be removed from their account.
                        </List.Item>
                    </List>
                    <br />
                    Are you sure you want to proceed?
                </div>
                <div className="modalButtons">
                    <Button className='lightPurpleButton-inverted' onClick={handleClose}>No, take me back</Button>
                    <Button className='submitBtn' onClick={(e) => { handleSubmit(e) }}>Yes, proceed</Button>
                </div>
            </Modal.Content>
        </Modal>
    );
}

export default RemoveAthleteModal;