import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import { Grid, Loader, Dimmer, Header, Container, Segment } from 'semantic-ui-react'


import CurrentProgramDropdown from './currentProgramsDropdown'
import CurrentWeekExercisesContainer from './currentWeekExercisesContainer'
import AvailableExercisesList from './availableExercisesList'
import SubmitDayModal from './submitDayModal'
import { AddExerciseModalWeightReps, AddExerciseModalRpeTime } from './addExerciseModal'
import { EditExerciseModalWeightSets, EditExerciseModalRpeTime } from './editExerciseModal'
import { DeleteExerciseButton } from './currentProgramPageButtons'
import { SelectColumnFilter } from './filterSearch'
import { calculateDailyLoads } from './calculateWeeklyLoads'
import CloseOffProgramModal from './closeOffProgramModal'
import { ExerciseSpreadStatsTable, LoadingSpreadStatsTable } from './statsTable'

import './css/currDayExTable.css'


class CurrentProgramPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // Current Program Data
            // Old state variables
            exerciseListPerDay: {},
            activeProgram: '',
            programList: [],
            loading: true,
            hasPrograms: false,
            allPrograms: [],
            loadingScheme: '',
            currentDaysOpenInView: [],

            // New state variables.
            currentDayInProgram: '',
            currentDayUTS: '',
            currentDayUI: '',
            currentWeekInProgram: '',
            daysInWeekScope: [],

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
            });
        });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        // Creates a reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).on('value', userData => {
            var userObject = userData.val();
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

            console.log(userObject)

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

                currentWeekInProgram: Math.ceil(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram / 7),

                currentDayInProgram: userObject.currentPrograms[userObject.activeProgram].currentDayInProgram, // Sets the current day in program.
                currentDayUTS: userObject.currentPrograms[userObject.activeProgram].currentDayUTS, // Gets unix timestamp for current day
                currentDayUI: userObject.currentPrograms[userObject.activeProgram].currentDayUI, // Gets current day on UI - used for planning week.
                daysInWeekScope: this.generateDaysInWeekScope(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram),

                loading: false,
                loadingScheme: userObject.currentPrograms[userObject.activeProgram].loading_scheme,
                exerciseListPerDay: this.updatedDailyExerciseList(
                    userObject,
                    userObject.currentPrograms[userObject.activeProgram].loading_scheme
                ),
                availExercisesData: this.setAvailExerciseChartData(
                    this.state.exerciseList,
                    userObject.currentPrograms[userObject.activeProgram].currentDay,
                    userObject.currentPrograms[userObject.activeProgram].loading_scheme
                )
            })
        } else {
            this.setState({
                programList: ['No Current Programs'],
                activeProgram: '',
                loading: false
            })
        }
    }

    // Updated with new ratio calcs format
    setAvailExerciseChartData = (exerciseList, currDay, loadingScheme) => {
        var tableData = []
        exerciseList.forEach(exercise => {
            tableData.push({
                exercise: exercise.name,
                primMusc: exercise.primary.join(', '),
                secMusc: exercise.secondary.join(', '),
                expLevel: exercise.experience,
                addExerciseBtn: (loadingScheme === 'rpe_time') ?
                    <AddExerciseModalRpeTime submitHandler={this.handleAddExerciseButton} name={exercise.uid} currDay={currDay} primMusc={exercise.primary} />
                    : <AddExerciseModalWeightReps submitHandler={this.handleAddExerciseButton} name={exercise.uid} currDay={currDay} primMusc={exercise.primary} />
            })
        })
        return tableData
    }

    // Updated with new ratio calcs format
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
                    Header: '',
                    accessor: 'addExerciseBtn',
                }
            ]
        )
    }

    generateDaysInWeekScope = (currentDayInProgram) => {
        var currWeek = Math.ceil(currentDayInProgram / 7)

        var firstDayOfWeek = 1 + 7 * (currWeek - 1)
        var lastDayOfWeek = firstDayOfWeek + 6

        var programDaysInCurrWeek = []

        for (var day = firstDayOfWeek; day <= lastDayOfWeek; day++) {
            programDaysInCurrWeek.push(day)
        }

        return programDaysInCurrWeek
    }

    // Updated with new ratio calcs format
    handleUpdateExercise = async (updateObject) => {

        var day = updateObject.exUid.split('_').reverse()[1]

        if (this.state.loadingScheme === 'rpe_time') {
            var dataPayload = {
                exercise: updateObject.exercise,
                rpe: updateObject.rpe,
                sets: updateObject.sets,
                time: updateObject.time,
                reps: updateObject.reps,
                primMusc: updateObject.primMusc
            }
        } else {
            dataPayload = {
                exercise: updateObject.exercise,
                time: updateObject.time,
                sets: updateObject.sets,
                weight: updateObject.weight,
                reps: updateObject.reps,
                primMusc: updateObject.primMusc
            }
        }

        // TODO remove
        await this.props.firebase.pushExercisePropertiesUpstreamRemove(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            day,
            updateObject.exUid,
            dataPayload
        )

        await this.props.firebase.pushExercisePropertiesUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.convertUIDayToTotalDays(day),
            updateObject.exUid,
            dataPayload
        )
    }

    updatedDailyExerciseList = (userObject, loadingScheme) => {
        // Introduce a call back to show the current exercises. 
        // Can only be done once the other parameters above have been set. 
        var currWeek = Math.ceil(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram / 7)

        var firstDayOfWeek = 1 + 7 * (currWeek - 1)
        var lastDayOfWeek = firstDayOfWeek + 6

        var programDaysInCurrWeek = []

        for (var day = firstDayOfWeek; day <= lastDayOfWeek; day++) {
            programDaysInCurrWeek.push(day)
        }

        var currProg = userObject.activeProgram
        var exPerDayObj = {}

        for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
            var currWeekProgExer = userObject.currentPrograms[currProg]

            var dailyExercises = []

            if (programDaysInCurrWeek[dayIndex] in currWeekProgExer) {
                for (var exercise in currWeekProgExer[programDaysInCurrWeek[dayIndex]]) {

                    if (exercise != 'loadingData') {
                        var renderObj = currWeekProgExer[programDaysInCurrWeek[dayIndex]][exercise]
                        renderObj.uid = exercise
                        renderObj.deleteButton =
                            // <Segment.Group
                            //     horizontal
                            //     // basic="true"
                            //     // compact
                            //     className=''>
                            //     <Segment textAlign='center'>
                            //         {loadingScheme === 'rpe_time' ?
                            //             <EditExerciseModalRpeTime submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                            //             :
                            //             <EditExerciseModalWeightSets submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                            //         }
                            //     </Segment>
                            //     <Segment textAlign='center'>
                            //         <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />
                            //     </Segment>
                            // </Segment.Group>
                            <div className='currDayExBtnContainer'>
                                {loadingScheme === 'rpe_time' ?
                                    <EditExerciseModalRpeTime submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />

                                    :
                                    <EditExerciseModalWeightSets submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                                }
                                <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />
                            </div>

                        // <Segment className='currDayExBtnContainer' compact textAlign='center'>
                        //     {loadingScheme === 'rpe_time' ?
                        //         <EditExerciseModalRpeTime submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />

                        //         :
                        //         <EditExerciseModalWeightSets submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                        //     }
                        //     <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />

                        // </Segment>


                        dailyExercises.push(renderObj)
                    }
                }
            }
            exPerDayObj[programDaysInCurrWeek[dayIndex]] = dailyExercises
        }

        // if (!(currWeek in userObject.currentPrograms[currProg])) {
        //     for (var day in numDaysInWeek) {
        //         exPerDayObj[numDaysInWeek[day]] = []
        //     }
        // } else {
        //     var currWeekProgExer = userObject.currentPrograms[currProg][currWeek]

        //     for (var day in numDaysInWeek) {
        //         var dailyExercises = []

        //         if (numDaysInWeek[day] in currWeekProgExer) {
        //             for (var exercise in currWeekProgExer[numDaysInWeek[day]]) {

        //                 var renderObj = currWeekProgExer[numDaysInWeek[day]][exercise]
        //                 renderObj.uid = exercise
        //                 renderObj.deleteButton =
        //                     <Segment.Group horizontal basic compact>
        //                         <Segment textAlign='center'>
        //                             {loadingScheme === 'rpe_time' ?
        //                                 <EditExerciseModalRpeTime submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
        //                                 :
        //                                 <EditExerciseModalWeightSets submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
        //                             }
        //                         </Segment>
        //                         <Segment textAlign='center'>
        //                             <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />
        //                         </Segment>
        //                     </Segment.Group>


        //                 dailyExercises.push(renderObj)
        //             }
        //         }
        //         exPerDayObj[numDaysInWeek[day]] = dailyExercises
        //     }
        // }

        console.log(exPerDayObj)
        return exPerDayObj
    }

    // Updated with new ratio calcs format
    componentWillUnmount() {
        this.props.firebase.getUserData().off();
        this.props.firebase.exercises().off();

    }

    // Handles the pagination day change
    handleChangeDayPage = (currentDay) => {
        console.log("Inside correct function")
        console.log(currentDay)
        this.props.firebase.setCurrentDay(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            currentDay
        )
    }

    // Updated with new ratio calcs format
    handleSelectProgramButton = (event, { value }) => {
        if (this.state.activeProgram != value) {
            this.props.firebase.setActiveProgram(
                this.props.firebase.auth.currentUser.uid,
                value
            )
        }
    }

    // Updated with new ratio calcs format
    underscoreToSpaced = (string) => {
        string = string.split('_')
        var returnString = ''

        string.forEach(word => {
            returnString = returnString + word + ' '
        })


        return returnString.trim()
    }

    // Uid generated based on exercise_week_day_occurance
    // TODO change this function - does generate unique id.
    generateExerciseUID = (exerciseName) => {

        var programObject = this.state.allPrograms[this.state.activeProgram]

        var exerciseStringComp = this.underscoreToSpaced(exerciseName)

        console.log(programObject)
        // Check if not input for week
        if (this.state.currentDayInProgram in programObject) {
            console.log("day already logged in week")
            var num = 0;

            var dayExercises = programObject[this.state.currentDayInProgram]
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

        // if (('week' + this.state.currentWeekInProgram) in programObject) {
        //     var dayObject = programObject['week' + this.state.currentWeekInProgram]

        //     if (this.state.currentDay in dayObject) {
        //         console.log("day already logged in week")
        //         var num = 0;

        //         var dayExercises = dayObject[this.state.currentDay]
        //         for (var exercise in dayExercises) {
        //             if (dayExercises[exercise].exercise === exerciseStringComp) {
        //                 num++;
        //             }
        //         }

        //         return {
        //             uid: exerciseName + '_' + this.state.currentWeekInProgram + '_' + this.state.currentDay + '_' + num,
        //             week: true,
        //             day: true
        //         }
        //     }

        //     return {
        //         uid: exerciseName + '_' + this.state.currentWeekInProgram + '_' + this.state.currentDay + '_' + '0',
        //         week: true,
        //         day: false
        //     }
        // }

        // return {
        //     uid: exerciseName + '_' + this.state.currentWeekInProgram + '_' + this.state.currentDay + '_' + '0',
        //     week: false,
        //     day: false
        // }
    }

    // Updated with new ratio calcs format
    handleDeleteExerciseButton = async (event, { id }) => {
        event.preventDefault()
        var exUid = id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        var day = exUid.split('_').reverse()[1]

        console.log(day)
        console.log(this.convertUIDayToTotalDays(day))
        console.log(exUid)

        await this.props.firebase.deleteExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.convertUIDayToTotalDays(day),
            exUid
        )
    }

    handleSubmitButton = async () => {
        // Get the current exercise data for the given week.
        // And for the current active program. 
        await this.props.firebase.getProgramData(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram
        ).once('value', async userData => {
            var userObject = userData.val();
            // Calculate the weekly load per exercise based
            // on the loading scheme specified at creation of program.
            // var processedData = calculateWeeklyLoads(
            //     userObject['week' + userObject.currentWeek],
            //     userObject.loading_scheme
            // )
            var processedDayData = calculateDailyLoads(
                // userObject[userObject.currentDayInProgram],
                userObject,
                userObject.currentDayInProgram,
                userObject.loading_scheme,
                userObject.acutePeriod,
                userObject.chronicPeriod
            )

            console.log(processedDayData)

            await this.props.firebase.pushDailyLoadingDataUpstream(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                userObject.currentDayInProgram,
                processedDayData
            )


            //TODO REMOVE
            // await this.props.firebase.pushWeekLoadingDataUpstream(
            //     this.props.firebase.auth.currentUser.uid,
            //     this.state.activeProgram,
            //     'week' + userObject.currentWeek,
            //     processedData
            // )

            // If the current week is greater then or equal to 4.
            // Calculate the rolling monthly average.
            // if (userObject.currentWeek >= 4) {
            //     var rollingAverageData = calculateRollingMonthlyAverage(userObject, processedData)

            //     await this.props.firebase.pushRollingAverageUpstream(
            //         this.props.firebase.auth.currentUser.uid,
            //         this.state.activeProgram,
            //         rollingAverageData.weekID,
            //         rollingAverageData.averageLoads
            //     )
            // }


        })

        // Updates the current week in the db and iterates 
        // to the next week and sets current day to 1.
        // this.setState({
        //     loading: true
        // }, async () => {

        //     //Updated the current week in the database. 
        //     await this.props.firebase.progressToNextDay(
        //         this.props.firebase.auth.currentUser.uid,
        //         this.state.activeProgram,
        //         parseInt(this.state.currentDayInProgram + 1)
        //     )

        //     await this.props.firebase.setCurrentDayUI(
        //         this.props.firebase.auth.currentUser.uid,
        //         this.state.activeProgram,
        //         this.convertTotalDaysToUIDay(
        //             this.state.currentDayInProgram
        //         )
        //     )

        //     // USE FOR WEEK CALCULATION - TO BE REMOVED. 
        //     // await this.props.firebase.progressToNextWeek(
        //     //     this.props.firebase.auth.currentUser.uid,
        //     //     this.state.activeProgram,
        //     //     parseInt(this.state.currentWeekInProgram + 1)
        //     // )
        //     // await this.props.firebase.setCurrentDay(
        //     //     this.props.firebase.auth.currentUser.uid,
        //     //     this.state.activeProgram,
        //     //     '1'
        //     // )
        // })


    }

    convertTotalDaysToUIDay = (day) => {
        if (day < 8) {
            return day
        } else {
            return day % 7
        }
    }

    // Updated with new ratio calcs format
    convertUIDayToTotalDays = (day) => {
        console.log((parseInt((this.state.currentWeekInProgram - 1) * 7) + parseInt(day)).toString())
        return (parseInt((this.state.currentWeekInProgram - 1) * 7) + parseInt(day)).toString()
    }

    // Updated with new ratio calcs format
    handleAddExerciseButton = async (exerciseObject) => {

        // Redundant been replaced by: setCurrentDayUI()
        await this.props.firebase.setCurrentDay(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            exerciseObject.day
        )

        await this.props.firebase.setCurrentDayUI(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            exerciseObject.day
        )

        var exUidObject = this.generateExerciseUID(exerciseObject.name)

        if (this.state.loadingScheme == 'rpe_time') {
            var dataPayload = {
                exercise: this.underscoreToSpaced(exerciseObject.name),
                sets: exerciseObject.sets,
                rpe: exerciseObject.rpe,
                time: exerciseObject.time,
                reps: exerciseObject.reps,
                primMusc: exerciseObject.primMusc
            }
        } else {
            dataPayload = {
                exercise: this.underscoreToSpaced(exerciseObject.name),
                sets: exerciseObject.sets,
                time: exerciseObject.time,
                reps: exerciseObject.reps,
                weight: exerciseObject.weight,
                primMusc: exerciseObject.primMusc
            }
        }

        // TODO remove to be replaced.
        await this.props.firebase.createExerciseUpStreamRemove(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'week' + this.state.currentWeekInProgram,
            exerciseObject.day,
            dataPayload,
            exUidObject.uid
        )

        await this.props.firebase.createExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.convertUIDayToTotalDays(exerciseObject.day),
            dataPayload,
            exUidObject.uid
        )


    }

    // Updated with new ratio calcs format
    handleCloseOffProgram = async () => {
        if (this.state.programList.length == 1) {
            var newProgram = ''
        } else {
            for (var program in this.state.programList) {
                if (this.state.programList[program] != this.state.activeProgram) {
                    newProgram = this.state.programList[program]
                    break
                }
            }
        }
        var programToCloseOff = this.state.activeProgram

        await this.props.firebase.getProgramData(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram
        ).once('value', async data => {
            var programData = data.val()
            console.log(programData)

            // Update active program to the first in the list that isn't current program. Else set to none- this will allow user to switch programs and delete can then run. 
            await this.props.firebase.setActiveProgram(
                this.props.firebase.auth.currentUser.uid,
                newProgram
            )

            // Transfer program to past program first to ensure correct transfer
            await this.props.firebase.transferProgramToRecordsUpstream(
                this.props.firebase.auth.currentUser.uid,
                programToCloseOff,
                programData
            )

            // Delete program out of current programs afterwards.
            await this.props.firebase.closeOffProgramUpstream(
                this.props.firebase.auth.currentUser.uid,
                programToCloseOff,
            )
        })

    }

    handleChangeDaysOpenView = (days) => {
        console.log(days)
    }

    render() {
        const {
            // Old State variables.
            hasPrograms,
            programList,
            activeProgram,
            exerciseListPerDay,
            loading,
            currentDay,
            currentWeekInProgram,
            availExercisesCols,
            availExercisesData,
            loadingScheme,

            // New state variables.
            currentDayInProgram,
            daysInWeekScope
        } = this.state

        console.log(this.state)
        let loadingHTML =
            <Dimmer inverted active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>
        let noCurrentProgramsHTML = <Header as='h1'>Create A Program Before Accessing This Page</Header>
        let hasCurrentProgramsHTML =
            <Container fluid>
                <Grid padded divided='vertically'>
                    <Grid.Row>
                        <Container textAlign='center' fluid>
                            <Header as='h1'>{activeProgram}, Week {currentWeekInProgram}, Day {this.convertTotalDaysToUIDay(currentDayInProgram)}</Header>
                        </Container>
                    </Grid.Row>

                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Segment basic textAlign='right'>
                                <SubmitDayModal handleFormSubmit={this.handleSubmitButton} />
                            </Segment>
                        </Grid.Column>
                        <Grid.Column>
                            <Segment basic textAlign='center'>
                                <CurrentProgramDropdown
                                    programList={programList}
                                    activeProgram={activeProgram}
                                    buttonHandler={this.handleSelectProgramButton}
                                />
                            </Segment>
                        </Grid.Column>
                        <Grid.Column>
                            <Segment basic textAlign='left'>
                                <CloseOffProgramModal handleFormSubmit={this.handleCloseOffProgram} />
                            </Segment>
                        </Grid.Column>

                    </Grid.Row>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <Container>
                                <ExerciseSpreadStatsTable data={[]} />
                            </Container>
                        </Grid.Column>
                        <Grid.Column>
                            <Container>
                                <LoadingSpreadStatsTable data={[]} />
                            </Container>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <AvailableExercisesList
                                columns={availExercisesCols}
                                data={availExercisesData}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h1'>Create this week</Header>
                            <CurrentWeekExercisesContainer
                                dailyExercises={exerciseListPerDay}
                                currentDay={currentDay}
                                loadingScheme={loadingScheme}
                                daysViewHandler={this.handleChangeDaysOpenView}
                                daysInWeekScope={daysInWeekScope}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container >
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