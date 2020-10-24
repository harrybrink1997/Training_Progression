import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import { Container, Row, Col } from 'react-bootstrap'


import CurrentProgramDropdown from './currentProgramsDropdown'
import CurrentWeekExercisesContainer from './currentWeekExercisesContainer'
import AvailableExercisesList from './availableExercisesList'
import { DeleteExerciseButton, SaveButton } from './currentProgramPageButtons'



class CurrentProgramPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            currentWeekExercises: [],
            activeProgram: '',
            currentWeekInProgram: '',
            programList: [],
            loading: true,
            currentView: 'dayView',
            currentDay: '1',
            hasPrograms: false,
            allPrograms: []
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid

        // Get Current User Data
        this.props.firebase.getUserData(currUserUid).on('value', userData => {
            const userObject = userData.val();
            console.log(userObject)
            // Format the user data based on whether or not user has current programs. 
            if ('currentPrograms' in userObject) {

                var programListArray = []

                Object.keys(userObject.currentPrograms).forEach(key => {
                    programListArray.push(key)
                })
                this.setState({
                    programList: programListArray,
                    activeProgram: programListArray[0],
                    loading: false,
                    hasPrograms: true,
                    allPrograms: userObject.currentPrograms,
                    currentWeekInProgram: userObject.currentPrograms[programListArray[0]].currentWeek
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

    handleChangeTab = (currentTab) => {
        this.setState({
            currentView: currentTab
        })
    }

    handleChangeDayPage = (currentDay) => {
        console.log(currentDay)
        this.setState({
            currentDay: currentDay
        })
    }

    handleSelectProgramButton = (event) => {
        var currentWeek = this.state.allPrograms[event.target.value].currentWeek

        this.setState({
            activeProgram: event.target.value,
            currentWeekInProgram: currentWeek
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

    // Uid generated based on exercise_week_day_occurance
    generateExerciseUID = (exerciseName) => {

        var programObject = this.state.allPrograms[this.state.activeProgram]

        console.log("ProgramObject")
        var exerciseStringComp = this.underscoreToSpaced(exerciseName)
        console.log(exerciseStringComp)

        // Check if not input for week
        if (('week' + this.state.currentWeekInProgram) in programObject) {
            var dayObject = programObject['week' + this.state.currentWeekInProgram]

            if (this.state.currentDay in dayObject) {
                console.log("day already logged in week")
                var num = 0;

                var dayExercises = dayObject[this.state.currentDay]
                for (var exercise in dayExercises) {
                    if (dayExercises[exercise].exercise === exerciseStringComp) {
                        num++;
                    }
                }

                return {
                    uid: exerciseName + '_' + this.state.currentWeekInProgram + '_' + this.state.currentDay + '_' + num,
                    week: true,
                    day: true
                }
            }

            return {
                uid: exerciseName + '_' + this.state.currentWeekInProgram + '_' + this.state.currentDay + '_' + '0',
                week: true,
                day: false
            }
        }

        return {
            uid: exerciseName + '_' + this.state.currentWeekInProgram + '_' + this.state.currentDay + '_' + '0',
            week: false,
            day: false
        }
    }

    handleDeleteExerciseButton = (event) => {

        var updatedExerciseList = this.state.currentWeekExercises.filter(element => {
            return element.uid != event.target.id.slice(0, -10)
        })

        this.setState({
            currentWeekExercises: updatedExerciseList
        })


    }

    handleSaveButton = () => {
        console.log("Being saved")
    }

    addExerciseLocally = (payload, exUid) => {
        var currentProgramObject = this.state.allPrograms[this.state.activeProgram]

        console.log(currentProgramObject)

        var weekString = 'week' + this.state.currentWeekInProgram
        var dayString = this.state.currentDay
        console.log(weekString)
        console.log(dayString)
        console.log(payload)

        currentProgramObject[weekString][dayString][exUid] = payload
    }

    handleAddExerciseButton = (event) => {

        var exerciseName = event.target.id.slice(0, -10)
        var exerciseObject = this.generateExerciseUID(exerciseName)

        var dataPayload = {
            exercise: this.underscoreToSpaced(exerciseName),
            rpe: '',
            time: '',
            reps: '',
            weight: '',
        }

        var renderPayload = {
            exercise: this.underscoreToSpaced(exerciseName),
            rpe: '',
            time: '',
            reps: '',
            weight: '',
            deleteButton: <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exerciseObject.uid} />,
            uid: exerciseObject.uid
        }

        //Single db call to enter the data. Using set with uid generated by function above. 
        this.props.firebase.createExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            this.state.currentDay,
            dataPayload,
            exerciseObject.uid
        ).then(() => {
            this.addExerciseLocally(dataPayload, exerciseObject.uid)
        })

        //Set the data locally instead then relying on async call.


        this.setState({
            currentWeekExercises: [...this.state.currentWeekExercises, renderPayload]
        })
    }

    render() {
        const { hasPrograms, programList, activeProgram, currentWeekExercises } = this.state
        console.log(this.state)

        return (
            <div>
                {hasPrograms ?
                    <div>
                        < Container fluid >
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

                        </Container >
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
                                    <CurrentWeekExercisesContainer
                                        currentWeekExercises={currentWeekExercises}
                                        tabHandler={this.handleChangeTab}
                                        dayPaginationHandler={this.handleChangeDayPage}
                                    />
                                    <SaveButton buttonHandler={this.handleSaveButton} />
                                </Col>
                            </Row>
                        </Container>
                    </div >
                    : <h1>Create A Program Before Accessing This Page</h1>}
            </div>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(CurrentProgramPage)