import React from 'react'

const InputLabel = ({ text, toolTip, leftIcon, custID }) => (
    <div className='customInputLabel' id={custID}>
        {leftIcon}
        <label>{text}</label>
        {toolTip}
    </div>
)

export default InputLabel