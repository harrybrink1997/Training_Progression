import React from 'react'
import { Button } from 'semantic-ui-react'

const DeleteExerciseButton = ({ buttonHandler, uid }) => {

    return (
        <Button className='deleteBtn' circular icon='delete' id={uid + "_delButton"} className="deleteExerciseButton" onClick={buttonHandler} />
    )
}

const SubmitWeekButton = ({ buttonHandler }) => {
    return (
        <Button variant="danger" onClick={buttonHandler}> Submit Week </ Button>
    )
}

const SaveProgramButton = ({ buttonHandler }) => {
    return (
        <Button negative onClick={buttonHandler}> Save Week </ Button>
    )
}

const EditExerciseButton = ({ buttonHandler }) => {
    return (
        <Button onClick={buttonHandler}> Edit </ Button>
    )
}

export { DeleteExerciseButton, SubmitWeekButton, SaveProgramButton, EditExerciseButton };