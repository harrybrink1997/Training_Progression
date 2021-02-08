import React from 'react'

const FooterErrorMessage = (props) => {
    return (
        <div className='errorMessageContainer'>
            <p>{props.children}</p>
        </div>
    )
}

export { FooterErrorMessage }