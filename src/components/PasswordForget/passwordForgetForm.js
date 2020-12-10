import React, { useState } from 'react'
import { Form, Input } from 'semantic-ui-react'

const INITIAL_STATE = {
    email: '',
};


const PasswordForgetForm = ({ submitPasswordForgetHandler, buttonIcon }) => {

    const [email, setEmail] = useState(INITIAL_STATE.email)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (email != '') {
            submitPasswordForgetHandler(email)
        }
    }

    return (
        <Form onSubmit={handleSubmit}>

            <Form.Field>
                <Input
                    name="email"
                    value={email}
                    onChange={(e, { value }) => setEmail(value)}
                    // type="text"
                    placeholder="Email Address"
                />
            </Form.Field>
            {
                email != ''
                &&
                <div id='loginBtnContainer'>
                    {buttonIcon}
                </div>
            }
        </Form >


    )
}

export default PasswordForgetForm