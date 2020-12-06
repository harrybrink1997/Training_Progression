import React, { useState } from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown, Header } from 'semantic-ui-react'

const MuscleSelectionDropdown = ({ selectHandler, headerString }) => {

    const muscleGroups = {
        Legs: ['Quadraceps', "Hamstrings", "Gluteal Muscles"],
        Shoulders: ['Front Deltoid', 'Mid Deltoid', 'Rear Deltoid']
    }


    const generateDropData = () => {
        var inputData = []

        Object.keys(muscleGroups).forEach(muscleGroup => {
            inputData.push({
                text: muscleGroup,
                value: muscleGroup,
                content: <Dropdown.Header content={muscleGroup}></Dropdown.Header>,
                disabled: true
            })
            inputData.push({
                content: <Dropdown.Divider />
            })

            muscleGroups[muscleGroup].forEach(muscle => {
                inputData.push({
                    key: muscle,
                    text: muscle,
                    value: muscle,
                })
            })

        })


        return inputData
    }

    const [dropdownData] = useState(generateDropData())

    const handleProgramSelect = (event, { value }) => {
        event.preventDefault()
        // selectHandler(programType, value)
    }

    return (

        <Dropdown placeholder={headerString} fluid multiple selection options={dropdownData} onChange={handleProgramSelect} />

    )
}

export default MuscleSelectionDropdown;