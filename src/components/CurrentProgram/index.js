import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import { Container, Row, Col } from 'react-bootstrap'


import CurrentProgramDropdown from './currentProgramsDropdown'
import CurrentWeekExercisesContainer from './currentWeekExercisesContainer'
import AvailableExercisesList from './availableExercisesList'
import SubmitWeekModal from './submitWeekModal'
import AddExerciseModal from './addExerciseModal'
import EditExerciseModal from './editExerciseModal'
import { DeleteExerciseButton } from './currentProgramPageButtons'
import { SelectColumnFilter } from './filterSearch'

class CurrentProgramPage extends Component {
    constructor(props) {
        super(props)


        this.exerciseDataChanges = {}

        this.state = {
            // Current Program Data
            currentWeekExercises: [], // redundent must delete. 
            exerciseListPerDay: {},
            activeProgram: '',
            currentWeekInProgram: '',
            programList: [],
            loading: true,
            currentView: 'dayView',
            currentDay: null,
            hasPrograms: false,
            allPrograms: [],

            // Exercise List Data
            availExercisesCols: [],
            availExercisesData: []
        }
    }

    async componentDidMount() {
        this.setState({ loading: true });

        // Get the data for available exercises. 
        await this.props.firebase.exercises().once('value', snapshot => {
            const exerciseObject = snapshot.val();
            const exerciseList = Object.keys(exerciseObject).map(key => ({
                uid: key,
                primary: exerciseObject[key].primary,
                secondary: exerciseObject[key].secondary,
                experience: exerciseObject[key].experience,
                name: this.underscoreToSpaced(key)
            }));
            this.setState({
                exerciseList: exerciseList,
                availExercisesCols: this.setAvailExerciseCols(),
                // availExercisesData: this.setAvailExerciseChartData(exerciseList),
            });
        });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        // Creates a reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).on('value', userData => {
            var userObject = userData.val();
            console.log("inside big boy")
            console.log(userData)
            if (!this.state.loading) {
                this.setState({
                    loading: true
                }, () => {
                    console.log(userObject)
                    // Format the user data based on whether or not user has current programs. 
                    this.updateObjectState(userObject)
                })
            } else {
                this.updateObjectState(userObject)
            }
        })
    }

    updateObjectState = (userObject) => {
        // Format the user data based on whether or not user has current programs. 
        if ('currentPrograms' in userObject) {

            var programListArray = []

            Object.keys(userObject.currentPrograms).forEach(key => {
                programListArray.push(key)
            })
            // Initially Sets the state for the current day
            // and current week and other parameters. 
            this.setState({
                programList: programListArray,
                activeProgram: userObject.activeProgram,
                hasPrograms: true,
                allPrograms: userObject.currentPrograms,
                currentWeekInProgram: userObject.currentPrograms[userObject.activeProgram].currentWeek,
                currentDay: userObject.currentPrograms[userObject.activeProgram].currentDay,
                exerciseListPerDay: this.updatedDailyExerciseList(userObject),
                loading: false,
                availExercisesData: this.setAvailExerciseChartData(this.state.exerciseList, userObject.currentPrograms[userObject.activeProgram].currentDay)
            })
        } else {
            this.setState({
                programList: ['No Current Programs'],
                activeProgram: '',
                loading: false
            })
        }
    }

    setAvailExerciseChartData = (exerciseList, currDay) => {
        var tableData = []
        exerciseList.forEach(exercise => {
            tableData.push({
                exercise: exercise.name,
                primMusc: exercise.primary.join(', '),
                secMusc: exercise.secondary.join(', '),
                expLevel: exercise.experience,
                addExerciseBtn: <AddExerciseModal submitHandler={this.handleAddExerciseButton} name={exercise.uid} currDay={currDay} />
            })
        })

        return tableData
    }

    setAvailExerciseCols = () => {
        return (
            [
                {
                    Header: 'Exercise Name',
                    accessor: 'exercise',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Primary Muscles',
                    accessor: 'primMusc',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Secondary Muscles',
                    accessor: 'secMusc',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Experience Level',
                    accessor: 'expLevel',
                    Filter: SelectColumnFilter,
                    filter: 'includes',
                },
                {
                    Header: 'Add Me',
                    accessor: 'addExerciseBtn',
                }
            ]
        )
    }

    handleUpdateExercise = async (updateObject) => {

        var dataPayload = {
            exercise: updateObject.exercise,
            rpe: updateObject.rpe,
            weight: updateObject.weight,
            time: updateObject.time,
            reps: updateObject.reps
        }

        await this.props.firebase.pushExercisePropertiesUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            this.state.currentDay,
            updateObject.exUid,
            dataPayload
        )
    }

    updatedDailyExerciseList = (userObject) => {
        // Introduce a call back to show the current exercises. 
        // Can only be done once the other parameters above have been set. 
        var currProg = userObject.activeProgram
        var currWeek = 'week' + userObject.currentPrograms[userObject.activeProgram].currentWeek
        var numDaysInWeek = [1, 2, 3, 4, 5, 6, 7]
        var exPerDayObj = {}

        // First check if the current week has been instantiated. If not return a clear slate for every day. 
        // Exit the function afterwards. 
        if (!(currWeek in userObject.currentPrograms[currProg])) {
            for (var day in numDaysInWeek) {
                exPerDayObj[numDaysInWeek[day]] = []
            }
        } else {
            var currWeekProgExer = userObject.currentPrograms[currProg][currWeek]

            for (var day in numDaysInWeek) {
                var dailyExercises = []

                if (numDaysInWeek[day] in currWeekProgExer) {
                    for (var exercise in currWeekProgExer[numDaysInWeek[day]]) {

                        var renderObj = currWeekProgExer[numDaysInWeek[day]][exercise]
                        renderObj.uid = exercise
                        renderObj.deleteButton = <Row>
                            <EditExerciseModal submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                            <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />
                        </Row>


                        dailyExercises.push(renderObj)
                    }
                }
                exPerDayObj[numDaysInWeek[day]] = dailyExercises
            }
        }

        return exPerDayObj
        // this.setState({
        //     exerciseListPerDay: exPerDayObj,
        //     loading: false,
        // }, () => { console.log(this.state.exerciseListPerDay) })
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
        this.props.firebase.exercises().off();

    }

    handleChangeTab = (currentTab) => {
        this.updateExerciseDataUpstream()
        console.log(this.exerciseDataChanges)

        this.setState({
            currentView: currentTab
        })
    }

    handleSaveProgramButton = () => {
        console.log("YEW")
    }

    // Handles the pagination day change
    handleChangeDayPage = (currentDay) => {

        this.props.firebase.setCurrentDay(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            currentDay
        )
    }

    handleSelectProgramButton = (event) => {

        this.updateExerciseDataUpstream()
        console.log(this.exerciseDataChanges)

        this.props.firebase.setActiveProgram(
            this.props.firebase.auth.currentUser.uid,
            event.target.value
        )
    }

    handleTableUpdate = async (exUid, accessor, value) => {


        await this.props.firebase.pushExercisePropertiesUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            this.state.currentDay,
            exUid,
            accessor,
            value
        )
        // if (!(exUid in this.exerciseDataChanges)) {
        //     this.exerciseDataChanges[exUid] = {}
        //     this.exerciseDataChanges[exUid][accessor] = value
        // } else {
        //     this.exerciseDataChanges[exUid][accessor] = value
        // }
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

        var exerciseStringComp = this.underscoreToSpaced(exerciseName)

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

    // CURRENTLY NOT USED FUNCTION... KEEPING IN CASE NEEDED LATER.
    updateExerciseDataUpstream = async () => {

        for (var exUid in this.exerciseDataChanges) {
            for (var accessor in this.exerciseDataChanges[exUid]) {
                await this.props.firebase.pushExercisePropertiesUpstream(
                    this.props.firebase.auth.currentUser.uid,
                    this.state.activeProgram,
                    'week' + this.state.currentWeekInProgram,
                    this.state.currentDay,
                    exUid,
                    accessor,
                    this.exerciseDataChanges[exUid][accessor]
                )
            }
        }
        // After update reset changes in queue back to zero.
        this.exerciseDataChanges = {}
    }

    handleDeleteExerciseButton = async (event) => {
        event.preventDefault()
        var exUid = event.target.id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        console.log(exUid)
        var day = exUid.split('_').reverse()[1]

        await this.props.firebase.deleteExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            day,
            exUid
        )
    }

    handleSubmitButton = () => {

        this.setState({
            loading: true
        }, async () => {
            this.updateExerciseDataUpstream()
            console.log(this.exerciseDataChanges)

            //Updated the current week in the database. 
            await this.props.firebase.progressToNextWeek(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                parseInt(this.state.currentWeekInProgram + 1)
            )

            await this.props.firebase.setCurrentDay(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                '1'
            )
        })


    }

    handleAddExerciseButton = async (exerciseObject) => {

        await this.props.firebase.setCurrentDay(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            exerciseObject.day
        )

        var exUidObject = this.generateExerciseUID(exerciseObject.name)

        var dataPayload = {
            exercise: this.underscoreToSpaced(exerciseObject.name),
            rpe: exerciseObject.rpe,
            time: exerciseObject.time,
            reps: exerciseObject.reps,
            weight: exerciseObject.weight,
        }

        await this.props.firebase.createExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            exerciseObject.day,
            dataPayload,
            exUidObject.uid
        )


    }

    render() {
        const {
            hasPrograms,
            programList,
            activeProgram,
            exerciseListPerDay,
            loading,
            currentDay,
            currentView,
            currentWeekInProgram,
            availExercisesCols,
            availExercisesData
        } = this.state

        console.log("active program")
        console.log(activeProgram)

        console.log("state")
        console.log(this.state)

        let loadingHTML = <h1>Loading...</h1>
        let noCurrentProgramsHTML = <h1>Create A Program Before Accessing This Page</h1>
        let hasCurrentProgramsHTML = <div>
            < Container fluid >
                <Row className="justify-content-md-center">
                    <h1>{activeProgram} ,Week: {currentWeekInProgram}</h1>
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
                            columns={availExercisesCols}
                            data={availExercisesData}
                        />
                    </Col>
                    <Col>
                        <h1>Create this week</h1>
                        <CurrentWeekExercisesContainer
                            dailyExercises={exerciseListPerDay}
                            tabHandler={this.handleChangeTab}
                            dayPaginationHandler={this.handleChangeDayPage}
                            currentDay={currentDay}
                            currentView={currentView}
                            handleTableUpdate={this.handleTableUpdate}
                        />
                        <SubmitWeekModal handleFormSubmit={this.handleSubmitButton} />
                    </Col>
                </Row>
            </Container>
        </div >

        return (
            <div>
                {loading && loadingHTML}
                {!hasPrograms && !loading && noCurrentProgramsHTML}
                {hasPrograms && !loading && hasCurrentProgramsHTML}
            </div>
        )
    }
}





const condition = authUser => !!authUser;
export default withAuthorisation(condition)(CurrentProgramPage)