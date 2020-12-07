import React, { useState } from 'react'

import { Dropdown } from 'semantic-ui-react'

const ExerciseDifficultyDropdown = ({ buttonHandler, initValue }) => {

    const [value, setValue] = useState(initValue)

    const data = [
        {
            key: 'Beginner',
            value: 'Beginner',
            text: 'Beginner'
        },
        {
            key: 'Intermediate',
            value: 'Intermediate',
            text: 'Intermediate'
        },
        {
            key: 'Advance',
            value: 'Advance',
            text: 'Advance'
        }
    ]

    const handleChange = (event, { value }) => {
        setValue(value)
        buttonHandler(value)
    }

    return (

        <Dropdown
            selection
            placeholder='Select Experience Level'
            fluid
            text={value}
            onChange={handleChange}
            options={data}
            value={value}
        />
    )
}

export default ExerciseDifficultyDropdown;