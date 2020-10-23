import React from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown } from 'react-bootstrap'


const CurrentProgramsDropdown = (programList) => {
    return (

        <Dropdown>
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
                Current Programs
                </Dropdown.Toggle>
            <Dropdown.Menu variant="dark">
                {programList.map(programName => {
                    return (
                        <Dropdown.Item as="button" key={programName} value={programName} >{programName}</Dropdown.Item>
                    )
                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default withFirebase(CurrentProgramsDropdown);