import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import { Grid, Loader, Dimmer, Header, Container, Segment } from 'semantic-ui-react'


import CurrentProgramDropdown from './currentProgramsDropdown'
import CurrentWeekExercisesContainer from './currentWeekExercisesContainer'
import AvailableExercisesList from './availableExercisesList'
import SubmitDayModal from './submitDayModal'
import { AddExerciseModalWeightReps, AddExerciseModalRpeTime } from './addExerciseModal'
import { EditExerciseModalWeightSets, EditExerciseModalRpeTime } from './editExerciseModal'
import { DeleteExerciseButton, DeleteGoalButton, CompleteGoalButton } from './currentProgramPageButtons'
import { SelectColumnFilter } from './filterSearch'
import { calculateDailyLoads, dailyLoadCalcsRpeTime, dailyLoadCalcsWeightReps } from './calculateWeeklyLoads'
import CloseOffProgramModal from './closeOffProgramModal'
import { LoadingSpreadStatsTable } from './statsTable'
import AddGoalsForm from '../CustomComponents/addGoalsForm'
import GoalsTable from '../CustomComponents/currentGoalTable'
import EditGoalModal from '../CustomComponents/editGoalModal'

// Import Custom functions
import convertTotalDaysToUIDay from '../../constants/convertTotalDaysToUIDays'
import InputLabel from '../CustomComponents/DarkModeInput';


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
            openDaysUI: [false, false, false, false, false, false, false],

            currDaySafeLoadTableData: [],

            // Goal Table Data
            goalTableData: [],
            expandedRows: {},

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
        // Creates reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).on('value', userData => {
            var userObject = userData.val();
            if (!this.state.loading) {
                this.setState({
                    loading: true,
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
                goalTableData: this.generateGoalTableData(userObject.currentPrograms[userObject.activeProgram]),
                loadingScheme: userObject.currentPrograms[userObject.activeProgram].loading_scheme,
                exerciseListPerDay: this.updatedDailyExerciseList(
                    userObject,
                    userObject.currentPrograms[userObject.activeProgram].loading_scheme
                ),
                currDaySafeLoadTableData: this.generateCurrDaySafeLoadData(
                    userObject.currentPrograms[userObject.activeProgram],
                    ['Chest', 'Legs', 'Back', 'Shoulders', 'Arms', 'Total']
                ),
                availExercisesData: this.setAvailExerciseChartData(
                    this.state.exerciseList,
                    this.state.currentDayUI,
                    userObject.currentPrograms[userObject.activeProgram].loading_scheme
                ),
            })
        } else {
            this.setState({
                programList: ['No Current Programs'],
                activeProgram: '',
                loading: false
            })
        }
    }

    updateExpandedRows = (rows) => {
        this.setState({
            expandedRows: rows
        })
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
                    : <AddExerciseModalWeightReps submitHandler={this.handleAddExerciseButton} name={exercise.uid} primMusc={exercise.primary} />
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

    generateSubGoalData = (subGoalList) => {
        var returnArray = []
        Object.keys(subGoalList).forEach(subGoalKey => {
            var subGoal = subGoalList[subGoalKey]
            returnArray.push({
                description: subGoal.description,
                progress: (subGoal.completed) ? 'Complete' : 'In Progress',
                targetCloseDate: subGoal.closeOffDate,
                difficulty: subGoal.difficulty,
                btns: <div className='editGoalTableBtnContainer'>
                    <CompleteGoalButton buttonHandler={this.handleCompleteGoalButton} uid={'sg_' + subGoalKey} />
                    <EditGoalModal submitHandler={this.handleEditGoalSubmit} uid={'sg_' + subGoalKey} isSubGoal={true} />
                    <DeleteGoalButton buttonHandler={this.handleDeleteGoalButton} uid={'sg_' + subGoalKey} />
                </div>
            })
        })

        return returnArray
    }

    handleDeleteGoalButton = async (id) => {
        await this.props.firebase.deleteGoalUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.generateGoalPathFromID(id)
        )
    }

    handleCompleteGoalButton = async (id) => {

        await this.props.firebase.completeGoalUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.generateGoalPathFromID(id)
        )
    }

    handleEditGoalSubmit = (goalData) => {
        console.log('hey')
    }

    generateGoalPathFromID = (id) => {
        var path = ''
        var idComponents = id.split('_')
        console.log(idComponents)
        if (idComponents[0] == 'mg') {
            if (idComponents[3] == 'deleteGoal') {
                path = 'Goal_' + idComponents[2]
            } else {
                path = 'Goal_' + idComponents[2] + '/mainGoal'
            }
        } else if (idComponents[0] == 'sg') {
            path = 'Goal_' + idComponents[1] + '/subGoals/' + idComponents[1] + '_' + idComponents[2]

        }
        return path
    }

    generateGoalTableData = (programObject) => {
        console.log(programObject)

        if (programObject.goals != undefined) {
            if (Object.keys(programObject.goals).length > 0) {
                var tableData = []

                Object.keys(programObject.goals).forEach(goalKey => {
                    var goal = programObject.goals[goalKey]
                    if (goal.subGoals != undefined) {
                        tableData.push({
                            description: goal.mainGoal.description,
                            progress: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                            subRows: this.generateSubGoalData(goal.subGoals),
                            targetCloseDate: goal.mainGoal.closeOffDate,
                            difficulty: goal.mainGoal.difficulty
                        })
                    } else {
                        tableData.push({
                            description: goal.mainGoal.description,
                            progress: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                            targetCloseDate: goal.mainGoal.closeOffDate,
                            difficulty: goal.mainGoal.difficulty,
                            btns: <div className='editGoalTableBtnContainer'>
                                <CompleteGoalButton buttonHandler={this.handleCompleteGoalButton} uid={'mg_' + goalKey} />
                                <EditGoalModal submitHandler={this.handleEditGoalSubmit} uid={'mg_' + goalKey} isSubGoal={false} />
                                <DeleteGoalButton buttonHandler={this.handleDeleteGoalButton} uid={'mg_' + goalKey} />
                            </div>

                        })
                    }
                })
                return tableData
            } else {
                return []
            }
        }
        return []
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
                            <div className='currDayExBtnContainer'>
                                {loadingScheme === 'rpe_time' ?
                                    <EditExerciseModalRpeTime submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />

                                    :
                                    <EditExerciseModalWeightSets submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                                }
                                <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />
                            </div>


                        dailyExercises.push(renderObj)
                    }
                }
            }
            exPerDayObj[programDaysInCurrWeek[dayIndex]] = dailyExercises
        }
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
    generateExerciseUID = (exerciseName, uiDay) => {

        var programObject = this.state.allPrograms[this.state.activeProgram]
        var insertionDay = this.convertUIDayToTotalDays(uiDay)

        // Check if not input for week
        if (insertionDay in programObject) {

            var dayExercises = programObject[insertionDay]
            var num = 0;

            for (var exercise in dayExercises) {
                var exUID = exerciseName + '_' + this.state.currentWeekInProgram + '_' + insertionDay + '_' + num
                if (exercise != exUID) {
                    break
                }
                num++
            }

            return exUID

        }

        return exerciseName + '_' + this.state.currentWeekInProgram + '_' + insertionDay + '_' + '0'


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
        this.setState({
            loading: true
        }, async () => {

            //Updated the current week in the database. 
            await this.props.firebase.progressToNextDay(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                parseInt(this.state.currentDayInProgram + 1)
            )

            await this.props.firebase.setCurrentDayUI(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                convertTotalDaysToUIDay(
                    this.state.currentDayInProgram
                )
            )
        })


    }

    // Updated with new ratio calcs format
    convertUIDayToTotalDays = (day) => {
        console.log((parseInt((this.state.currentWeekInProgram - 1) * 7) + parseInt(day)).toString())
        return (parseInt((this.state.currentWeekInProgram - 1) * 7) + parseInt(day)).toString()
    }

    // Updated with new ratio calcs format
    handleAddExerciseButton = async (exerciseObject) => {

        await this.props.firebase.setCurrentDayUI(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            exerciseObject.day
        )

        var exUID = this.generateExerciseUID(exerciseObject.name, exerciseObject.day)

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

        await this.props.firebase.createExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.convertUIDayToTotalDays(exerciseObject.day),
            dataPayload,
            exUID
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

            var endTimestamp = Math.floor(new Date().getTime())

            // Transfer program to past program first to ensure correct transfer
            await this.props.firebase.transferProgramToRecordsUpstream(
                this.props.firebase.auth.currentUser.uid,
                programToCloseOff,
                programData
            )

            // Set an end timestamp date for the program.
            await this.props.firebase.appendEndDateUpstream(
                this.props.firebase.auth.currentUser.uid,
                programToCloseOff,
                endTimestamp
            )

            // Delete program out of current programs afterwards.
            await this.props.firebase.closeOffProgramUpstream(
                this.props.firebase.auth.currentUser.uid,
                programToCloseOff,
            )
        })

    }

    handleChangeDaysOpenView = (day) => {
        console.log(day)
        var newArray = this.state.openDaysUI
        newArray[day] = !newArray[day]
        this.setState({
            openDaysUI: newArray
        })
    }

    handleAddGoalData = (goalList) => {
        var goalListObject = {}
        var index = this.state.goalTableData.length + 1
        goalList.forEach(description => {
            goalListObject[index] = {
                description: description,
                complete: false
            }
            index++
        })

        for (var goalNum in goalListObject) {
            this.props.firebase.createGoalUpStream(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                goalNum,
                goalListObject[goalNum]
            )
        }
    }

    generateCurrDaySafeLoadData = (programData, muscles) => {

        var returnData = []

        if (programData.currentDayInProgram !== 1) {
            if (programData.loading_scheme == 'rpe_time') {
                var currDayData = dailyLoadCalcsRpeTime(
                    programData[programData.currentDayInProgram],
                    muscles
                )

            } else {
                currDayData = dailyLoadCalcsWeightReps(
                    programData[programData.currentDayInProgram],
                    muscles
                )
            }

            muscles.forEach(muscle => {
                var prevDayChronicLoad = programData[programData.currentDayInProgram - 1]['loadingData'][muscle]['chronicEWMA']
                var prevDayAcuteLoad = programData[programData.currentDayInProgram - 1]['loadingData'][muscle]['acuteEWMA']
                var maxLoadData = 0;
                (prevDayAcuteLoad * 1.1 > prevDayChronicLoad * 1.2) ? maxLoadData = prevDayAcuteLoad : maxLoadData = prevDayChronicLoad

                if (maxLoadData !== 0 || prevDayChronicLoad !== 0) {
                    returnData.push({
                        bodyPart: muscle,
                        currDayLoad: currDayData[muscle].dailyLoad.toFixed(2),
                        minSafeLoad: (prevDayChronicLoad * 0.8).toFixed(2),
                        maxSafeLoad: maxLoadData.toFixed(2),
                        selector: 'the bois'
                    })
                }
            })
        }


        return returnData
    }

    render() {
        const {
            // Old State variables.
            hasPrograms,
            programList,
            activeProgram,
            exerciseListPerDay,
            loading,
            currentWeekInProgram,
            availExercisesCols,
            availExercisesData,
            loadingScheme,
            currDaySafeLoadTableData,
            goalTableData,

            // New state variables.
            currentDayInProgram,
            daysInWeekScope,
            openDaysUI,
            expandedRows
        } = this.state

        console.log(this.state)
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>
        let noCurrentProgramsHTML = <Header as='h1'>Create A Program Before Accessing This Page</Header>
        let hasCurrentProgramsHTML =
            <div>
                <div className='pageContainerLevel1'
                    id='cpPageContainer1'>
                    <div id='cpProgramHeader'>
                        {activeProgram}
                    </div>
                    <div id='cpWeekHeader'>
                        Week {currentWeekInProgram}, Day {convertTotalDaysToUIDay(currentDayInProgram)}
                    </div>
                    <div id='cpButtonsHeader'>
                        <div id='submitDayBtnContainer'>
                            <SubmitDayModal handleFormSubmit={this.handleSubmitButton} />
                        </div>
                        <div id='programsDropdownContainer'>
                            <CurrentProgramDropdown
                                programList={programList}
                                activeProgram={activeProgram}
                                buttonHandler={this.handleSelectProgramButton}
                            />
                        </div>
                        <div id='closeOffProgBtnContainer'>
                            <CloseOffProgramModal handleFormSubmit={this.handleCloseOffProgram} />
                        </div>
                    </div>
                </div>
                <div className='pageRowContainer'>
                    <div className='pageContainerLevel1' id='cpExerciseSpreadTableContainer'>
                        {
                            goalTableData.length > 0 &&
                            <div>
                                <GoalsTable
                                    data={goalTableData}
                                    expandedRowsHandler={this.updateExpandedRows}
                                    expandedRows={expandedRows}
                                />
                                <div className='goalsPromptBtnContainer'>
                                    <AddGoalsForm
                                        buttonText='Create More Goals'
                                        headerText='Create More Goals'
                                        handleFormSubmit={this.handleAddGoalData}
                                        currentGoalData={goalTableData} />
                                </div>
                            </div>
                        }
                        {
                            goalTableData.length == 0 &&
                            <div id='noGoalsPromptContainer'>
                                <div id='noGoalsPromptLabelContainer'>
                                    <InputLabel text='No Current Goal Data' custID='noGoalsPromptLabel' />
                                </div>
                                <div className='goalsPromptBtnContainer'>
                                    <AddGoalsForm
                                        buttonText='Create Goals'
                                        headerText='Create Goals'
                                        handleFormSubmit={this.handleAddGoalData} />
                                </div>
                            </div>
                        }
                    </div>
                    <div className='pageContainerLevel1'
                        id='cpLoadingSpreadTableContainer'>
                        <LoadingSpreadStatsTable data={currDaySafeLoadTableData} />
                    </div>
                </div>
                <div className='pageRowContainer'>
                    <div className='pageContainerLevel1' id='availExerciseTableContainer'>
                        <AvailableExercisesList
                            columns={availExercisesCols}
                            data={availExercisesData}
                        />
                    </div>
                    <div className='pageContainerLevel1'
                        id='currentWeekExTableContainer'>
                        <CurrentWeekExercisesContainer
                            dailyExercises={exerciseListPerDay}
                            loadingScheme={loadingScheme}
                            daysViewHandler={this.handleChangeDaysOpenView}
                            daysInWeekScope={daysInWeekScope}
                            openDaysUI={openDaysUI}
                        />
                    </div>
                </div>
            </div>
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