import React, { useState } from 'react'
import { Button, Form, Input } from 'semantic-ui-react'

import InputLabel from '../CustomComponents/DarkModeInput'


const INITIAL_STATE = {
    email: '',
    password: '',
    loading: true
};


const LoginForm = ({ submitLoginHandler }) => {

    const [email, setEmail] = useState(INITIAL_STATE.email)
    const [password, setPassword] = useState(INITIAL_STATE.password)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (email != '' && password != '') {
            submitLoginHandler(email, password)
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
            <Form.Field>
                <Input
                    name="password"
                    value={password}
                    onChange={(e, { value }) => setPassword(value)}
                    type="password"
                    placeholder="Password"
                />
            </Form.Field>
            {
                email != '' && password != '' &&
                <div id='loginBtnContainer'>
                    < Button
                        className='lightPurpleButton'
                        type="submit">
                        Sign In
                    </Button>
                </div>
            }
        </Form >


    )
}

export default LoginForm