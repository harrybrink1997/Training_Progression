import React from 'react'
import { Button } from 'react-bootstrap'

const AddExerciseButton = ({ buttonHandler, uid }) => {

    return (
        <Button variant="danger" id={uid + "_addButton"} className="addExerciseButton" onClick={buttonHandler}> Add to Day </ Button>
    )
}


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

export { DeleteExerciseButton, AddExerciseButton, SubmitWeekButton };