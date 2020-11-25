import React, { useState } from 'react'

import { Dropdown } from 'semantic-ui-react'

const GoalDifficultyDropdown = ({ buttonHandler, initialValue }) => {

    const [value, setValue] = useState(initialValue)

    const data = [
        {
            key: 'Easy',
            value: 'Easy',
            text: 'Easy'
        },
        {
            key: 'Medium',
            value: 'Medium',
            text: 'Medium'
        },
        {
            key: 'Hard',
            value: 'Hard',
            text: 'Hard'
        }
    ]

    const handleChange = (event, { value }) => {
        setValue(value)
        buttonHandler(value)
    }

    return (

        <Dropdown
            selection
            fluid
            text={value}
            onChange={handleChange}
            options={data}
        />
    )
}

export default GoalDifficultyDropdown;