import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'
import ExerciseTableContainerNoBtns from '../CustomComponents/exerciseTablesNoBtns'

const ConfirmNullExerciseData = ({ handleFormProceed, showModal, nullExTableData, scheme }) => {

    const [revertProcessing, setRevertProcessing] = useState(false)
    const [proceedProcessing, setProceedProcessing] = useState(false)

    const handleRevert = (event) => {
        setRevertProcessing(true)
        event.preventDefault()
        handleFormProceed(false)
        setRevertProcessing(false)

    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setProceedProcessing(true)
        handleFormProceed(true)

    }

    return (
        <Modal
            size='small'
            centered={false}
            open={showModal}
        >
            <Modal.Header>Empty Input Detected</Modal.Header>
            <Modal.Content>
                <div className='modalContentWarningHeader'>
                    WARNING!
                </div>
                <div id='cpPageNullDataProceedWarning'>
                    We have run validation checks and it seems the exercise data you're submitting is not complete. Please note if this data submits it will not contribute to your load data for today.
                </div>

                <ExerciseTableContainerNoBtns
                    dayText='View more details...'
                    tableData={nullExTableData}
                    tableScheme={scheme}
                    defaultOpen={false}
                    dayIndex='nullExDataCheck'
                />
            </Modal.Content>
            <Modal.Actions>
                {
                    revertProcessing ?
                        <Button loading className='lightPurpleButton' onClick={handleRevert}>Revert</Button>
                        :
                        <Button className='lightPurpleButton' onClick={handleRevert}>Revert</Button>
                }
                {
                    proceedProcessing ?
                        <Button loading className='lightPurpleButton-inverted' onClick={handleSubmit}>Proceed</Button>
                        :
                        <Button className='lightPurpleButton-inverted' onClick={handleSubmit}>Proceed</Button>

                }
            </Modal.Actions>
        </Modal>
    );
}

export default ConfirmNullExerciseData;