import React, { useState } from 'react'
import { Modal, Button, Form, List } from 'semantic-ui-react'

const OverrideReplaceProgramModal = ({ handleFormSubmit, programUID, mismatchedParams }) => {

    const [show, setShow] = useState(false);
    const programName = programUID
    const handleClose = (event) => {
        setShow(false);
    }

    const handleButtonClick = (replacement) => {
        handleFormSubmit(programName, replacement)
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
                    We ran some quick checks and it seems you're already actively completing {programUID.split('_')[0]}.
                    <br /><br />
                    The new version of the program sent by your coach has a different:
                    <List bulleted>
                        {
                            Object.keys(mismatchedParams).map(param => {
                                if (!mismatchedParams[param]) {
                                    return (
                                        <List.Item key={param}>
                                            {param}
                                        </List.Item>
                                    )
                                }
                            })
                        }
                    </List>
                    <div>
                        Due to this we can either replace the program completely or you can keep the existing program you're on.
                    </div>
                </div>
                <div className='rowContainer'>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleButtonClick(true) }}
                            className='lightPurpleButton-inverted'
                        >
                            Replace Completely
                        </Button>
                    </div>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleButtonClick(false) }}
                            className='lightPurpleButton-inverted'
                        >
                            Keep Existing
                        </Button>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    );
}

export default OverrideReplaceProgramModal;