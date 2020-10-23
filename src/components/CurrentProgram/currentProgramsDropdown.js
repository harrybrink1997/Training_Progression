import React from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown } from 'react-bootstrap'


const CurrentProgramsDropdown = ({ programList, activeProgram, buttonHandler }) => {

    console.log(activeProgram)
    return (

        <Dropdown >
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
                Current Programs
                </Dropdown.Toggle>
            <Dropdown.Menu variant="dark">
                {programList.map(programName => {
                    if (programName === activeProgram) {
                        return (
                            <Dropdown.Item
                                as="button"
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
                                as="button"
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