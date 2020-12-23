import React, { useState } from 'react'
import { Button, Form, Input, Popup, Icon } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

const INITIAL_STATE = {
    email: '',
    passwordOne: '',
    passwordTwo: '',
    username: '',
    loading: true,
    userType: 'athlete'
};


const SignUpForm = ({ submitSignUpHandler, signUpProcessing }) => {

    const [email, setEmail] = useState(INITIAL_STATE.email)
    const [passwordOne, setPasswordOne] = useState(INITIAL_STATE.passwordOne)
    const [passwordTwo, setPasswordTwo] = useState(INITIAL_STATE.passwordTwo)
    const [username, setUsername] = useState(INITIAL_STATE.username)
    const [userType, setUserType] = useState(INITIAL_STATE.userType)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (username != '' && email != '' && passwordOne != '' && passwordOne === passwordTwo) {
            submitSignUpHandler(username, email, passwordOne, userType)
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
            <InputLabel
                text='What will you be using Corvus Strength as?'
                toolTip={<Popup
                    basic
                />}
            />
            <Form.Group inline>
                <Form.Radio
                    label='Athlete'
                    value='athlete'
                    checked={userType === 'athlete'}
                    onChange={(e, { value }) => setUserType(value)}
                />
                <Form.Radio
                    label='Coach'
                    value='coach'
                    checked={userType === 'coach'}
                    onChange={(e, { value }) => setUserType(value)}
                />

            </Form.Group>
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