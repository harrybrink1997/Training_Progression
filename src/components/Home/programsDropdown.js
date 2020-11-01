import React, { useState } from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown } from 'react-bootstrap'


const ProgramsDropdown = ({ programList, headerString }) => {

    const [selectedProgramList, setSelectedProgramList] = useState([])

    const handleProgramSelect = (event) => {
        event.preventDefault()
        if (selectedProgramList.indexOf(event.target.value) == -1) {
            var newList = [...selectedProgramList, event.target.value]
            setSelectedProgramList(newList)
        } else {
            var newList = selectedProgramList.filter(program => {
                return program != event.target.value
            })
            setSelectedProgramList(newList)
        }
    }

    return (

        <Dropdown >
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
                {headerString}
            </Dropdown.Toggle>
            <Dropdown.Menu variant="dark">
                {programList.map(programName => {
                    if (selectedProgramList.indexOf(programName) > -1) {
                        return (
                            <Dropdown.Item
                                as="button"
                                onClick={handleProgramSelect}
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
                                onClick={handleProgramSelect}
                                key={programName}
                                value={programName}>
                                {programName}
                            </Dropdown.Item>
                        )
                    }
                })}
            </Dropdown.Menu>
        </Dropdown >
    )
}

export default withFirebase(ProgramsDropdown);