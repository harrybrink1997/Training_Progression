import React, { useState } from 'react'
import { Modal, Button, Form, List } from 'semantic-ui-react'

const ReplaceProgramOptionsModal = ({ handleFormSubmit, programUID, currentDayInProgram }) => {

    const [show, setShow] = useState(false);
    const programName = programUID
    const currentDay = currentDayInProgram
    const handleClose = (event) => {
        setShow(false);
    }

    const handleButtonClick = (replacementType) => {
        handleFormSubmit(programName, replacementType, currentDay)
        handleClose()
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
                <Button className='lightGreenButton-inverted'>Accept</Button>
            }
        >
            <Modal.Header>Woah! Hold Up.</Modal.Header>

            <Modal.Content>
                <div id='cpPageSubmitDayWarningContent'>
                    We ran some quick checks and it seems you're already actively completing {programUID.split('_')[0]}
                    <br /><br />
                        There's two ways we can work around this.
                        <List bulleted>
                        <List.Item>
                            The first option is we can replace the program entirely.
                            </List.Item>
                        <List.Item>
                            The second option is we can keep your all your current data for the program and just replace all the future data that you're yet to complete.
                            </List.Item>
                    </List>
                </div>
                <div className='rowContainer'>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleButtonClick('all') }}
                            className='lightPurpleButton-inverted'
                        >
                            Replace Completely
                        </Button>
                    </div>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleButtonClick('future') }}
                            className='lightPurpleButton-inverted'
                        >
                            Replace Only Future
                        </Button>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    );
}

export default ReplaceProgramOptionsModal;