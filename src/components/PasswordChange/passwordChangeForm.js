import React, { useState } from 'react'
import { Button, Form, Input } from 'semantic-ui-react'

const INITIAL_STATE = {
    passwordOne: '',
    passwordTwo: '',
    loading: true
};


const PasswordChangeForm = ({ submitPasswordChangeHandler, submitProcessing }) => {

    const [passwordOne, setPasswordOne] = useState(INITIAL_STATE.passwordOne)
    const [passwordTwo, setPasswordTwo] = useState(INITIAL_STATE.passwordTwo)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (passwordOne != '' && passwordOne === passwordTwo) {
            submitPasswordChangeHandler(passwordOne)
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
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
                passwordOne != ''
                && passwordOne === passwordTwo
                &&
                <div id='loginBtnContainer'>
                    {
                        submitProcessing ?
                            < Button
                                loading
                                className='lightPurpleButton'
                                type="submit">
                                Change Password
                            </Button>
                            :
                            < Button
                                className='lightPurpleButton'
                                type="submit">
                                Change Password
                            </Button>
                    }
                </div>
            }
        </Form >


    )
}

export default PasswordChangeForm