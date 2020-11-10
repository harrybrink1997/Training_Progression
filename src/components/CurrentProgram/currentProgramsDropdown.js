import React from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown } from 'semantic-ui-react'


const CurrentProgramsDropdown = ({ programList, activeProgram, buttonHandler }) => {

    return (

        <Dropdown text='Current Programs'>
            <Dropdown.Menu>
                {programList.map(programName => {
                    if (programName === activeProgram) {
                        return (
                            <Dropdown.Item
                                onClick={buttonHandler}
                                key={programName}
                                value={programName}
                                active>
                                {programName}
                            </Dropdown.Item>
                        )
                    } else {
                        return (
                            <Dropdown.Item
                                onClick={buttonHandler}
                                key={programName}
                                value={programName}>
                                {programName}
                            </Dropdown.Item>
                        )
                    }
                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default withFirebase(CurrentProgramsDropdown);