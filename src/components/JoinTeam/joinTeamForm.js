import React, { useState } from 'react'
import { Button, Form, Input } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

const INITIAL_STATE = {
    email: '',
    message: '',
    loading: true
};


const JoinTeamForm = ({ submitRequestHandler, submitProcessing }) => {

    const [email, setEmail] = useState(INITIAL_STATE.email)
    const [message, setMessage] = useState(INITIAL_STATE.message)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (email != '') {
            submitRequestHandler(email, message)
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Field>
                <InputLabel
                    text='What is the email of your coach?'
                />
                <Input
                    name="email"
                    value={email}
                    onChange={(e, { value }) => setEmail(value)}
                    type="text"
                    placeholder="Email"
                />
            </Form.Field>
            <Form.Field>
                <InputLabel
                    text='Additional Notes'
                />
                <Input
                    name="message"
                    value={message}
                    onChange={(e, { value }) => setMessage(value)}
                    type="text"
                    placeholder="Add notes here"
                />
            </Form.Field>
            {
                email != ''
                &&
                <div id='loginBtnContainer'>
                    {
                        submitProcessing ?
                            < Button
                                loading
                                className='lightPurpleButton'
                                type="submit">
                                Submit Request
                            </Button>
                            :
                            < Button
                                className='lightPurpleButton'
                                type="submit">
                                Submit Request
                            </Button>
                    }
                </div>
            }
        </Form >


    )
}

export default JoinTeamForm