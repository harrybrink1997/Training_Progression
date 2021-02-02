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
                    errorType === 'athleteCurrBelongsToTeam' &&
                    <AthleteAlreadyBelongsToTeam
                        clickHandler={handleRevert}
                        name={capitaliseFirstLetter(athleteName.split()[0])}
                    />
                }
            </Modal.Content>
        </Modal>
    );
}

const AthleteAlreadyBelongsToTeam = ({ clickHandler, name }) => {
    return (
        <>
            <div>
                We did some checking and {name} is already apart of the team you're trying to assign to them.
            </div>
            <div className='centred-info sml-margin-top'>
                <Button className='lightPurpleButton' onClick={(e) => { clickHandler(e) }}>Back</Button>
            </div>
        </>
    )
}


export default ViewProgramErrorModal;