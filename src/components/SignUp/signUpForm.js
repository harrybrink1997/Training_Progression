import React, { useState } from 'react'
import { Button, Form, Input } from 'semantic-ui-react'

const INITIAL_STATE = {
    email: '',
    passwordOne: '',
    passwordTwo: '',
    username: '',
    loading: true
};


const SignUpForm = ({ submitSignUpHandler, signUpProcessing }) => {

    const [email, setEmail] = useState(INITIAL_STATE.email)
    const [passwordOne, setPasswordOne] = useState(INITIAL_STATE.passwordOne)
    const [passwordTwo, setPasswordTwo] = useState(INITIAL_STATE.passwordTwo)
    const [username, setUsername] = useState(INITIAL_STATE.username)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (username != '' && email != '' && passwordOne != '' && passwordOne === passwordTwo) {
            submitSignUpHandler(username, email, passwordOne)
        }
    }

    return (
        <Form onSubmit={handleSubmit}>

            <Form.Field>
                <Input
                    name="username"
                    value={username}
                    onChange={(e, { value }) => setUsername(value)}
                    // type="text"
                    placeholder="Enter Full Name"
                />
            </Form.Field>
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
                    value={passwordOne}
                    onChange={(e, { value }) => setPasswordOne(value)}
                    type="password"
                    placeholder="Password"
                />
            </Form.Field>
            <Form.Field>
                <Input
                    name="password"
                    value={passwordTwo}
                    onChange={(e, { value }) => setPasswordTwo(value)}
                    type="password"
                    placeholder="Re-Enter Password"
                />
            </Form.Field>
            {
                username != ''
                && email != ''
                && passwordOne != ''
                && passwordOne === passwordTwo
                &&
                <div id='loginBtnContainer'>
                    {
                        signUpProcessing ?

                            < Button
                                loading
                                className='lightPurpleButton'
                                type="submit">
                                Sign Up
                            </Button>
                            :
                            < Button
                                className='lightPurpleButton'
                                type="submit">
                                Sign Up
                            </Button>
                    }
                </div>
            }
        </Form >


    )
}

export default SignUpForm