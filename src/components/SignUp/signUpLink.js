import React from 'react'

import InputLabel from '../CustomComponents/DarkModeInput'

const SignUpLink = ({ signUpdirectHandler }) => {

    const handleClick = () => {
        signUpdirectHandler()
    }

    return (
        <div id='signUpEmailContainer'>
            <InputLabel
                text="Don't have an account?  &nbsp;"
                custID='signUpLinkLabel'
            />
            <a onClick={handleClick}>Sign Up with Email</a>
        </div>
    )
}

export default SignUpLink