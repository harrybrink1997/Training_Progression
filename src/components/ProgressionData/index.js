import React, { Component } from 'react';

import { withAuthorisation } from '../Session';
import ProgressionTable from './progressionTable'
import ExerciseTable from './exerciseTable'
import { DeleteExerciseButton, SaveButton } from './progressionPageButtons'


import { Container, Row, Col } from 'react-bootstrap'



class ProgressionDataPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentWeekExercises: []
        }
    }


    underscoreToSpaced = (string) => {
        string = string.split('_')
        var returnString = ''

        string.forEach(word => {
            returnString = returnString + word + ' '
        })


        return returnString.trim()
    }

    generateExerciseUID = (string) => {
        return string + '_' + '1' + '_' + '1' + '_' + '1'
    }

    handleDeleteExerciseButton = (event) => {
        console.log(event.target.id.slice(0, -10))

        var updatedExerciseList = this.state.currentWeekExercises.filter(element => {
            return element.uid != event.target.id.slice(0, -10)
        })

        console.log(updatedExerciseList)
        this.setState({
            currentWeekExercises: updatedExerciseList
        })


    }

    handleSaveButton = () => {
        console.log("Being saved")
    }

    handleAddExerciseButton = (event) => {

        var exerciseName = event.target.id.slice(0, -10)
        var uid = this.generateExerciseUID(exerciseName)


        var exerciseObject = {
            exercise: this.underscoreToSpaced(exerciseName),
            rpe: '',
            time: '',
            reps: '',
            weight: '',
            deleteButton: <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={uid} />,
            uid: uid
        }


        this.setState({
            currentWeekExercises: [...this.state.currentWeekExercises, exerciseObject]
        })
        console.log(this.state.currentWeekExercises)
    }



    render() {

        const { currentWeekExercises } = this.state

        return (
            <div>
                <h1>Progression Data Page</h1>

                <Container fluid>
                    <Row>
                        <Col xs={5}>
                            <ExerciseTable
                                handleAddExerciseButton={this.handleAddExerciseButton}
                                underscoreToSpaced={this.underscoreToSpaced}
                            />
                        </Col>
                        <Col>
                            <ProgressionTable
                                currentWeekExercises={currentWeekExercises}
                            />
                            <SaveButton buttonHandler={this.handleSaveButton} />
                        </Col>
                    </Row>
                </Container>

            </div >
        );
    }
}





const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ProgressionDataPage);