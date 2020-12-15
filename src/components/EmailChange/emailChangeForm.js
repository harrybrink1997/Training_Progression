import React, { useState } from 'react'
import { Button, Form, Input } from 'semantic-ui-react'

const INITIAL_STATE = {
    emailOne: '',
    emailTwo: '',
    loading: true
};


const EmailChangeForm = ({ submitEmailChangeHandler, submitProcessing }) => {

    const [emailOne, setEmailOne] = useState(INITIAL_STATE.emailOne)
    const [emailTwo, setEmailTwo] = useState(INITIAL_STATE.emailTwo)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (emailOne != '' && emailOne === emailTwo) {
            submitEmailChangeHandler(emailOne)
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Field>
                <Input
                    name="email"
                    value={emailOne}
                    onChange={(e, { value }) => setEmailOne(value)}
                    type="text"
                    placeholder="Email"
                />
            </Form.Field>
            <Form.Field>
                <Input
                    name="email"
                    value={emailTwo}
                    onChange={(e, { value }) => setEmailTwo(value)}
                    type="text"
                    placeholder="Re-Enter Email"
                />
            </Form.Field>
            {
                emailOne != ''
                && emailOne === emailTwo
                &&
                <div id='loginBtnContainer'>
                    {
                        submitProcessing ?
                            < Button
                                loading
                                className='lightPurpleButton'
                                type="submit">
                                Change Email
                            </Button>
                            :
                            < Button
                                className='lightPurpleButton'
                                type="submit">
                                Change Email
                            </Button>
                    }
                </div>
            }
        </Form >


    )
}

export default EmailChangeForm