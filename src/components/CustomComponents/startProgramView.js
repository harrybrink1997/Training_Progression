import React, { useState } from 'react'
import { Modal, Button } from 'semantic-ui-react'


const StartProgramView = ({ handleFormProceed }) => {

    const [processing, setProcessing] = useState(false)

    const handleSubmit = (event) => {
        event.preventDefault()
        setProcessing(true)
        handleFormProceed(true)
    }

    return (
        <div className='centred-info'>
            <div className='pageContainerLevel1 half-width'>
                <div className='pageSubHeader1'>
                    Welcome to a new program!
                </div>
                <div className='pageSubHeader2'>
                    Would you like to officially kick things off?
                </div>
                <div className='sml-margin-top'>
                    <div className='centred-info'>
                        {
                            processing ?
                                <Button
                                    className='lightPurpleButton'
                                    loading
                                >Lets Go</Button>
                                :
                                <Button className='lightPurpleButton' onClick={(e) => { handleSubmit(e) }}>Lets Go</Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StartProgramView;