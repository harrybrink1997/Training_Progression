import React, { useState } from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown } from 'semantic-ui-react'

const ProgramsDropdown = ({ programList, headerString, selectHandler, programType }) => {

    const generateDropData = (list) => {

        var inputData = []
        if (programList) {
            list.forEach(program => {
                inputData.push({
                    key: program,
                    text: program,
                    value: program,
                })
            })
        }
        return inputData
    }

    const [dropdownData, setdropdownData] = useState(generateDropData(programList))

    const handleProgramSelect = (event, { value }) => {
        event.preventDefault()
        selectHandler(programType, value)
    }

    return (
        <div>
            {
                programList.length > 0 &&
                <Dropdown placeholder={headerString} fluid multiple selection options={dropdownData} onChange={handleProgramSelect} />
            }
        </div>
    )
}

export default withFirebase(ProgramsDropdown);