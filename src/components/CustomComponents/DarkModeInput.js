import React from 'react'

const InputLabel = ({ text, toolTip }) => (
    <div className='customInputLabel'>
        <label>{text}</label>
        {toolTip}
    </div>
)

export default InputLabel