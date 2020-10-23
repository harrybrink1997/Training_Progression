import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import { Container, Row, Col } from 'react-bootstrap'


import CurrentProgramDropdown from './currentProgramsDropdown'
import CurrentWeekExercisesTable from './currentWeekExercisesTable'
import AvailableExercisesList from './availableExercisesList'
import { DeleteExerciseButton, SaveButton } from './currentProgramPageButtons'



class CurrentProgramPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            currentWeekExercises: [],
            activeProgram: '',
            programList: [],
            loading: true
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid

        this.props.firebase.getUserData(currUserUid).on('value', userData => {

            const userObject = userData.val();
            if ('currentPrograms' in userObject) {

                var programListArray = []

                Object.keys(userObject.currentPrograms).forEach(key => {
                    programListArray.push(key)
                })
                console.log(programListArray[0])
                this.setState({
                    programList: programListArray,
                    activeProgram: programListArray[0],
                    loading: false
                })
            } else {
                this.setState({
                    programList: ['No Current Programs'],
                    activeProgram: '',
                    loading: false
                })
            }
        })
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
    }

    handleSelectProgramButton = (event) => {
        this.setState({
            activeProgram: event.target.value
        })
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
        const { programList, activeProgram, currentWeekExercises } = this.state

        return (
            <div>
                <Container fluid>
                    <Row className="justify-content-md-center">
                        <h1>{activeProgram}</h1>
                        <Col>
                            <CurrentProgramDropdown
                                programList={programList}
                                activeProgram={activeProgram}
                                buttonHandler={this.handleSelectProgramButton}
                            />
                        </Col>

                    </Row>

                </Container>
                <Container fluid>
                    <Row>
                        <Col xs={5}>
                            <AvailableExercisesList
                                handleAddExerciseButton={this.handleAddExerciseButton}
                                underscoreToSpaced={this.underscoreToSpaced}
                            />
                        </Col>
                        <Col>
                            <h1>Create this week</h1>
                            <CurrentWeekExercisesTable
                                currentWeekExercises={currentWeekExercises}
                            />
                            <SaveButton buttonHandler={this.handleSaveButton} />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(CurrentProgramPage)