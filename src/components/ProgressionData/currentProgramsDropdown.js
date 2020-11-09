import React from 'react'
import { withFirebase } from '../Firebase/context'

import { Dropdown } from 'semantic-ui-react'


const CurrentProgramDropdown = ({ programList, activeProgram, buttonHandler }) => {

    return (
        <Dropdown text='Current Programs'>
            <Dropdown.Menu>
                {programList.map(programName => {
                    if (programName === activeProgram) {
                        return (
                            <Dropdown.Item
                                as="button"
                                onClick={buttonHandler}
                                key={programName}
                                value={programName}
                                active
                                text={programName} />
                        )
                    } else {
                        return (
                            <Dropdown.Item
                                as="button"
                                onClick={buttonHandler}
                                key={programName}
                                value={programName}
                                text={programName} />
                        )
                    }
                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}

// const CurrentProgramDropdown = ({ programList, activeProgram, buttonHandler }) => {

//     return (

//         <Dropdown >
//             <Dropdown.Toggle variant="dark" id="dropdown-basic">
//                 Current Programs
//                 </Dropdown.Toggle>
//             <Dropdown.Menu variant="dark">
//                 {programList.map(programName => {
//                     if (programName === activeProgram) {
//                         return (
//                             <Dropdown.Item
//                                 as="button"
//                                 onClick={buttonHandler}
//                                 key={programName}
//                                 value={programName}
//                                 active>
//                                 {programName}
//                             </Dropdown.Item>
//                         )
//                     } else {
//                         return (
//                             <Dropdown.Item
//                                 as="button"
//                                 onClick={buttonHandler}
//                                 key={programName}
//                                 value={programName}>
//                                 {programName}
//                             </Dropdown.Item>
//                         )
//                     }
//                 })}
//             </Dropdown.Menu>
//         </Dropdown>
//     )
// }

export default withFirebase(CurrentProgramDropdown);