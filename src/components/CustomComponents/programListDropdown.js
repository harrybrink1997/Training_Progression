import React, { useState } from 'react'

import { Dropdown } from 'semantic-ui-react'


const ProgramListDropdown = ({ programList, activeProgram, buttonHandler, headerText }) => {

    const processData = (renderList) => {

        var returnData = []

        if (renderList.length > 0) {
            renderList.forEach(program => {
                returnData.push({
                    key: program,
                    value: program,
                    text: program.split('_')[0]
                })
            })
        }
        return returnData
    }

    const [dropDownData] = useState(processData(programList))

    return (

        <Dropdown
            selection
            fluid
            text={headerText}
            onChange={buttonHandler}
            options={dropDownData}
            defaultValue={activeProgram}
        />
    )
}

export default ProgramListDropdown;