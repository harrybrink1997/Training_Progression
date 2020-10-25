import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import { Container, Row, Col } from 'react-bootstrap'


import CurrentProgramDropdown from './currentProgramsDropdown'
import CurrentWeekExercisesContainer from './currentWeekExercisesContainer'
import AvailableExercisesList from './availableExercisesList'
import SubmitWeekModal from './submitWeekModal'
import { DeleteExerciseButton } from './currentProgramPageButtons'
import { AddExerciseButton } from './currentProgramPageButtons'
import { SelectColumnFilter } from './filterSearch'

class CurrentProgramPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // Current Program Data
            currentWeekExercises: [], // redundent must delete. 
            exerciseListPerDay: {},
            activeProgram: '',
            currentWeekInProgram: '',
            programList: [],
            loading: true,
            currentView: 'dayView',
            currentDay: '1',
            hasPrograms: false,
            allPrograms: [],

            // Exercise List Data
            availExercisesCols: [],
            availExercisesData: []
        }
    }

    componentDidMount() {

        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        this.setState({ loading: true });


        // Get the data for available exercises. 
        this.props.firebase.exercises().on('value', snapshot => {
            const exerciseObject = snapshot.val();
            const exerciseList = Object.keys(exerciseObject).map(key => ({
                uid: key,
                primary: exerciseObject[key].primary,
                secondary: exerciseObject[key].secondary,
                experience: exerciseObject[key].experience,
                name: this.underscoreToSpaced(key)
            }));
            this.setState({
                availExercisesCols: this.setAvailExerciseCols(),
                availExercisesData: this.setAvailExerciseChartData(exerciseList),
            });
        });

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
                // Initially Sets the state for the current day
                // and current week and other parameters. 
                this.setState({
                    programList: programListArray,
                    activeProgram: programListArray[0],
                    hasPrograms: true,
                    allPrograms: userObject.currentPrograms,
                    currentWeekInProgram: userObject.currentPrograms[programListArray[0]].currentWeek
                }, () => {
                    this.updatedDailyExerciseList()
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

    setAvailExerciseChartData = (exerciseList) => {
        var tableData = []

        exerciseList.forEach(exercise => {
            tableData.push({
                exercise: exercise.name,
                primMusc: exercise.primary.join(', '),
                secMusc: exercise.secondary.join(', '),
                expLevel: exercise.experience,
                addExerciseBtn: <AddExerciseButton buttonHandler={this.handleAddExerciseButton} uid={exercise.uid} primaryMusc={exercise.primary} />
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


    updatedDailyExerciseList = () => {
        // Introduce a call back to show the current exercises. 
        // Can only be done once the other parameters above have been set. 
        var currProg = this.state.activeProgram

        console.log("Inside update")
        console.log(this.state)

        var currWeek = 'week' + this.state.currentWeekInProgram
        var numDaysInWeek = [1, 2, 3, 4, 5, 6, 7]
        var exPerDayObj = {}

        // First check if the current week has been instantiated. If not return a clear slate for every day. 
        // Exit the function afterwards. 
        if (!(currWeek in this.state.allPrograms[currProg])) {
            for (var day in numDaysInWeek) {
                exPerDayObj[numDaysInWeek[day]] = []
            }
        } else {
            var currWeekProgExer = this.state.allPrograms[currProg][currWeek]

            for (var day in numDaysInWeek) {
                var dailyExercises = []

                if (numDaysInWeek[day] in currWeekProgExer) {
                    for (var exercise in currWeekProgExer[numDaysInWeek[day]]) {

                        var renderObj = currWeekProgExer[numDaysInWeek[day]][exercise]
                        renderObj.uid = exercise
                        renderObj.deleteButton = <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />


                        dailyExercises.push(renderObj)
                    }
                }
                exPerDayObj[numDaysInWeek[day]] = dailyExercises
            }
        }

        this.setState({
            exerciseListPerDay: exPerDayObj,
            loading: false,
        }, () => { console.log(this.state.exerciseListPerDay) })
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
        this.props.firebase.exercises().off();

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
            loading: true,
            activeProgram: event.target.value,
            currentWeekInProgram: currentWeek,
            currentDay: '1'
        }, () => {
            this.updatedDailyExerciseList()
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


    deleteExerciseLocally = (exUid) => {

        var weekString = 'week' + this.state.currentWeekInProgram
        var dayString = this.state.currentDay

        delete this.state.allPrograms[this.state.activeProgram][weekString][dayString][exUid]

        this.setState({
            loading: true
        }, () => {
            this.updatedDailyExerciseList()
        })

    }

    handleDeleteExerciseButton = (event) => {
        event.preventDefault()
        var exUid = event.target.id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above. 
        this.props.firebase.deleteExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            this.state.currentDay,
            exUid
        ).then(() => {
            // If promise goes through then update front end. 
            this.deleteExerciseLocally(exUid)
        })
    }

    handleSubmitButton = () => {

        this.setState({
            loading: true
        }, () => {
            //Updated the current week in the database. 
            this.props.firebase.progressToNextWeek(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                parseInt(this.state.currentWeekInProgram + 1)
            ).then(() => {
                this.setState({
                    currentWeekInProgram: this.state.currentWeekInProgram++
                }, () => {
                    this.updatedDailyExerciseList()
                })
            })
        })


    }

    addExerciseLocally = (payload, exUid) => {


        console.log("Inside add locally")
        console.log(this.state)

        var programsObj = this.state.allPrograms
        var currentProgramObject = this.state.allPrograms[this.state.activeProgram]

        console.log("Active Program in add ex local")
        console.log(programsObj)
        console.log(currentProgramObject)


        var weekString = 'week' + this.state.currentWeekInProgram
        var dayString = this.state.currentDay

        console.log(weekString)
        console.log(dayString)

        currentProgramObject[weekString][dayString][exUid] = payload

        programsObj[this.state.activeProgram] = currentProgramObject

        this.setState({
            allPrograms: programsObj,
            loading: true
        }, () => {
            this.updatedDailyExerciseList()
        })
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

        console.log("Inside handle add exercise button")
        console.log(this.state)

        //Single db call to enter the data. Using set with uid generated by function above. 
        this.props.firebase.createExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            this.state.currentDay,
            dataPayload,
            exerciseObject.uid
        ).then(() => {
            console.log("Inside handle add exercise button - then")
            console.log(this.state)
            // If promise goes through then update front end. 
            this.addExerciseLocally(dataPayload, exerciseObject.uid)
        })


    }

    render() {
        const {
            hasPrograms,
            programList,
            activeProgram,
            currentWeekExercises,
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
                            currentWeekExercises={currentWeekExercises}
                            tabHandler={this.handleChangeTab}
                            dayPaginationHandler={this.handleChangeDayPage}
                            currentDay={currentDay}
                            currentView={currentView}
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