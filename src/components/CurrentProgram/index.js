import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import { Loader, Dimmer, Header, Button, Icon } from 'semantic-ui-react'


import CurrentProgramDropdown from './currentProgramsDropdown'
import CurrentWeekExercisesContainer from './currentWeekExercisesContainer'
import AvailableExercisesList from './availableExercisesList'
import SubmitDayModal from './submitDayModal'
import { AddExerciseModalWeightReps, AddExerciseModalRpeTime } from './addExerciseModal'
import { EditExerciseModalWeightSets, EditExerciseModalRpeTime } from './editExerciseModal'
import { DeleteExerciseButton, DeleteGoalButton, CompleteGoalButton } from './currentProgramPageButtons'
import { calculateDailyLoads, dailyLoadCalcs } from './calculateWeeklyLoads'
import CloseOffProgramModal from './closeOffProgramModal'
import { LoadingSpreadStatsTable } from './statsTable'
import AddGoalsForm from '../CustomComponents/addGoalsForm'
import GoalsTable from '../CustomComponents/currentGoalTable'
import EditGoalModal from '../CustomComponents/editGoalModal'
import AddSubGoalModal from '../CustomComponents/addSubGoalsModal'
import ViewPrevWeeksData from './viewPrevWeeksData'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import ConfirmNullExerciseData from './confirmNullExerciseData'
// Import Custom functions
import { currentWeekInProgram, convertTotalDaysToUIDay } from '../../constants/dayCalculations'

import InputLabel from '../CustomComponents/DarkModeInput';

import { generateDaysInWeekScope, updatedDailyExerciseList, setAvailExerciseCols, listAndFormatLocalGlobalExercises, setAvailExerciseChartData, generateExerciseUID } from '../../constants/viewProgramPagesFunctions'
import StartProgramView from '../CustomComponents/startProgramView';

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
            currentDayUI: '1',
            currentWeekInProgram: '',
            daysInWeekScope: [],
            openDaysUI: [false, false, false, false, false, false, false],
            prevWeeksData: {},
            currDaySafeLoadTableData: [],
            goalsTableVisible: true,
            safeLoadTableVisible: true,
            availExerciseTableVisible: true,
            // Goal Table Data
            goalTableData: [],
            expandedRows: {},

            // Exercise List Data
            availExercisesCols: [],
            availExercisesData: [],
            // TODO - if not want delete
            submitDataProcessing: false,
            nullExerciseData: {
                hasNullData: false,
                nullTableData: []
            }
        }
    }

    async componentDidMount() {
        this.setState({ loading: true });

        // Get the data for available exercises. 
        await this.props.firebase.exercises().once('value', snapshot => {
            const exerciseObject = snapshot.val();

            this.props.firebase.localExerciseData(
                this.props.firebase.auth.currentUser.uid
            ).once('value', snapshot => {
                const localExerciseObject = snapshot.val();

                this.setState({
                    exerciseList: listAndFormatLocalGlobalExercises(exerciseObject, localExerciseObject),
                    availExercisesCols: setAvailExerciseCols(),
                });

            })
        });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        // Creates reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).on('value', async userData => {
            var userObject = userData.val();
            await this.props.firebase.anatomy().once('value', async snapshot => {

                const anatomyObject = snapshot.val();
                if (!this.state.loading) {
                    this.setState({
                        loading: true,
                    }, () => {
                        this.updateObjectState(userObject, anatomyObject)
                    })
                } else {
                    this.updateObjectState(userObject, anatomyObject)
                }
            })
        })
    }

    updateObjectState = (userObject, anatomyObject, exerciseList) => {
        // Format the user data based on whether or not user has current programs. 
        if ('currentPrograms' in userObject && userObject.activeProgram != '') {

            var programListArray = []

            Object.keys(userObject.currentPrograms).forEach(key => {
                if (userObject.currentPrograms[key].order) {

                    if (userObject.currentPrograms[key].isActiveInSequence) {
                        programListArray.push(key)
                    }

                } else {
                    programListArray.push(key)
                }
            })

            // Initially Sets the state for the current day
            // and current week and other parameters. 
            this.setState({
                programList: programListArray,
                activeProgram: userObject.activeProgram,
                hasPrograms: true,
                allPrograms: userObject.currentPrograms,
                sequenceName: this.initSequenceName(userObject),
                programOwner: this.initActiveProgramOwner(userObject),
                currentWeekInProgram: currentWeekInProgram(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram),
                currentDayInProgram: userObject.currentPrograms[userObject.activeProgram].currentDayInProgram, // Sets the current day in program.
                currentDayUTS: userObject.currentPrograms[userObject.activeProgram].currentDayUTS, // Gets unix timestamp for current day
                daysInWeekScope: generateDaysInWeekScope(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram),
                startDayUTS: userObject.currentPrograms[userObject.activeProgram].startDayUTS,
                loading: false,
                goalTableData: this.generateGoalTableData(userObject.currentPrograms[userObject.activeProgram]),
                loadingScheme: userObject.currentPrograms[userObject.activeProgram].loading_scheme,
                exerciseListPerDay: updatedDailyExerciseList(
                    userObject.currentPrograms[userObject.activeProgram],
                    this.handleDeleteExerciseButton,
                    this.handleUpdateExercise
                ),
                currDaySafeLoadTableData: userObject.userType === 'athlete' ? this.generateCurrDaySafeLoadData(
                    userObject.currentPrograms[userObject.activeProgram],
                    anatomyObject
                ) : [],
                availExercisesData: setAvailExerciseChartData(
                    this.state.exerciseList,
                    this.state.currentDayUI,
                    userObject.currentPrograms[userObject.activeProgram].loading_scheme,
                    convertTotalDaysToUIDay(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram),
                    this.handleAddExerciseButton
                ),
                prevWeeksData: this.generatePrevWeeksData(userObject),
                // TODO - if not want delete
                submitDataProcessing: false,
                userType: userObject.userType
            })
        } else {
            this.setState({
                programList: ['No Current Programs'],
                activeProgram: '',
                loading: false,
                hasPrograms: false
            })
        }
    }

    initSequenceName = (userObject) => {
        if (userObject.currentPrograms[userObject.activeProgram].order) {
            return userObject.currentPrograms[userObject.activeProgram].order.split('_')[1]
        }
        return undefined
    }

    initActiveProgramOwner = (userObject) => {
        var activeProgramOwner = userObject.activeProgram.split('_')[1]
        if (activeProgramOwner === this.props.firebase.auth.currentUser.uid) {
            return undefined
        } else {
            for (var coach in userObject.teams) {
                if (coach === activeProgramOwner) {
                    return userObject.teams[coach].username
                }
            }
            return undefined
        }
    }

    updateExpandedRows = (rows) => {
        this.setState({
            expandedRows: rows
        })
    }

    generateSubGoalData = (subGoalList) => {
        var returnArray = []
        Object.keys(subGoalList).forEach(subGoalKey => {
            var subGoal = subGoalList[subGoalKey]
            returnArray.push({
                description: subGoal.description,
                progressString: (subGoal.completed) ? 'Complete' : 'In Progress',
                completed: subGoal.completed,
                targetCloseDate: subGoal.closeOffDate,
                goalUID: subGoalKey,
                difficulty: subGoal.difficulty,
                btns: <div className='editGoalTableBtnContainer'>
                    <CompleteGoalButton buttonHandler={this.handleCompleteGoalButton} uid={'sg_' + subGoalKey} currProgress={subGoal.completed} />
                    <EditGoalModal
                        submitHandler={this.handleEditGoalSubmit} uid={'sg_' + subGoalKey}
                        isSubGoal={true}
                        currentData={subGoal}
                    />
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

    generateNewMainGoalUID = () => {
        var currentMainGoalUIDs = []
        var newMainGoalIndex = 1

        this.state.goalTableData.forEach(mainGoal => {
            currentMainGoalUIDs.push(mainGoal.goalUID)
        })

        var newGoalUIDFound = false
        var newMainGoalUID = ''
        while (!newGoalUIDFound) {
            newMainGoalUID = 'Goal_' + newMainGoalIndex
            if (currentMainGoalUIDs.includes(newMainGoalUID)) {
                newMainGoalIndex++
                continue
            } else {
                newGoalUIDFound = true
                break
            }

        }

        return newMainGoalIndex - 1

    }
    generateGoalParentIDFromSubgoalID = (id) => {
        var goalIDs = {}
        var idComponents = id.split('_')
        // return 'Goal_' + idComponents[1]

        if (idComponents[0] == 'mg') {
            goalIDs['isSubGoal'] = false
            goalIDs['mainGoal'] = 'Goal_' + idComponents[2]
        } else if (idComponents[0] == 'sg') {
            goalIDs['isSubGoal'] = true
            goalIDs['mainGoal'] = 'Goal_' + idComponents[1]
            goalIDs['subGoal'] = idComponents[1] + '_' + idComponents[2]
        }
        return goalIDs
    }

    handleCompleteGoalButton = async (id, currProgress) => {

        var goalInfo = this.generateGoalParentIDFromSubgoalID(id)
        var totalGoalInfo = this.state.goalTableData
        // If the goal selected is a sub goal. Progress of main goal must be assessed as well.
        // For each of the main goals find the correct parent goal, then check if all sub goals are completed. 
        // If all subgoals are completed check the main goal as completed as well, else main goal remains incomplete.
        if (goalInfo.isSubGoal) {
            for (var mgIndex in totalGoalInfo) {
                var mainGoal = totalGoalInfo[mgIndex]
                if (mainGoal.goalUID == goalInfo.mainGoal) {
                    var updateObject = {}
                    // Completes the specific goal that was click on the screen.
                    updateObject[this.generateGoalPathFromID(id) + '/completed'] = !currProgress

                    // If the sub goal is going to be false and the main goal is currently
                    // completed then changed both to false. 
                    if (!currProgress == false && mainGoal.completed == true) {
                        updateObject[goalInfo.mainGoal + '/mainGoal/completed'] = false


                    } else if (!currProgress == true && mainGoal.completed == false) {

                        var allSubGoalsCompleted = true

                        // Iterate through all sub goals to check that all are completed.
                        // Skip the current goal which is going to be changed. As this will updated with the
                        // the main goal.
                        for (var sgIndex in mainGoal.subRows) {
                            var subGoal = mainGoal.subRows[sgIndex]
                            if (!subGoal.completed && goalInfo.subGoal != subGoal.goalUID) {
                                allSubGoalsCompleted = false
                                break
                            }
                        }

                        // If all the other goals are completed besides the current goal to be changed.
                        // Change the main goal to completed. 
                        if (allSubGoalsCompleted) {
                            updateObject[goalInfo.mainGoal + '/mainGoal/completed'] = true
                        }

                    }

                    await this.props.firebase.updateGoalStatusesUpstream(
                        this.props.firebase.auth.currentUser.uid,
                        this.state.activeProgram,
                        updateObject
                    )

                    break
                }
            }
        } else {
            await this.props.firebase.completeGoalUpstream(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram,
                this.generateGoalPathFromID(id),
                !currProgress
            )
        }
    }

    handleEditGoalSubmit = (id, goalData) => {

        this.props.firebase.modifyGoalUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.generateGoalPathFromID(id),
            goalData.getFormattedGoalObject()
        )
    }

    handleCreateSubGoalSubmit = async (goalData, mainGoalID) => {
        var currentGoalData = this.state.goalTableData
        var parentGoalUID = this.generateGoalParentIDFromSubgoalID(mainGoalID)

        // Locate the correct parent goal to count the number of sub goals in the main goal.
        for (var goalIndex in currentGoalData) {

            if (currentGoalData[goalIndex].goalUID == parentGoalUID.mainGoal) {
                var newSubGoalUID = ''
                // If the main goal does not have any sub goals just set the uid of the sub goal as 1.
                if (currentGoalData[goalIndex].subRows == undefined) {
                    var newSubGoalUID = parentGoalUID.mainGoal.split('_')[1] + '_' + '1'
                    var insertionPath = '/subGoals/' + newSubGoalUID
                    // Else just index through until you find a sub goal UID not accounted for. 
                } else {

                    var currentSubGoalUIDs = []
                    // Strip out all the uid's all the subgoals. 

                    currentGoalData[goalIndex].subRows.forEach(subGoal => {
                        currentSubGoalUIDs.push(subGoal.goalUID)
                    })

                    var newIndexDetermined = false
                    var newSubGoalIndex = 1
                    while (!newIndexDetermined) {
                        newSubGoalUID = parentGoalUID.mainGoal.split('_')[1] + '_' + newSubGoalIndex
                        if (currentSubGoalUIDs.includes(newSubGoalUID)) {
                            newSubGoalIndex++
                            continue
                        } else {
                            newIndexDetermined = true
                            break
                        }
                    }

                    insertionPath = '/subGoals/' + newSubGoalUID
                }

                var insertionObject = {}

                insertionObject['/mainGoal/completed'] = false

                insertionObject[insertionPath] = goalData.getFormattedGoalObject()

                // one big bulk update.
                await this.props.firebase.createSubGoalUpstream(
                    this.props.firebase.auth.currentUser.uid,
                    this.state.activeProgram,
                    parentGoalUID.mainGoal,
                    insertionObject
                )

                break
            }

        }
    }

    generateGoalPathFromID = (id) => {
        var path = ''
        var idComponents = id.split('_')
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

        if (programObject.goals != undefined) {
            if (Object.keys(programObject.goals).length > 0) {
                var tableData = []

                Object.keys(programObject.goals).forEach(goalKey => {
                    var goal = programObject.goals[goalKey]
                    if (goal.subGoals != undefined) {
                        tableData.push({
                            description: goal.mainGoal.description,
                            progressString: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                            completed: goal.mainGoal.completed,
                            subRows: this.generateSubGoalData(goal.subGoals),
                            goalUID: goalKey,
                            targetCloseDate: goal.mainGoal.closeOffDate,
                            difficulty: goal.mainGoal.difficulty,
                            btns:
                                <div className='editGoalTableBtnContainer'>
                                    <AddSubGoalModal submitHandler={this.handleCreateSubGoalSubmit} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
                                    <EditGoalModal submitHandler={this.handleEditGoalSubmit} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
                                </div>
                        })
                    } else {
                        tableData.push({
                            description: goal.mainGoal.description,
                            progressString: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                            targetCloseDate: goal.mainGoal.closeOffDate,
                            completed: goal.mainGoal.completed,
                            goalUID: goalKey,
                            difficulty: goal.mainGoal.difficulty,
                            btns:
                                <div className='editGoalTableBtnContainer'>
                                    <AddSubGoalModal submitHandler={this.handleCreateSubGoalSubmit} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
                                    <CompleteGoalButton buttonHandler={this.handleCompleteGoalButton} uid={'mg_' + goalKey} currProgress={goal.mainGoal.completed} />
                                    <EditGoalModal submitHandler={this.handleEditGoalSubmit} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
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
                rpe: updateObject.rpe,
                weight: updateObject.weight,
                reps: updateObject.reps,
                primMusc: updateObject.primMusc
            }
        }

        await this.props.firebase.pushExercisePropertiesUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            day,
            updateObject.exUid,
            dataPayload
        )
    }

    // TO REMOVE ONCE TESTED ON CURR PROGRAMS PAGE
    // updatedDailyExerciseList = (userObject, loadingScheme) => {
    //     // Introduce a call back to show the current exercises. 
    //     // Can only be done once the other parameters above have been set. 
    //     var currWeek = Math.ceil(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram / 7)

    //     var firstDayOfWeek = 1 + 7 * (currWeek - 1)
    //     var lastDayOfWeek = firstDayOfWeek + 6

    //     var programDaysInCurrWeek = []

    //     for (var day = firstDayOfWeek; day <= lastDayOfWeek; day++) {
    //         programDaysInCurrWeek.push(day)
    //     }

    //     var currProg = userObject.activeProgram
    //     var exPerDayObj = {}

    //     for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
    //         var currWeekProgExer = userObject.currentPrograms[currProg]

    //         var dailyExercises = []

    //         if (programDaysInCurrWeek[dayIndex] in currWeekProgExer) {
    //             for (var exercise in currWeekProgExer[programDaysInCurrWeek[dayIndex]]) {

    //                 if (exercise != 'loadingData') {
    //                     var renderObj = currWeekProgExer[programDaysInCurrWeek[dayIndex]][exercise]
    //                     renderObj.uid = exercise
    //                     renderObj.deleteButton =
    //                         (this.shouldRenderExerciseButtons(
    //                             exercise,
    //                             userObject.currentPrograms[userObject.activeProgram].currentDayInProgram
    //                         )) ? (loadingScheme === 'rpe_time') ?
    //                                 <div className='currDayExBtnContainer'>
    //                                     <EditExerciseModalRpeTime submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
    //                                     <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />
    //                                 </div>
    //                                 :
    //                                 <div className='currDayExBtnContainer'>
    //                                     <EditExerciseModalWeightSets submitHandler={this.handleUpdateExercise} exUid={exercise} currentData={renderObj} />
    //                                     <DeleteExerciseButton buttonHandler={this.handleDeleteExerciseButton} uid={exercise} />
    //                                 </div>
    //                             :
    //                             <></>
    //                     dailyExercises.push(renderObj)
    //                 }
    //             }
    //         }
    //         var sortedExerciseArray = orderUserExercisesBasedOnExUID(dailyExercises)
    //         exPerDayObj[programDaysInCurrWeek[dayIndex]] = sortedExerciseArray
    //     }
    //     return exPerDayObj
    // }

    shouldRenderExerciseButtons = (uid, currDay) => {
        if (uid.split("_").reverse()[1] < currDay) {
            return false
        }
        return true
    }

    // Updated with new ratio calcs format
    componentWillUnmount() {
        this.props.firebase.getUserData().off();

    }

    // Handles the pagination day change
    handleChangeDayPage = (currentDay) => {
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

    // Updated with new ratio calcs format
    handleDeleteExerciseButton = async (event, { id }) => {
        event.preventDefault()
        var exUid = id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        var day = exUid.split('_').reverse()[1]
        await this.props.firebase.deleteExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            day,
            exUid
        )
    }

    checkNullExerciseData = (data, scheme) => {

        var exData = {
            allValid: true,
            exercisesToCheck: []
        }

        if (data === undefined) {
            return exData
        }

        Object.values(data).forEach(exercise => {
            if (scheme === 'rpe_time') {
                for (var stat in exercise) {
                    if (exercise[stat] === '' || exercise[stat] === undefined) {
                        if (exData.allValid) {
                            exData.allValid = false
                        }
                        exData.exercisesToCheck.push({
                            rpe: exercise.rpe,
                            sets: exercise.sets,
                            reps: exercise.reps,
                            exercise: exercise.exercise
                        })
                    }
                }
            } else {
                for (var stat in exercise) {
                    if (stat !== 'time') {
                        if (exercise[stat] === '' || exercise[stat] === undefined) {
                            if (exData.allValid) {
                                exData.allValid = false
                            }
                            exData.exercisesToCheck.push({
                                rpe: exercise.rpe,
                                weight: exercise.weight,
                                sets: exercise.sets,
                                reps: exercise.reps,
                                exercise: exercise.exercise
                            })
                        }
                    }
                }
            }
        })

        return exData
    }

    handleNullCheckProceed = async (proceed) => {
        console.log(proceed)
        if (proceed) {
            await this.props.firebase.getProgramData(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram
            ).once('value', async userData => {
                var userObject = userData.val();

                await this.props.firebase.anatomy().once('value', async snapshot => {
                    const anatomyObject = snapshot.val();

                    var processedDayData = calculateDailyLoads(
                        userObject,
                        userObject.currentDayInProgram,
                        userObject.loading_scheme,
                        userObject.acutePeriod,
                        userObject.chronicPeriod,
                        anatomyObject
                    )

                    // Submit day in one update statement.
                    var loadPath =
                        userObject.currentDayInProgram
                        + '/'
                        + 'loadingData'

                    var currDay = 'currentDayInProgram'


                    var payLoad = {}
                    payLoad[loadPath] = processedDayData
                    payLoad[currDay] = parseInt(this.state.currentDayInProgram + 1)

                    await this.props.firebase.handleSubmitDayUpstream(
                        this.props.firebase.auth.currentUser.uid,
                        this.state.activeProgram,
                        payLoad
                    )

                    this.setState({
                        nullExerciseData: {
                            hasNullData: false,
                            nullTableData: []
                        },
                        submitDataProcessing: false
                    })
                })

            })
        } else {
            this.setState({
                nullExerciseData: {
                    hasNullData: false,
                    nullTableData: []
                },
                submitDataProcessing: false
            })
        }
    }

    handleSubmitButton = async () => {
        // Get the current exercise data for the given week.
        // And for the current active program. 
        this.setState({
            submitDataProcessing: true,
        }, async () => {

            await this.props.firebase.getProgramData(
                this.props.firebase.auth.currentUser.uid,
                this.state.activeProgram
            ).once('value', async userData => {
                var userObject = userData.val();

                await this.props.firebase.anatomy().once('value', async snapshot => {
                    const anatomyObject = snapshot.val();

                    var dataCheck = this.checkNullExerciseData(
                        userObject[userObject.currentDayInProgram],
                        userObject.loading_scheme
                    )

                    if (dataCheck.allValid) {
                        var processedDayData = calculateDailyLoads(
                            userObject,
                            userObject.currentDayInProgram,
                            userObject.loading_scheme,
                            userObject.acutePeriod,
                            userObject.chronicPeriod,
                            anatomyObject
                        )

                        // Submit day in one update statement.
                        var loadPath =
                            userObject.currentDayInProgram
                            + '/'
                            + 'loadingData'

                        var currDay = 'currentDayInProgram'


                        var payLoad = {}
                        payLoad[loadPath] = processedDayData
                        payLoad[currDay] = parseInt(this.state.currentDayInProgram + 1)

                        await this.props.firebase.handleSubmitDayUpstream(
                            this.props.firebase.auth.currentUser.uid,
                            this.state.activeProgram,
                            payLoad
                        )
                    } else {
                        console.log(dataCheck)
                        this.setState({
                            nullExerciseData: {
                                hasNullData: true,
                                nullTableData: dataCheck.exercisesToCheck
                            }
                        })
                    }
                });

            })
        })
    }

    // Updated with new ratio calcs format
    convertUIDayToTotalDays = (day) => {
        return (parseInt((this.state.currentWeekInProgram - 1) * 7) + parseInt(day)).toString()
    }

    // Updated with new ratio calcs format
    handleAddExerciseButton = async (exerciseObject) => {

        var exUID = generateExerciseUID(
            exerciseObject,
            this.state.exerciseListPerDay,
            this.state.currentDayInProgram
        )
        // var exUID = this.generateExerciseUID(exerciseObject.name, exerciseObject.day)

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
                rpe: exerciseObject.rpe,
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

        this.setState({
            currentDayUI: exerciseObject.day
        })


    }

    findRelatedSequentialPrograms = (currProgramsObject, seqOrderString) => {

        // If the start of the sequence is 1 - there will be no related programs in current or past programs. Related programs will only exist in pending programs.
        var seqOrderArray = seqOrderString.split('_')
        seqOrderArray.shift()
        var sequenceString = seqOrderArray.join("_")
        var relatedPrograms = []

        Object.keys(currProgramsObject).forEach(programUID => {
            var programData = currProgramsObject[programUID]

            if (programData.order) {
                if (programData.order !== seqOrderString) {
                    var currOrderArray = programData.order.split('_')
                    currOrderArray.shift()
                    var currSeqString = currOrderArray.join("_")

                    if (sequenceString === currSeqString) {
                        relatedPrograms.push({
                            programUID: programUID,
                            order: programData.order
                        })
                    }
                }
            }
        })
        return relatedPrograms
    }


    getValidActiveProgram = () => {
        if (this.state.programList.length === 1) {
            return ''
        } else {

            var activeProgramData = this.state.allPrograms[this.state.activeProgram]

            console.log(activeProgramData)
            if (activeProgramData.isActiveInSequence) {

                var relatedPrograms = this.findRelatedSequentialPrograms(this.state.allPrograms, activeProgramData.order)

                if (relatedPrograms.length > 0) {
                    relatedPrograms.sort((a, b) => {
                        return parseInt(a.order.split('_')[0]) - parseInt(b.order.split('_')[0])
                    })

                    return {
                        programName: relatedPrograms[0].programUID,
                        isNextInSequence: true
                    }
                } else {
                    // If its the final program in the sequence then just treat as an unlimited program. 
                    for (var program in this.state.allPrograms) {

                        if (program !== this.state.activeProgram) {
                            var programData = this.state.allPrograms[program]
                            if (programData.isActiveInSequence === undefined) {
                                return program
                            } else {
                                if (programData.isActiveInSequence) {
                                    return {
                                        programName: program,
                                        isNextInSequence: false
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // its an unlimited program and just find the next valid program to assign to. 
                for (var program in this.state.allPrograms) {

                    if (program !== this.state.activeProgram) {
                        var programData = this.state.allPrograms[program]
                        if (programData.isActiveInSequence === undefined) {
                            return {
                                programName: program,
                                isNextInSequence: false
                            }
                        } else {
                            if (programData.isActiveInSequence) {
                                return {
                                    programName: program,
                                    isNextInSequence: false
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Updated with new ratio calcs format
    handleCloseOffProgram = async () => {

        // to remove if else statement 
        if (this.state.programList.length === 1) {
            var newProgram = ''
        } else {
            for (var program in this.state.programList) {
                if (this.state.programList[program] !== this.state.activeProgram) {
                    var newProgram = this.state.programList[program]
                    break
                }
            }
        }

        var payLoad = {}
        var newProgramData = this.getValidActiveProgram()

        var basePath = '/users/' + this.props.firebase.auth.currentUser.uid

        // Sets the new active program in the payload. 
        payLoad[basePath + '/activeProgram'] = newProgramData.programName

        // If the new active program is next in line in a sequence. This will cause a corresponding change in isActiveInSequence. Sets in payload
        if (newProgramData.isNextInSequence) {
            payLoad[basePath + '/currentPrograms/' + newProgramData.programName + '/isActiveInSequence'] = true
        }

        // Sets in payload the remove of the closed off program from currentPrograms. 
        payLoad[basePath + '/currentPrograms/' + this.state.activeProgram] = null

        var programToCloseOff = this.state.activeProgram

        await this.props.firebase.getProgramData(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram
        ).once('value', async data => {
            var programData = data.val()

            if (programData.isActiveInSequence !== undefined) {
                delete programData.isActiveInSequence
            }

            programData.endDayUTS = Math.floor(new Date().getTime())

            payLoad[basePath + '/pastPrograms/' + programToCloseOff] = programData

            await this.props.firebase.closeOffProgramUpstream(payLoad)
        })

    }

    handleChangeDaysOpenView = (day) => {
        var newArray = this.state.openDaysUI
        newArray[day] = !newArray[day]
        this.setState({
            openDaysUI: newArray
        })
    }

    handleAddGoalData = (goalData) => {

        this.props.firebase.createMainGoalUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            'Goal_' + (parseInt(goalData.getUID()) + 1),
            goalData.getFormattedGoalObject()
        )
    }

    generateCurrDaySafeLoadData = (programData, anatomyObject) => {

        var returnData = []

        if (programData.currentDayInProgram !== 1) {
            var currDayData = dailyLoadCalcs(
                programData[programData.currentDayInProgram],
                anatomyObject,
                programData.loading_scheme
            )
            Object.keys(anatomyObject).forEach(muscleGroup => {

                var prevDayChronicLoad = programData[programData.currentDayInProgram - 1]['loadingData'][muscleGroup]['Total']['chronicEWMA']
                var prevDayAcuteLoad = programData[programData.currentDayInProgram - 1]['loadingData'][muscleGroup]['Total']['acuteEWMA']
                var maxLoadData = 0;
                (prevDayAcuteLoad * 1.1 > prevDayChronicLoad * 1.2) ? maxLoadData = prevDayAcuteLoad : maxLoadData = prevDayChronicLoad
                if (maxLoadData !== 0 || prevDayChronicLoad !== 0) {
                    returnData.push({
                        bodyPart: muscleGroup,
                        currDayLoad: currDayData[muscleGroup]['Total'].dailyLoad.toFixed(2),
                        minSafeLoad: (prevDayChronicLoad * 0.8).toFixed(2),
                        maxSafeLoad: maxLoadData.toFixed(2),
                        subRows: this.generateSpecificMuscleSafeLoadData(
                            programData,
                            muscleGroup,
                            currDayData,
                            anatomyObject[muscleGroup]
                        ),
                    })
                }
            })
        }
        return returnData

    }

    generateSpecificMuscleSafeLoadData = (programData, muscleGroup, currDayData, specificMuscleData) => {

        var returnData = []
        specificMuscleData.forEach(muscle => {
            var prevDayChronicLoad = programData[programData.currentDayInProgram - 1]['loadingData'][muscleGroup][muscle]['chronicEWMA']
            var prevDayAcuteLoad = programData[programData.currentDayInProgram - 1]['loadingData'][muscleGroup][muscle]['acuteEWMA']
            var maxLoadData = 0;
            (prevDayAcuteLoad * 1.1 > prevDayChronicLoad * 1.2) ? maxLoadData = prevDayAcuteLoad : maxLoadData = prevDayChronicLoad

            if (maxLoadData !== 0 || prevDayChronicLoad !== 0) {
                returnData.push({
                    bodyPart: muscle,
                    currDayLoad: currDayData[muscleGroup][muscle].dailyLoad.toFixed(2),
                    minSafeLoad: (prevDayChronicLoad * 0.8).toFixed(2),
                    maxSafeLoad: maxLoadData.toFixed(2),
                })
            }

        })

        return returnData
    }

    handleStartProgram = (start) => {
        console.log(start)

        var path =
            '/users'
            + '/' + this.props.firebase.auth.currentUser.uid
            + '/currentPrograms'
            + '/' + this.state.activeProgram
            + '/startDayUTS'

        var payLoad = {}
        payLoad[path] = new Date().getTime()

        this.props.firebase.updateDatabaseFromRootPath(payLoad)
    }

    generatePrevWeeksData = (userObject) => {
        var currWeek = currentWeekInProgram(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram)

        var dataObject = {}

        if (currWeek == 1) {
            return {}
        } else {
            for (var prevWeekNum = 1; prevWeekNum < currWeek; prevWeekNum++) {
                dataObject[prevWeekNum] = {}

                for (var day = 1; day < 8; day++) {

                    var dayInProgram = (prevWeekNum - 1) * 7 + day
                    var dayObject = {}
                    if (userObject.currentPrograms[userObject.activeProgram][dayInProgram]) {
                        Object.keys(userObject.currentPrograms[userObject.activeProgram][dayInProgram]).forEach(exercise => {
                            if (exercise != 'loadingData') {
                                dayObject[exercise] = userObject.currentPrograms[userObject.activeProgram][dayInProgram][exercise]
                            }
                        })
                    }

                    dataObject[prevWeekNum][day] = dayObject
                }
            }
        }
        return dataObject
    }

    handleCopyPrevWeeksExData = (weekData, insertionDay) => {
        var insertData = {}

        if (insertionDay === undefined) {
            Object.keys(weekData).forEach(day => {
                insertData[this.convertUIDayToTotalDays(day)] = {}

                Object.keys(weekData[day]).forEach(exercise => {
                    var reverseExComp = exercise.split("_").reverse()
                    reverseExComp[2] = this.state.currentWeekInProgram

                    var currExDay = reverseExComp[1]

                    reverseExComp[1] = this.convertUIDayToTotalDays(convertTotalDaysToUIDay(currExDay))

                    var newExID = reverseExComp.reverse().join("_")

                    insertData[this.convertUIDayToTotalDays(day)][newExID] = weekData[day][exercise]

                })

            })
        } else {
            insertData[this.convertUIDayToTotalDays(insertionDay)] = {}
            Object.keys(weekData).forEach(exercise => {
                var reverseExComp = exercise.split("_").reverse()
                reverseExComp[2] = this.state.currentWeekInProgram

                reverseExComp[1] = this.convertUIDayToTotalDays(convertTotalDaysToUIDay(insertionDay))


                var newExID = reverseExComp.reverse().join("_")

                insertData[this.convertUIDayToTotalDays(insertionDay)][newExID] = weekData[exercise]
            })
        }

        console.log('going in ')
        console.log(insertData)
        this.props.firebase.createBulkExercisesUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            insertData,
        )
    }

    handleViewNextWeek = () => {
        this.props.firebase.progressToNextDay(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.state.currentDayInProgram + 7
        )
    }

    handleViewPrevWeek = () => {
        this.props.firebase.progressToNextDay(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.state.currentDayInProgram - 7
        )
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
            prevWeeksData,
            safeLoadTableVisible,
            goalsTableVisible,
            startDayUTS,

            // New state variables.
            currentDayInProgram,
            daysInWeekScope,
            openDaysUI,
            expandedRows,
            submitDataProcessing,
            nullExerciseData,
            userType,
            availExerciseTableVisible,
            sequenceName,
            programOwner
        } = this.state

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>
        let noCurrentProgramsHTML = <NonLandingPageWrapper><Header as='h1'>Create A Program Before Accessing This Page</Header></NonLandingPageWrapper>
        let hasCurrentProgramsHTML =
            <NonLandingPageWrapper>
                <ConfirmNullExerciseData
                    showModal={nullExerciseData.hasNullData}
                    handleFormProceed={this.handleNullCheckProceed}
                    nullExTableData={nullExerciseData.nullTableData}
                    scheme={loadingScheme}
                />
                <div className='pageContainerLevel1'
                    id='cpPageContainer1'>
                    <div id='cpProgramHeader'>
                        {activeProgram.split('_')[0]}
                    </div>
                    <div id='cpWeekHeader'>
                        {
                            userType === 'athlete' ?
                                'Week ' + currentWeekInProgram + ', Day ' + convertTotalDaysToUIDay(currentDayInProgram)
                                :
                                'Week ' + currentWeekInProgram
                        }
                    </div>
                    <div id='programOwnerHeaderDiv'>
                        {programOwner && 'Written By: ' + programOwner}
                    </div>
                    <div id='sequenceNameHeaderDiv'>
                        {sequenceName && 'Program Sequence: ' + sequenceName}
                    </div>
                    <div id='cpButtonsHeader'>
                        <div id='submitDayBtnContainer'>
                            {
                                startDayUTS ?
                                    userType === 'athlete' ?
                                        <SubmitDayModal
                                            handleFormSubmit={this.handleSubmitButton}
                                            submitDataProcessing={submitDataProcessing}
                                        />
                                        :
                                        currentDayInProgram > 1 ?
                                            < Button
                                                onClick={() => { this.handleViewPrevWeek() }}
                                                className='purpleButton'
                                            >
                                                Previous Week
                                        </Button>
                                            :
                                            <></>
                                    :
                                    <></>
                            }
                        </div>
                        <div id='programsDropdownContainer'>
                            <CurrentProgramDropdown
                                programList={programList}
                                activeProgram={activeProgram}
                                buttonHandler={this.handleSelectProgramButton}
                            />
                        </div>
                        <div id='closeOffProgBtnContainer'>
                            {
                                startDayUTS ?
                                    userType === 'athlete' ?
                                        <CloseOffProgramModal handleFormSubmit={this.handleCloseOffProgram} />
                                        :
                                        <Button
                                            className='purpleButton'
                                            onClick={() => { this.handleViewNextWeek() }}
                                        >
                                            Next Week
                                    </Button>
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                </div>
                {
                    userType === 'athlete' && startDayUTS &&
                    <div className='pageRowContainer'>
                        <div className='pageContainerLevel1' id='cpExerciseSpreadTableContainer'>
                            <div onClick={() => this.setState({ goalsTableVisible: !goalsTableVisible })}>
                                {
                                    goalsTableVisible &&
                                    <Icon name='toggle on' style={{ fontSize: '20px' }} />
                                }
                                {
                                    !goalsTableVisible &&
                                    <Icon name='toggle off' style={{ fontSize: '20px' }} />

                                }
                            </div>
                            {
                                goalTableData.length > 0 && goalsTableVisible &&
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
                                            newMainGoalUID={this.generateNewMainGoalUID()}
                                            triggerElement={
                                                <Button
                                                    className='lightPurpleButton-inverted'>
                                                    Add More Goals
                                            </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            }
                            {
                                goalTableData.length == 0 &&
                                goalsTableVisible &&
                                <div id='noGoalsPromptContainer'>
                                    <div id='noGoalsPromptLabelContainer'>
                                        <InputLabel text='No Current Goal Data' custID='noGoalsPromptLabel' />
                                    </div>
                                    <div className='goalsPromptBtnContainer'>
                                        <AddGoalsForm
                                            buttonText='Create Goals'
                                            headerText='Create Goals'
                                            handleFormSubmit={this.handleAddGoalData}
                                            newMainGoalUID={this.generateNewMainGoalUID()}
                                            triggerElement={
                                                <Button
                                                    className='lightPurpleButton-inverted'>
                                                    Create A Goal
                                            </Button>
                                            }

                                        />
                                    </div>
                                </div>
                            }
                        </div>
                        <div className='pageContainerLevel1'
                            id='cpLoadingSpreadTableContainer'>
                            <div onClick={() => this.setState({ safeLoadTableVisible: !safeLoadTableVisible })}>
                                {
                                    safeLoadTableVisible &&
                                    <Icon style={{ fontSize: '20px' }} name='toggle on' />
                                }
                                {
                                    !safeLoadTableVisible &&
                                    <Icon style={{ fontSize: '20px' }} name='toggle off' />

                                }
                            </div>
                            {
                                safeLoadTableVisible &&
                                <LoadingSpreadStatsTable data={currDaySafeLoadTableData} />
                            }
                        </div>
                    </div>
                }
                {
                    startDayUTS &&
                    <div className='pageRowContainer'>
                        <div className='pageContainerLevel1' id='availExerciseTableContainer'>
                            <div id='availExercises-ExData-toggleContainer'>
                                <Button.Group size='tiny'>
                                    {
                                        availExerciseTableVisible ?
                                            <Button
                                                className='smallerBtn'
                                                active
                                            >
                                                Available Exercises
                                        </Button>
                                            :
                                            <Button
                                                className='smallerBtn'
                                                onClick={() => this.setState({ availExerciseTableVisible: true })}
                                            >
                                                Available Exercises
                                        </Button>
                                    }
                                    {
                                        !availExerciseTableVisible ?
                                            <Button

                                                active
                                            >
                                                Program Exercise History
                                        </Button>
                                            :
                                            <Button
                                                onClick={() => this.setState({ availExerciseTableVisible: false })}
                                            >
                                                Program Exercise History
                                        </Button>
                                    }
                                </Button.Group>
                            </div>
                            {
                                availExerciseTableVisible ?
                                    <AvailableExercisesList
                                        columns={availExercisesCols}
                                        data={availExercisesData}
                                    />
                                    :
                                    <ViewPrevWeeksData
                                        data={prevWeeksData}
                                        defaultWeek={currentWeekInProgram - 1}
                                        progScheme={loadingScheme}
                                        handleFormSubmit={this.handleCopyPrevWeeksExData}
                                    />

                            }
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
                }
                {
                    startDayUTS === undefined &&
                    <StartProgramView
                        handleFormProceed={this.handleStartProgram}
                    />
                }
            </NonLandingPageWrapper >
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