import React from 'react'
import { Button } from 'react-bootstrap'

const DeleteExerciseButton = ({ buttonHandler, uid }) => {

    return (
        <Button variant="danger" id={uid + "_delButton"} className="deleteExerciseButton" onClick={buttonHandler}> Delete </ Button>
    )
}

const SubmitWeekButton = ({ buttonHandler }) => {
    return (
        <Button variant="danger" onClick={buttonHandler}> Submit Week </ Button>
    )
}

const SaveProgramButton = ({ buttonHandler }) => {
    return (
        <Button variant="danger" onClick={buttonHandler}> Save Week </ Button>
    )
}

const EditExerciseButton = ({ buttonHandler }) => {
    return (
        <Button variant="primary" onClick={buttonHandler}> Edit </ Button>
    )
}

export { DeleteExerciseButton, SubmitWeekButton, SaveProgramButton, EditExerciseButton };