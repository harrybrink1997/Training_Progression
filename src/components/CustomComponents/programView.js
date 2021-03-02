import React, { useEffect, useState, useReducer, useRef } from 'react'
import { Loader, Button, Icon, Popup, Header } from 'semantic-ui-react'
import { capitaliseFirstLetter } from '../../constants/stringManipulation'
import BasicTable from './basicTable'
import CurrentWeekExercisesContainer from '../CurrentProgram/currentWeekExercisesContainer'
import AvailableExercisesList from '../CurrentProgram/availableExercisesList'
import { convertTotalDaysToUIDay, convertUIDayToTotalDays, currentWeekInProgram } from '../../constants/dayCalculations'
import SubmitDayModal from '../CurrentProgram/submitDayModal'
import ConfirmNullExerciseData from '../CurrentProgram/confirmNullExerciseData'
import ViewPrevWeeksData from '../CurrentProgram/viewPrevWeeksData'
import BodyPartListGroup from './bodyPartListGroup'
import InputLabel from './DarkModeInput'
import { ACWEGraph, RollChronicACWRGraph } from '../ProgressionData/ACWRGraph'
import { generateDaysInWeekScope, updatedDailyExerciseList, setAvailExerciseChartData, formatExerciseObjectForLocalInsertion, generateExerciseUID, generateACWRGraphData, generateSafeLoadGraphProps, generateGoalTableData, generateCurrDaySafeLoadData, generatePrevWeeksData } from '../../constants/viewProgramPagesFunctions'
import StartProgramView from './startProgramView'
import GoalsTable from './currentGoalTable'
import * as goalFunctions from '../../constants/goalFunctions'
import AddGoalsForm from './addGoalsForm'
import { LoadingSpreadStatsTable } from '../CurrentProgram/statsTable'
import ErrorBanner from '../CustomComponents/errorBanner'

const ProgramView = ({ data, handlerFunctions, availExData, availExColumns, nullExerciseData, submitProcessingBackend, rawAnatomyData, userType, developmentMode }) => {

    // Loading variables.
    const [firstRender, setFirstRender] = useState(true)
    const [loading, setLoading] = useState(true)
    const [overviewLoaded, setOverviewLoaded] = useState(false)
    const [programLoaded, setProgramLoaded] = useState(false)
    const [goalLoaded, setGoalLoaded] = useState(false)
    const [exercisesLoaded, setExercisesLoaded] = useState(false)
    const [submitDailyExDataProcessing, setSubmitDailyExDataProcessing] = useState(false)
    const [goalTableVisible, setGoalTableVisible] = useState(false)
    const [safeLoadTableVisible, setSafeLoadTableVisible] = useState(false)
    const [exTableView, setExTableView] = useState('available')
    const [progressionLoaded, setProgressionLoaded] = useState(true)
    const [exContRefesh, setExContRefresh] = useState(false)
    const [insertionDayError, setInsertionDayError] = useState(false)
    const [pageView, setPageView] = useState(
        userType === 'athlete' ? 'program' : 'overview'
    )
    const isDevelopmentMode = developmentMode
    // const [currExerciseView, setCurrExerciseView] = useState('availExercises')

    const handleChangeDaysOpenView = (day) => {
        var currProgramDataObj = programDataRef.current

        let newProgramData = { ...currProgramDataObj }

        var newArray = newProgramData.openDaysUI

        newArray[day] = !newArray[day]

        setProgramData({
            type: PROGRAM_ACTIONS.CHANGE_DAYS_OPEN_VIEW,
            payload: newArray
        })
    }

    // TODO FIX THIS AND ERROR IF DAY IS OUT OF REACH....
    const handleAddExerciseButton = (exerciseObject) => {
        var currProgramDataObj = programDataRef.current
        var insertionDayUI = exerciseObject.day
        var insertionDayTotal = convertUIDayToTotalDays(insertionDayUI, currProgramDataObj.currentDay)

        if (insertionDayTotal < currProgramDataObj.currentDay) {
            setInsertionDayError(true)
        } else {
            var exUID = generateExerciseUID(
                exerciseObject,
                currProgramDataObj.exerciseListPerDay,
                insertionDayTotal
            )

            var insertionDay = exUID.split('_').reverse()[1]

            var frontEndRenderObj = formatExerciseObjectForLocalInsertion(
                exerciseObject,
                exUID,
                currProgramDataObj.loadingScheme,
                currProgramDataObj.currentDay,
                handleUpdateExercise,
                handleDeleteExerciseButton
            )



            var rawDataInsertionObj = { ...frontEndRenderObj }

            rawDataInsertionObj.exercise = rawDataInsertionObj.name
            delete rawDataInsertionObj.name
            delete rawDataInsertionObj.day

            if (currProgramDataObj.loadingScheme === 'rpe_time') {
                delete rawDataInsertionObj.weight
            }

            let newProgramData = { ...currProgramDataObj }
            var newRawData = newProgramData.rawData

            if (newRawData[insertionDay]) {
                newRawData[insertionDay][exUID] = rawDataInsertionObj

            } else {
                var dayObj = {}
                dayObj[exUID] = rawDataInsertionObj
                newRawData[insertionDay] = dayObj

            }

            newProgramData.rawData = newRawData

            setProgramData({
                type: PROGRAM_ACTIONS.CHANGE_CURRENT_EXERCISE_LIST,
                payload: {
                    rawData: newRawData,
                    exerciseListPerDay: updatedDailyExerciseList(newRawData, handleDeleteExerciseButton, handleUpdateExercise)
                }
            })

            handlerFunctions.handleAddExerciseButton(
                exerciseObject,
                exUID,
                programData.loadingScheme,
                insertionDay
            )
        }
    }

    const handleDeleteExerciseButton = (event, { id }) => {
        event.preventDefault();
        var exUid = id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        var day = exUid.split('_').reverse()[1]

        var currProgramDataObj = programDataRef.current

        let newProgramData = { ...currProgramDataObj }

        var newRawData = newProgramData.rawData

        if (newRawData[day][exUid] && Object.keys(newRawData[day]).length === 1) {
            delete newRawData[day]

        } else {
            delete newRawData[day][exUid]

        }

        setProgramData({
            type: PROGRAM_ACTIONS.CHANGE_CURRENT_EXERCISE_LIST,
            payload: {
                rawData: newRawData,
                exerciseListPerDay: updatedDailyExerciseList(newRawData, handleDeleteExerciseButton, handleUpdateExercise)
            }
        })

        handlerFunctions.handleDeleteExerciseButton(id)
    }

    const handleStartProgram = () => {
        let startDateUTS = new Date().getTime()
        handlerFunctions.handleStartProgram(startDateUTS)

        setProgramData({
            type: PROGRAM_ACTIONS.START_PROGRAM,
            payload: startDateUTS
        })

    }

    const handleUpdateExercise = (updateObject) => {

        var day = updateObject.exUid.split('_').reverse()[1]

        var currProgramDataObj = programDataRef.current

        let newProgramData = { ...currProgramDataObj }

        var newRawData = newProgramData.rawData

        newRawData[day][updateObject.exUid].reps = updateObject.reps
        newRawData[day][updateObject.exUid].time = updateObject.time
        newRawData[day][updateObject.exUid].sets = updateObject.sets
        newRawData[day][updateObject.exUid].rpe = updateObject.rpe

        if (programData.loadingScheme === 'weight_reps') {
            newRawData[day][updateObject.exUid].weight = updateObject.weight
        }

        setProgramData({
            type: PROGRAM_ACTIONS.CHANGE_CURRENT_EXERCISE_LIST,
            payload: {
                rawData: newRawData,
                exerciseListPerDay: updatedDailyExerciseList(newRawData, handleDeleteExerciseButton, handleUpdateExercise)
            }
        })

        handlerFunctions.handleUpdateExercise(updateObject)
    }

    const handleChangeWeekView = (nextWeek) => {
        // Get a copy of the program data.
        let programDataCopy = { ...programData }
        var rawDataCopy = programDataCopy.rawData
        var currDay = programDataCopy.currentDay

        if (nextWeek) {
            var newDay = currDay + 7
        } else {
            newDay = currDay - 7
        }

        rawDataCopy.currentDay = newDay

        setProgramData({
            type: PROGRAM_ACTIONS.CHANGE_WEEK,
            payload: {
                currDay: newDay,
                rawData: rawDataCopy
            }
        })

    }

    const handleSubmitButton = () => {
        handlerFunctions.handleSubmitButton()
    }

    const initialiseProgramData = (rawProgramData) => {
        var payload = {
            rawData: rawProgramData,
            exerciseListPerDay: updatedDailyExerciseList(rawProgramData, handleDeleteExerciseButton, handleUpdateExercise),
            loadingScheme: rawProgramData.loadingScheme,
            daysInWeekScope: generateDaysInWeekScope(rawProgramData.currentDay),
            prevWeekExData: generatePrevWeeksData(rawProgramData),
            currentDay: rawProgramData.currentDay,
            currentDayUI: rawProgramData.currentDay,
            openDaysUI: [false, false, false, false, false, false, false],
            currButtonView: initCurrButtonView(rawProgramData.order, rawProgramData.isActiveInSequence, rawProgramData.currentDay, isDevelopmentMode),
            startDayUTS: rawProgramData.startDayUTS
        }

        return payload
    }



    const handleSelectBodyPart = (value) => {
        setProgressionData({
            type: PROGRESSION_ACTIONS.CHANGE_BODY_PART,
            payload: value
        })
    }

    const handleOpenMuscleGroup = (value) => {
        setProgressionData({
            type: PROGRESSION_ACTIONS.CHANGE_OPEN_BODY_GROUP,
            payload: value
        })
    }

    const PROGRESSION_ACTIONS = {
        CHANGE_BODY_PART: 'changeBodyPart',
        CHANGE_OPEN_BODY_GROUP: 'changeOpenBodyGroup',
        UPDATE_GRAPH_DATA: 'updateGraphData',
    }

    const progressionDataReducer = (state, action) => {
        switch (action.type) {
            case PROGRESSION_ACTIONS.CHANGE_BODY_PART:
                return {
                    ...state,
                    currentBodyPart: action.payload
                }

            case PROGRESSION_ACTIONS.CHANGE_OPEN_BODY_GROUP:
                return {
                    ...state,
                    currMuscleGroupOpen: action.payload
                }

            case PROGRESSION_ACTIONS.UPDATE_GRAPH_DATA:
                return {
                    ...state,
                    ACWRGraphProps: generateACWRGraphData(
                        action.payload.rawProgramData,
                        action.payload.anatomyData
                    ),
                    rollingAverageGraphProps: generateSafeLoadGraphProps(
                        action.payload.rawProgramData,
                        action.payload.anatomyData
                    ),
                }

            default:
                return state
        }
    }


    const handleGoalTableExpRowUpdate = (rows) => {
        setGoalData({
            type: GOAL_ACTIONS.UPDATE_EXPANDED_ROWS,
            payload: rows
        })
    }

    const GOAL_ACTIONS = {
        UPDATE_EXPANDED_ROWS: 'updateExpandedRows',
        DELETE_GOAL: 'deleteGoal',
        COMPLETE_GOAL: 'completeGoal',
        UPDATE_GOAL: 'updateGoal',
        ADD_SUBGOAL: 'addSubGoal',
        ADD_MAINGOAL: 'addMainGoal'
    }

    const goalDataReducer = (state, action) => {
        switch (action.type) {
            case GOAL_ACTIONS.DELETE_GOAL:
                return {
                    ...state,
                    rawData: action.payload,
                    tableData: generateGoalTableData(
                        action.payload,
                        handleCreateSubGoal,
                        handleEditGoal,
                        handleCompleteGoal,
                        handleDeleteGoal
                    ),
                }

            case GOAL_ACTIONS.COMPLETE_GOAL:
                return {
                    ...state,
                    rawData: action.payload,
                    tableData: generateGoalTableData(
                        action.payload,
                        handleCreateSubGoal,
                        handleEditGoal,
                        handleCompleteGoal,
                        handleDeleteGoal
                    ),
                }

            case GOAL_ACTIONS.UPDATE_GOAL:
                return {
                    ...state,
                    rawData: action.payload,
                    tableData: generateGoalTableData(
                        action.payload,
                        handleCreateSubGoal,
                        handleEditGoal,
                        handleCompleteGoal,
                        handleDeleteGoal
                    ),
                }

            case GOAL_ACTIONS.ADD_SUBGOAL:
                return {
                    ...state,
                    rawData: action.payload,
                    tableData: generateGoalTableData(
                        action.payload,
                        handleCreateSubGoal,
                        handleEditGoal,
                        handleCompleteGoal,
                        handleDeleteGoal
                    ),
                }

            case GOAL_ACTIONS.ADD_MAINGOAL:
                console.log('new ID ' + action.payload.newMainGoalUID)
                return {
                    ...state,
                    rawData: action.payload.data,
                    tableData: generateGoalTableData(
                        action.payload.data,
                        handleCreateSubGoal,
                        handleEditGoal,
                        handleCompleteGoal,
                        handleDeleteGoal
                    ),
                    newMainGoalUID: action.payload.newMainGoalUID
                }

            case GOAL_ACTIONS.UPDATE_EXPANDED_ROWS:
                return {
                    ...state,
                    expandedRows: action.payload
                }
        }
    }


    const PROGRAM_ACTIONS = {
        CHANGE_CURRENT_EXERCISE_LIST: 'changeCurrentExerciseList',
        UPDATE_ON_WEEK_CHANGE: 'updateOnWeekChange',
        CHANGE_WEEK: 'changeWeek',
        CHANGE_DAYS_OPEN_VIEW: 'changeDaysOpenView',
        START_PROGRAM: 'startProgram',
        COPY_EXERCISE_DATA: 'cpyExData'

    }

    const programDataReducer = (state, action) => {
        switch (action.type) {
            case PROGRAM_ACTIONS.CHANGE_CURRENT_EXERCISE_LIST:
                return {
                    ...state,
                    rawData: action.payload.rawData,
                    exerciseListPerDay: action.payload.exerciseListPerDay
                }

            case PROGRAM_ACTIONS.UPDATE_ON_WEEK_CHANGE:
                return {
                    ...state,
                    daysInWeekScope: action.payload.daysInWeekScope,
                    currButtonView: action.payload.currButtonView,
                    exerciseListPerDay: action.payload.exerciseListPerDay,
                    prevWeekExData: action.payload.prevWeekExData
                }

            case PROGRAM_ACTIONS.CHANGE_WEEK:
                return {
                    ...state,
                    currentDay: action.payload.currDay,
                    rawData: action.payload.rawData
                }

            case PROGRAM_ACTIONS.CHANGE_DAYS_OPEN_VIEW:
                return {
                    ...state,
                    openDaysUI: action.payload
                }

            case PROGRAM_ACTIONS.START_PROGRAM:
                return {
                    ...state,
                    startDayUTS: action.payload

                }
            case PROGRAM_ACTIONS.COPY_EXERCISE_DATA:
                return {
                    ...state,
                    rawData: action.payload.rawData,
                    exerciseListPerDay: action.payload.exerciseListPerDay
                }
            default:
                return state

        }
    }

    const SAFE_LOAD_ACTIONS = {
        REFRESH: 'refresh'
    }

    const safeLoadDataReducer = (state, action) => {
        switch (action.type) {
            case SAFE_LOAD_ACTIONS.REFRESH:
                console.log(action.payload)
                return {
                    ...state,
                    tableData: generateCurrDaySafeLoadData(
                        action.payload,
                        anatomyData
                    )
                }
            default:
                return state

        }
    }

    const initCurrButtonView = (order, isActiveInSequence, currentDay, developmentMode) => {
        if ((!order || isActiveInSequence) && !developmentMode) {

            return {
                nextWeek: false,
                prevWeek: false,
                submitDay: true
            }

        } else {

            if (currentDay > 7) {
                return {
                    nextWeek: true,
                    prevWeek: true,
                    submitDay: false
                }
            } else {
                return {
                    nextWeek: true,
                    prevWeek: false,
                    submitDay: false
                }
            }
        }
    }

    const initialiseOverviewData = (rawProgramData) => {
        var payload = {
            data: [],
            columns: [{ accessor: 'parameter' }, { accessor: 'value' }]
        }

        payload.data.push({
            parameter: 'Day In Program',
            value: rawProgramData.currentDay
        })
        payload.data.push({
            parameter: 'Acute Timeframe',
            value: rawProgramData.acutePeriod
        })
        payload.data.push({
            parameter: 'Chronic Timeframe',
            value: rawProgramData.chronicPeriod
        })
        payload.data.push({
            parameter: 'Program Type',
            value: rawProgramData.order ? 'Sequential' : 'Unlimited'
        })

        if (rawProgramData.order) {
            payload.data.push({
                parameter: 'Sequence Name',
                value: rawProgramData.order.split('_')[1]
            })
            payload.data.push({
                parameter: 'Order In Sequence',
                value: rawProgramData.order.split('_')[0]
            })
            payload.data.push({
                parameter: 'Currently Active In Sequence',
                value: rawProgramData.isActiveInSequence ? 'Yes' : 'No'
            })
        }

        return payload
    }

    const initialiseAvailableExerciseData = (rawProgramData, exerciseData) => {

        return {
            rawData: exerciseData,
            chartData: setAvailExerciseChartData(
                exerciseData,
                rawProgramData.loadingScheme,
                handleAddExerciseButton
            )
        }


    }

    const initialiseProgressionData = (rawProgramData) => {
        if (!isDevelopmentMode) {
            if (rawProgramData.currentDay === 1) {
                return undefined
            } else if (rawProgramData.order && !rawProgramData.isActiveInSequence) {
                return undefined
            } else {

                console.log({
                    ACWRGraphProps: generateACWRGraphData(rawProgramData, rawAnatomyData),
                    rollingAverageGraphProps: generateSafeLoadGraphProps(rawProgramData, rawAnatomyData),
                    currentBodyPart: 'Overall_Total',
                    currMuscleGroupOpen: 'Arms',

                })

                return {
                    ACWRGraphProps: generateACWRGraphData(rawProgramData, rawAnatomyData),
                    rollingAverageGraphProps: generateSafeLoadGraphProps(rawProgramData, rawAnatomyData),
                    currentBodyPart: 'Overall_Total',
                    currMuscleGroupOpen: 'Arms',

                }
            }
        }
    }

    const handleCreateSubGoal = (goalObj, mainGoalID) => {

        let rawData = { ...goalData.rawData }
        var mainGoalIndex = goalFunctions.goalDBUID(mainGoalID).split('_')[1]

        if (rawData[goalFunctions.goalDBUID(mainGoalID)].subGoals) {

            const currSubGoals = Object.keys(rawData[goalFunctions.goalDBUID(mainGoalID)].subGoals)

            var index = 1
            while (currSubGoals.includes(mainGoalIndex + '_' + index.toString())) {
                index++
            }

            var newDBUID = mainGoalIndex + '_' + index.toString()

            rawData[goalFunctions.goalDBUID(mainGoalID)].subGoals[newDBUID] = goalObj.getFormattedGoalObject()

        } else {
            var newDBUID = mainGoalIndex + '_1'

            rawData[goalFunctions.goalDBUID(mainGoalID)].subGoals = {
                [newDBUID]: goalObj.getFormattedGoalObject()
            }
        }

        if (rawData[goalFunctions.goalDBUID(mainGoalID)].mainGoal.completed) {
            rawData[goalFunctions.goalDBUID(mainGoalID)].mainGoal.completed = false
        }

        var dbPayload = {
            parentGoal: goalFunctions.goalDBUID(mainGoalID),
            goalDBUID: newDBUID,
            data: goalObj.getFormattedGoalObject()
        }
        setGoalData({
            type: GOAL_ACTIONS.ADD_SUBGOAL,
            payload: rawData
        })

        handlerFunctions.handleCreateSubGoal(dbPayload)
    }

    const handleEditGoal = (id, changes) => {
        console.log('edit')
        let rawData = { ...goalData.rawData }
        var changesObj = changes.getFormattedGoalObject()
        console.log(rawData)
        if (goalFunctions.isMainGoal(id)) {

            rawData[goalFunctions.goalDBUID(id)].mainGoal = changesObj.mainGoal
            console.log(changesObj)
            var dbPayload = {
                isMainGoal: true,
                goalDBUID: goalFunctions.goalDBUID(id),
                data: changesObj.mainGoal
            }
        } else {
            console.log(id)
            console.log(changesObj)

            rawData[goalFunctions.subGoalParent(id)].subGoals[goalFunctions.goalDBUID(id)] = changesObj

            var dbPayload = {
                isMainGoal: false,
                parentGoal: goalFunctions.subGoalParent(id),
                goalDBUID: goalFunctions.goalDBUID(id),
                data: changesObj
            }

        }

        setGoalData({
            type: GOAL_ACTIONS.UPDATE_GOAL,
            payload: rawData
        })
        handlerFunctions.handleEditGoal(dbPayload)
    }

    const handleCompleteGoal = (id, currProgress) => {
        var rawData = { ...goalData.rawData }
        // If the goal selected is a sub goal. Progress of main goal must be assessed as well.
        // For each of the main goals find the correct parent goal, then check if all sub goals are completed. 
        // If all subgoals are completed check the main goal as completed as well, else main goal remains incomplete.

        var dbPayload = {}

        if (!goalFunctions.isMainGoal(id)) {

            dbPayload.mainGoalDBUID = goalFunctions.subGoalParent(id)

            rawData[goalFunctions.subGoalParent(id)].subGoals[goalFunctions.goalDBUID(id)].completed = !currProgress

            var subGoalsCompleted = true

            Object.values(rawData[goalFunctions.subGoalParent(id)].subGoals).forEach(subGoal => {
                if (subGoal.completed === false) {
                    subGoalsCompleted = false
                }
            })

            if (rawData[goalFunctions.subGoalParent(id)].mainGoal.completed !== subGoalsCompleted) {
                rawData[goalFunctions.subGoalParent(id)].mainGoal.completed = subGoalsCompleted


                dbPayload.mainGoal = {
                    completed: subGoalsCompleted
                }
            }


            dbPayload.subGoal = {
                dbUID: goalFunctions.goalDBUID(id),
                completed: !currProgress
            }

        } else {

            rawData[goalFunctions.goalDBUID(id)].mainGoal.completed = !currProgress
            dbPayload.mainGoalDBUID = goalFunctions.goalDBUID(id)
            dbPayload.mainGoal = {
                completed: !currProgress
            }
        }

        setGoalData({
            type: GOAL_ACTIONS.COMPLETE_GOAL,
            payload: rawData
        })
        handlerFunctions.handleCompleteGoal(dbPayload)

    }

    const handleAddMainGoal = (goalObj) => {
        const mainGoalDBUID = 'Goal_' + (goalObj.uid + 1).toString()
        const goalPayload = goalObj.getFormattedGoalObject()

        let rawData = { ...goalData.rawData }
        rawData[mainGoalDBUID] = goalPayload

        setGoalData({
            type: GOAL_ACTIONS.ADD_MAINGOAL,
            payload: {
                data: rawData,
                newMainGoalUID: goalObj.uid + 1
            }
        })

        handlerFunctions.handleCreateMainGoal(mainGoalDBUID, goalPayload)

    }

    const handleDeleteGoal = (id) => {
        let rawData = { ...goalData.rawData }

        var dbPayload = {}

        if (goalFunctions.isMainGoal(id)) {
            dbPayload.isMainGoal = true
            dbPayload.goalDBUID = goalFunctions.goalDBUID(id)
            delete rawData[goalFunctions.goalDBUID(id)]
        } else {
            dbPayload.isMainGoal = false
            dbPayload.parentGoal = goalFunctions.subGoalParent(id)
            dbPayload.goalDBUID = goalFunctions.goalDBUID(id)
            const mainGoal = goalFunctions.subGoalParent(id)
            if (Object.keys(rawData[mainGoal].subGoals).length === 1) {
                delete rawData[mainGoal].subGoals
            } else {
                delete rawData[mainGoal].subGoals[goalFunctions.goalDBUID(id)]
            }

        }
        setGoalData({
            type: GOAL_ACTIONS.DELETE_GOAL,
            payload: rawData
        })

        handlerFunctions.handleDeleteGoal(dbPayload)

    }

    const generateNewMainGoalUID = (rawGoalData) => {
        var index = 1
        while (Object.keys(rawGoalData).includes('Goal_' + index.toString())) {
            index++
        }

        return index - 1
    }

    const handleCopyPrevWeeksExData = (weekData, insertionDay) => {
        var insertData = {}
        var frontEndData = {}
        // If insertionDay is not undefined then copy just the specific day. Else copy the entire week. 
        if (insertionDay) {
            if (insertionDay < convertTotalDaysToUIDay(programData.currentDay)) {
                setInsertionDayError(true)
                return
            } else {

                insertData[convertUIDayToTotalDays(insertionDay, programData.currentDay)] = {}
                frontEndData[convertUIDayToTotalDays(insertionDay, programData.currentDay)] = {}
                Object.keys(weekData).forEach(exercise => {
                    var reverseExComp = exercise.split("_").reverse()
                    reverseExComp[2] = currentWeekInProgram(programData.currentDay)

                    reverseExComp[1] = convertUIDayToTotalDays(convertTotalDaysToUIDay(insertionDay), programData.currentDay)


                    var newExID = reverseExComp.reverse().join("_")

                    var dbObject = { ...weekData[exercise] }
                    delete dbObject.deleteButton
                    delete dbObject.uid


                    insertData[convertUIDayToTotalDays(insertionDay, programData.currentDay)][newExID] = dbObject
                    frontEndData[convertUIDayToTotalDays(insertionDay, programData.currentDay)][newExID] = weekData[exercise]
                })
            }
        } else {
            if (convertTotalDaysToUIDay(programData.currentDay) > 1) {
                setInsertionDayError(true)
                return
            } else {

                Object.keys(weekData).forEach(day => {
                    insertData[convertUIDayToTotalDays(day, programData.currentDay)] = {}
                    frontEndData[convertUIDayToTotalDays(day, programData.currentDay)] = {}

                    Object.keys(weekData[day]).forEach(exercise => {
                        var reverseExComp = exercise.split("_").reverse()
                        reverseExComp[2] = currentWeekInProgram(programData.currentDay)

                        var currExDay = reverseExComp[1]

                        reverseExComp[1] = convertUIDayToTotalDays(convertTotalDaysToUIDay(currExDay), programData.currentDay)

                        var newExID = reverseExComp.reverse().join("_")

                        var dbObject = { ...weekData[day][exercise] }
                        console.log(Object.keys(dbObject))
                        delete dbObject.deleteButton
                        delete dbObject.uid

                        insertData[convertUIDayToTotalDays(day, programData.currentDay)][newExID] = dbObject
                        frontEndData[convertUIDayToTotalDays(day, programData.currentDay)][newExID] = weekData[day][exercise]

                    })
                })
            }
        }

        let newProgData = { ...programData }

        let newRawData = newProgData.rawData

        Object.keys(frontEndData).forEach(day => {
            newRawData[day] = frontEndData[day]
        })

        let newExerciseListPerDay = updatedDailyExerciseList(newRawData, handleDeleteExerciseButton, handleUpdateExercise)

        setProgramData({
            type: PROGRAM_ACTIONS.COPY_EXERCISE_DATA,
            payload: {
                rawData: newRawData,
                exerciseListPerDay: newExerciseListPerDay
            }
        })

        console.log(insertData)

        handlerFunctions.handleCopyPrevWeekExData(insertData)
    }

    const initialiseGoalData = (rawProgramData) => {
        console.log(rawProgramData)
        if (rawProgramData.goals) {

            return {
                rawData: rawProgramData.goals,
                newMainGoalUID: generateNewMainGoalUID(rawProgramData.goals),
                tableData: generateGoalTableData(
                    rawProgramData.goals,
                    handleCreateSubGoal,
                    handleEditGoal,
                    handleCompleteGoal,
                    handleDeleteGoal
                ),
                expandedRows: {}
            }
        } else {
            return {
                tableData: [],
                expandedRows: {}
            }
        }
    }

    const initialiseSafeLoadData = (rawProgramData) => {
        console.log(rawProgramData)
        return {
            tableData: generateCurrDaySafeLoadData(
                rawProgramData,
                anatomyData
            )
        }
    }

    const anatomyData = rawAnatomyData
    const [exerciseData, setExerciseData] = useState(() => initialiseAvailableExerciseData(data, availExData))
    const [overviewData, setOverviewData] = useState(() => initialiseOverviewData(data))

    const [goalData, setGoalData] = useReducer(goalDataReducer, data, initialiseGoalData)

    const [progressionData, setProgressionData] = useReducer(progressionDataReducer, data, initialiseProgressionData)

    const [programData, setProgramData] = useReducer(programDataReducer, data, initialiseProgramData)

    const [safeLoadData, setSafeLoadData] = useReducer(safeLoadDataReducer, data, initialiseSafeLoadData)

    // Use Effects to monitor the loading state of the program page.

    useEffect(() => {
        if (programLoaded && exercisesLoaded) {
            let newProgramData = { ...programData }
            const currDay = newProgramData.currentDay

            setProgramData({
                type: PROGRAM_ACTIONS.UPDATE_ON_WEEK_CHANGE,
                payload: {
                    daysInWeekScope: generateDaysInWeekScope(currDay),
                    currButtonView: initCurrButtonView(
                        true,
                        false,
                        currDay,
                        isDevelopmentMode
                    ),
                    exerciseListPerDay: updatedDailyExerciseList(newProgramData.rawData, handleDeleteExerciseButton, handleUpdateExercise),
                    prevWeekExData: generatePrevWeeksData(newProgramData.rawData)
                }
            })
        }
    }, [programData.currentDay])

    const programDataRef = useRef();

    useEffect(() => {
        if (overviewData) {
            setOverviewLoaded(true)
        }
    }, [overviewData])

    useEffect(() => {
        if (submitProcessingBackend) {
            setSubmitDailyExDataProcessing(true)
        } else {
            if (!firstRender) {
                setProgramData({
                    type: PROGRAM_ACTIONS.CHANGE_CURRENT_EXERCISE_LIST,
                    payload: {
                        rawData: data,
                        exerciseListPerDay: updatedDailyExerciseList(data, handleDeleteExerciseButton, handleUpdateExercise)
                    }
                })

                setProgressionData({
                    type: PROGRESSION_ACTIONS.UPDATE_GRAPH_DATA,
                    payload: {
                        rawProgramData: data,
                        anatomyData: anatomyData
                    }
                })

                setSubmitDailyExDataProcessing(false)
            }
        }
    }, [submitProcessingBackend])

    useEffect(() => {
        if (exerciseData) {
            setExercisesLoaded(true)

        }
    }, [exerciseData])

    useEffect(() => {
        if (programData) {
            programDataRef.current = programData

            if (!isDevelopmentMode) {
                setSafeLoadData({
                    type: SAFE_LOAD_ACTIONS.REFRESH,
                    payload: programData.rawData
                })
            }
            if (!programLoaded) {
                setProgramLoaded(true)
            }
        }
    }, [programData])

    useEffect(() => {
        if (goalData) {
            setGoalLoaded(true)
        }
    }, [goalData])

    useEffect(() => {
        if (overviewLoaded && programLoaded && progressionLoaded && exercisesLoaded && goalLoaded) {
            setLoading(false)
            setFirstRender(false)
        }
    }, [overviewLoaded, programLoaded, progressionLoaded, exercisesLoaded])


    // HTML that will actually be rendered
    let loadingHTML =
        <div className='vert-aligned'>
            <Loader active inline='centered' content='Preparing Program Space...' />
        </div>

    let navHTML =
        <div className='centred-info'>
            <ProgramViewNavButtons
                userType={userType}
                currentView={pageView}
                clickHandler={(newView) => { setPageView(newView) }}
            />
        </div>

    let overviewHTML =
        <div className='centred-info'>
            <CoachProgramViewOverviewTable
                data={overviewData.data}
                columns={overviewData.columns}
            />
        </div>

    let programHTML =
        <>
            <ConfirmNullExerciseData
                showModal={nullExerciseData.hasNullData}
                handleFormProceed={handlerFunctions.handleNullCheckProceed}
                nullExTableData={nullExerciseData.nullTableData}
                scheme={programData.loadingScheme}
            />
            {
                insertionDayError &&
                <ErrorBanner clickHandler={() => { setInsertionDayError(false) }}>
                    <p>
                        Your request cannot be completed. You tried to insert an exercise into a day you've already completed.
                    </p>
                </ErrorBanner>
            }
            {
                programData.startDayUTS || isDevelopmentMode ?
                    <>
                        <div className='rowContainer centred-info sml-margin-top'>
                            {
                                programData.currButtonView.submitDay ?
                                    <SubmitDayModal
                                        handleFormSubmit={handleSubmitButton}
                                        submitDataProcessing={submitDailyExDataProcessing}
                                    />
                                    :
                                    (programData.currButtonView.prevWeek) ?
                                        <div>
                                            <Button
                                                onClick={() => { handleChangeWeekView(false) }}
                                                className='purpleButton'
                                            >
                                                Previous Week
                                </Button>
                                            <Button
                                                className='purpleButton'
                                                onClick={() => { handleChangeWeekView(true) }}
                                            >
                                                Next Week
                                </Button>
                                        </div>
                                        :
                                        <Button
                                            className='purpleButton'
                                            onClick={() => { handleChangeWeekView(true) }}
                                        >
                                            Next Week
                            </Button>
                            }
                        </div>
                        {
                            !isDevelopmentMode &&
                            <div className='rowContainer'>
                                <div className='pageContainerLevel1 half-width'>
                                    <div >
                                        <div className='graphTitle'>
                                            Goals
                                    </div>
                                        <div onClick={() => setGoalTableVisible(!goalTableVisible)}>
                                            {
                                                goalTableVisible &&
                                                <Icon name='toggle on' style={{ fontSize: '20px' }} />
                                            }
                                            {
                                                !goalTableVisible &&
                                                <Icon name='toggle off' style={{ fontSize: '20px' }} />
                                            }
                                        </div>
                                    </div>
                                    {
                                        goalTableVisible &&
                                        <div>
                                            <GoalsTable
                                                data={goalData.tableData}
                                                expandedRowsHandler={handleGoalTableExpRowUpdate}
                                                expandedRows={goalData.expandedRows}
                                            />
                                            <div className='goalsPromptBtnContainer'>
                                                <AddGoalsForm
                                                    buttonText='Create More Goals'
                                                    headerText='Create More Goals'
                                                    handleFormSubmit={handleAddMainGoal}
                                                    newMainGoalUID={goalData.newMainGoalUID}
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
                                </div>
                                <div className='pageContainerLevel1 half-width'>
                                    <div >
                                        <div className='graphTitle'>
                                            Predicted Safe Loads
                                    </div>
                                        <div onClick={() => setSafeLoadTableVisible(!safeLoadTableVisible)}>
                                            {
                                                safeLoadTableVisible &&
                                                <Icon name='toggle on' style={{ fontSize: '20px' }} />
                                            }
                                            {
                                                !safeLoadTableVisible &&
                                                <Icon name='toggle off' style={{ fontSize: '20px' }} />
                                            }
                                        </div>
                                    </div>
                                    {
                                        safeLoadTableVisible &&
                                        <LoadingSpreadStatsTable data={safeLoadData.tableData} />
                                    }
                                </div>
                            </div>
                        }
                        <div className='rowContainer'>
                            <div className='pageContainerLevel1 half-width'>
                                <ProgramHistToggle
                                    currentView={exTableView}
                                    clickHandler={setExTableView}
                                />
                                {

                                    exTableView === 'available' ?
                                        <AvailableExercisesList
                                            columns={availExColumns}
                                            data={exerciseData.chartData}
                                        />
                                        :
                                        <ViewPrevWeeksData
                                            data={programData.prevWeekExData}
                                            defaultWeek={currentWeekInProgram(programData.currentDay) - 1}
                                            progScheme={programData.loadingScheme}
                                            handleFormSubmit={handleCopyPrevWeeksExData}
                                        />
                                }
                            </div>
                            <div className='pageContainerLevel1 half-width'>
                                <CurrentWeekExercisesContainer
                                    dailyExercises={programData.exerciseListPerDay}
                                    loadingScheme={programData.loadingScheme}
                                    daysViewHandler={handleChangeDaysOpenView}
                                    daysInWeekScope={programData.daysInWeekScope}
                                    openDaysUI={programData.openDaysUI}
                                />
                            </div>
                        </div>
                    </>
                    :
                    <StartProgramView
                        handleFormProceed={handleStartProgram}
                    />
            }
        </>

    let progressionHTML =
        <>
            {
                !progressionData &&
                <div className='centred-info'>
                    <div className='paragraphDiv'>
                        Progression data is unable to be calculated because this program has not yet been started.
                    </div>
                </div>
            }
            {
                progressionData &&
                <div className='pageContainerLevel1' id='pdBodyContainer1'>
                    <div className='pageContainerLevel2' id='pdSideBarContainer'>
                        <BodyPartListGroup
                            activeMuscle={progressionData.currentBodyPart}
                            muscleGroups={anatomyData}
                            changeMuscleHandler={handleSelectBodyPart}
                            activeMuscleGroup={progressionData.currMuscleGroupOpen}
                            openMuscleGroupHandler={handleOpenMuscleGroup}
                        />
                    </div>

                    <div className='pageContainerLevel2' id='pdGraphContainer'>
                        <div id='rollChronicGraphContainer'>
                            <InputLabel
                                custID='rollChronicGraphLabel'
                                text='Rolling Safe Loading Threshold &nbsp;'
                                toolTip={<Popup
                                    basic
                                    trigger={<Icon name='question circle outline' />}
                                    content='Historical representation of your actual loading with upper and lower safe training thresholds based on ACWR.'
                                    position='right center'
                                />}
                            />
                            <RollChronicACWRGraph
                                graphData={progressionData.rollingAverageGraphProps.totalData[progressionData.currentBodyPart]}
                                graphSeries={progressionData.rollingAverageGraphProps.series}
                            />
                        </div>
                        <div id='ACWRGraphContainer'>
                            <InputLabel
                                custID='ACWRGraphLabel'
                                text='Rolling Acute Chronic Workload Ratio & Subcomponents &nbsp;'
                                toolTip={<Popup
                                    basic
                                    trigger={<Icon name='question circle outline' />}
                                    content='Historical representation of your Acute Load, Chronic Load and ACWR.'
                                    position='bottom center'
                                />}
                            />
                            <ACWEGraph ACWRData={progressionData.ACWRGraphProps[progressionData.currentBodyPart]} />
                        </div>
                    </div>

                </div>
            }
        </>




    return (
        <>
            {loading && loadingHTML}
            {!loading && navHTML}
            {!loading && pageView === 'overview' && overviewHTML}
            {!loading && pageView === 'program' && programHTML}
            {!loading && pageView === 'progression' && progressionHTML}
        </>
    )
}

const ProgramViewPageSubHeader = ({ data, programUID }) => {

    return (
        <>
            <div className='pageSubHeader2'>
                Current Program: {capitaliseFirstLetter(programUID.split('_')[0])}
            </div>
            <div className='pageSubHeader2'>
                Week {currentWeekInProgram(data.currentDay)}, Day {convertTotalDaysToUIDay(data.currentDay)}
            </div>
        </>
    )
}

const CoachProgramViewOverviewTable = ({ data, columns }) => {
    return (
        <div className='half-width pageContainerLevel1'>
            <div className='pageSubHeader1 med-margin-bottom'>
                Program overview
            </div>
            <div>
                <BasicTable
                    data={data}
                    columns={columns}
                    header={false}
                />
            </div>
        </div>
    )
}

const ProgramViewNavButtons = ({ currentView, clickHandler, userType }) => {
    return (
        <Button.Group size='tiny'>
            {
                currentView === 'overview' ?
                    <Button
                        className='smallerBtn'
                        active
                    >
                        Program Overview
                    </Button>
                    :
                    <Button
                        className='smallerBtn'
                        onClick={() => { clickHandler('overview') }}
                    >
                        Program Overview
                    </Button>
            }
            {
                currentView === 'program' ?
                    <Button
                        active
                    >
                        Program
                    </Button>
                    :
                    <Button
                        onClick={() => { clickHandler('program') }}
                    >
                        Program
                    </Button>
            }
            {
                currentView === 'progression' ?
                    <Button
                        active
                    >
                        Progression Data
                    </Button>
                    :
                    <Button
                        onClick={() => { clickHandler('progression') }}
                    >
                        Progression Data
                    </Button>
            }
        </Button.Group>
    )
}


const ProgramHistToggle = ({ currentView, clickHandler }) => {
    return (
        <div className='availExercises-ExData-toggleContainer centred-info'>
            <Button.Group size='tiny'>
                {
                    currentView === 'available' ?
                        <Button
                            className='smallerBtn'
                            active
                        >
                            Available Exercises
                                        </Button>
                        :
                        <Button
                            className='smallerBtn'
                            onClick={() => { { clickHandler('available') } }}
                        >
                            Available Exercises
                    </Button>
                }
                {
                    currentView === 'history' ?
                        <Button

                            active
                        >
                            Program Exercise History
                                        </Button>
                        :
                        <Button
                            onClick={() => { clickHandler('history') }}
                        >
                            Program Exercise History
                    </Button>
                }
            </Button.Group>
        </div>
    )
}


export default ProgramView
export { ProgramViewPageSubHeader }