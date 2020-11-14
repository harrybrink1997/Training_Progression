import React from 'react'

const InputLabel = ({ text, toolTip, leftIcon }) => (
    <div className='customInputLabel'>
        {leftIcon}
        <label>{text}</label>
        {toolTip}
    </div>
)

export default InputLabel