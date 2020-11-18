import React, { useState } from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown } from 'semantic-ui-react'

const CurrentProgramDropdown = ({ programList, activeProgram, buttonHandler }) => {

    const processData = (renderList) => {

        var returnData = []

        if (renderList.length > 0) {
            renderList.forEach(program => {
                returnData.push({
                    key: program,
                    value: program,
                    text: program
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
            text='Current Programs'
            onChange={buttonHandler}
            options={dropDownData}
            defaultValue={activeProgram}
        />
    )
}

export default withFirebase(CurrentProgramDropdown);