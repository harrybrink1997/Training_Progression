import React, { useState } from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { capitaliseFirstLetter } from '../../constants/stringManipulation'


const ViewProgramErrorModal = ({ handleFormProceed, showModal, errorType, athleteName }) => {

    const handleRevert = (event) => {
        event.preventDefault()
        handleFormProceed(false)

    }

    const handleSubmit = (event) => {
        event.preventDefault()
        handleFormProceed(true)
    }

    return (
        <Modal
            size='small'
            centered={false}
            open={showModal}
        >
            <Modal.Header>Something's Wrong...</Modal.Header>
            <Modal.Content>
                {
                    errorType === 'inPending' &&
                    <ProgramInPending
                        clickHandler={handleRevert}
                        name={capitaliseFirstLetter(athleteName.split()[0])}
                    />
                }
                {
                    errorType === 'nonExistent' &&
                    <ProgramNonExistent
                        clickHandler={handleRevert}
                        name={capitaliseFirstLetter(athleteName.split()[0])}
                    />
                }
            </Modal.Content>
        </Modal>
    );
}

const ProgramInPending = ({ clickHandler, name }) => {
    return (
        <>
            <div>
                We did some checking and the program you want to view hasn't been accepted by {name} yet. You must wait for {name} to accept the program before you can view it.
            </div>
            <div className='centred-info sml-margin-top'>
                <Button className='lightPurpleButton' onClick={(e) => { clickHandler(e) }}>Back</Button>
            </div>
        </>
    )
}

const ProgramNonExistent = ({ clickHandler, name }) => {
    return (
        <>
            <div>
                We did some checking and you are unable to view this program. The program has been deleted and no longer exists on {name}'s account.
            </div>
            <div className='centred-info sml-margin-top'>
                <Button className='lightPurpleButton' onClick={(e) => { clickHandler(e) }}>Back</Button>
            </div>
        </>
    )
}

export default ViewProgramErrorModal;