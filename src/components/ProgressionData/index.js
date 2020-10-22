import React, { Component } from 'react';

import { withAuthorisation } from '../Session';
import ProgressionTable from './progressionTable'
import ExerciseTable from './exerciseTable'


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
        return string + '_' + '1' + '_' + '1' + '_'
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
            uid: uid
        }


        this.setState({
            newExercise: event.target.id,
            currentWeekExercises: [...this.state.currentWeekExercises, exerciseObject]
        })
        console.log(this.state.currentWeekExercises)
    }



    render() {

        const { newExercise, currentWeekExercises } = this.state

        return (
            <div>
                <h1>Progression Data Page</h1>

                <Container fluid>
                    <Row>
                        <Col xs={5}>
                            <ExerciseTable
                                handleAddExerciseButton={this.handleAddExerciseButton}
                                underscoreToSpaced={this.underscoreToSpaced} />
                        </Col>
                        <Col>
                            <ProgressionTable currentWeekExercises={currentWeekExercises} newExercise={newExercise} />
                        </Col>
                    </Row>
                </Container>

            </div >
        );
    }
}





const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ProgressionDataPage);