import React from 'react'
import { Button } from 'react-bootstrap'


const CreateProgramButton = ({ buttonHandler }) => {

    return (
        <Button variant="danger" id={uid + "_addButton"} className="addExerciseButton" onClick={buttonHandler}> Add to Day </ Button>
    )
}

export { CreateProgramButton }