import React from 'react'

import InputLabel from '../CustomComponents/DarkModeInput'

const ForgetPasswordLink = ({ passwordForgetdirectHandler }) => {

    const handleClick = () => {
        passwordForgetdirectHandler()
    }

    return (
        <div id='passwordForgetContainer'>
            <InputLabel
                text="Forgot Password?  &nbsp;"
                custID='passwordForgetLinkLabel'
            />
            <a onClick={handleClick}>Reset Password</a>
        </div>
    )
}

export default ForgetPasswordLink