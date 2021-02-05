import React, { useEffect, useState, useReducer, useRef } from 'react'
import { Loader, Button, Icon, Popup } from 'semantic-ui-react'
import { capitaliseFirstLetter } from '../../constants/stringManipulation'
import BasicTable from '../CustomComponents/basicTable'
import CurrentWeekExercisesContainer from '../CurrentProgram/currentWeekExercisesContainer'
import AvailableExercisesList from '../CurrentProgram/availableExercisesList'
import { convertTotalDaysToUIDay, convertUIDayToTotalDays, currentWeekInProgram } from '../../constants/dayCalculations'
import SubmitDayModal from '../CurrentProgram/submitDayModal'
import ConfirmNullExerciseData from '../CurrentProgram/confirmNullExerciseData'
import ViewPrevWeeksData from '../CurrentProgram/viewPrevWeeksData'
import BodyPartListGroup from '../CustomComponents/bodyPartListGroup'
import InputLabel from '../CustomComponents/DarkModeInput'
import { ACWEGraph, RollChronicACWRGraph } from '../ProgressionData/ACWRGraph'
import { generateDaysInWeekScope, updatedDailyExerciseList, setAvailExerciseChartData, formatExerciseObjectForLocalInsertion, generateExerciseUID, generateACWRGraphData, generateSafeLoadGraphProps } from '../../constants/viewProgramPagesFunctions'


const CoachProgramView = ({ data, name, handlerFunctions, combinedAvailExerciseList, availExerciseColumns, nullExerciseData, submitProcessingBackend, rawAnatomyData }) => {

    // Loading variables.
    const [firstRender, setFirstRender] = useState(true)
    const [loading, setLoading] = useState(true)
    const [overviewLoaded, setOverviewLoaded] = useState(false)
    const [programLoaded, setProgramLoaded] = useState(false)
    const [exercisesLoaded, setExercisesLoaded] = useState(false)
    const [submitDailyExDataProcessing, setSubmitDailyExDataProcessing] = useState(false)


    const [progressionLoaded, setProgressionLoaded] = useState(true)

    const [pageView, setPageView] = useState('overview')
    // const [currExerciseView, setCurrExerciseView] = useState('availExercises')

    const handleChangeDaysOpenView = (day) => {
        var currProgramDataObj = programDataRef.current

        let newProgramData = { ...currProgramDataObj }

        var newArray = newProgramData.openDaysUI

        newArray[day] = !newArray[day]

        setProgramData({
            type: PROGRAM_ACTIONS.CHANGE_DAYS_OPEN_VIEW,
            payLoad: newArray
        })
    }

    const handleAddExerciseButton = (exerciseObject) => {
        var currProgramDataObj = programDataRef.current

        var exUID = generateExerciseUID(
            exerciseObject,
            currProgramDataObj.exerciseListPerDay,
            currProgramDataObj.currentDayInProgram
        )

        var insertionDay = exUID.split('_').reverse()[1]

        var frontEndRenderObj = formatExerciseObjectForLocalInsertion(
            exerciseObject,
            exUID,
            currProgramDataObj.loadingScheme,
            currProgramDataObj.currentDayInProgram,
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

        console.log(exUID)
        console.log(insertionDay)


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
            payLoad: {
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
            payLoad: {
                rawData: newRawData,
                exerciseListPerDay: updatedDailyExerciseList(newRawData, handleDeleteExerciseButton, handleUpdateExercise)
            }
        })

        handlerFunctions.handleDeleteExerciseButton(id)
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

        if (updateObject.loadingScheme === 'weight-reps') {
            newRawData[day][updateObject.exUid].weight = updateObject.weight
        }

        setProgramData({
            type: PROGRAM_ACTIONS.CHANGE_CURRENT_EXERCISE_LIST,
            payLoad: {
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
        var currDay = programDataCopy.currentDayInProgram

        if (nextWeek) {
            var newDay = currDay + 7
        } else {
            newDay = currDay - 7
        }

        rawDataCopy.currentDayInProgram = newDay

        setProgramData({
            type: PROGRAM_ACTIONS.CHANGE_WEEK,
            payLoad: {
                currDay: newDay,
                rawData: rawDataCopy
            }
        })

    }

    const handleSubmitButton = () => {
        handlerFunctions.handleSubmitButton()
    }

    const initialiseProgramData = (rawProgramData) => {
        var payLoad = {
            rawData: rawProgramData,
            exerciseListPerDay: updatedDailyExerciseList(rawProgramData, handleDeleteExerciseButton, handleUpdateExercise),
            loadingScheme: rawProgramData.loading_scheme,
            daysInWeekScope: generateDaysInWeekScope(rawProgramData.currentDayInProgram),
            currentDayInProgram: rawProgramData.currentDayInProgram,
            currentDayUI: rawProgramData.currentDayInProgram,
            openDaysUI: [false, false, false, false, false, false, false],
            currButtonView: initCurrButtonView(rawProgramData.order, rawProgramData.isActiveInSequence, rawProgramData.currentDayInProgram),
        }

        return payLoad
    }



    const handleSelectBodyPart = (value) => {
        setProgressionData({
            type: PROGRESSION_ACTIONS.CHANGE_BODY_PART,
            payLoad: value
        })
    }

    const handleOpenMuscleGroup = (value) => {
        setProgressionData({
            type: PROGRESSION_ACTIONS.CHANGE_OPEN_BODY_GROUP,
            payLoad: value
        })
    }

    const PROGRESSION_ACTIONS = {
        CHANGE_BODY_PART: 'changeBodyPart',
        CHANGE_OPEN_BODY_GROUP: 'changeOpenBodyGroup',
        UPDATE_GRAPH_DATA: 'updateGraphData'
    }

    const progressionDataReducer = (state, action) => {
        console.log(action)
        console.log(state)
        switch (action.type) {
            case PROGRESSION_ACTIONS.CHANGE_BODY_PART:
                return {
                    ...state,
                    currentBodyPart: action.payLoad
                }

            case PROGRESSION_ACTIONS.CHANGE_OPEN_BODY_GROUP:
                return {
                    ...state,
                    currMuscleGroupOpen: action.payLoad
                }

            case PROGRESSION_ACTIONS.UPDATE_GRAPH_DATA:
                return {
                    ...state,
                    ACWRGraphProps: generateACWRGraphData(
                        action.payLoad.rawProgramData,
                        action.payLoad.anatomyData
                    ),
                    rollingAverageGraphProps: generateSafeLoadGraphProps(
                        action.payLoad.rawProgramData,
                        action.payLoad.anatomyData
                    ),
                }

            default:
                return state
        }
    }

    const PROGRAM_ACTIONS = {
        CHANGE_CURRENT_EXERCISE_LIST: 'changeCurrentExerciseList',
        UPDATE_ON_WEEK_CHANGE: 'updateOnWeekChange',
        CHANGE_WEEK: 'changeWeek',
        CHANGE_DAYS_OPEN_VIEW: 'changeDaysOpenView'
    }

    const programDataReducer = (state, action) => {
        switch (action.type) {
            case PROGRAM_ACTIONS.CHANGE_CURRENT_EXERCISE_LIST:
                return {
                    ...state,
                    rawData: action.payLoad.rawData,
                    exerciseListPerDay: action.payLoad.exerciseListPerDay
                }

            case PROGRAM_ACTIONS.UPDATE_ON_WEEK_CHANGE:
                return {
                    ...state,
                    daysInWeekScope: action.payLoad.daysInWeekScope,
                    currButtonView: action.payLoad.currButtonView,
                    exerciseListPerDay: action.payLoad.exerciseListPerDay
                }

            case PROGRAM_ACTIONS.CHANGE_WEEK:
                return {
                    ...state,
                    currentDayInProgram: action.payLoad.currDay,
                    rawData: action.payLoad.rawData
                }

            case PROGRAM_ACTIONS.CHANGE_DAYS_OPEN_VIEW:
                return {
                    ...state,
                    openDaysUI: action.payLoad
                }

            default:
                return state

        }
    }

    const initCurrButtonView = (order, isActiveInSequence, currentDayInProgram) => {
        if (!order || isActiveInSequence) {

            return {
                nextWeek: false,
                prevWeek: false,
                submitDay: true
            }

        } else {

            if (currentDayInProgram > 7) {
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
        var payLoad = {
            data: [],
            columns: [{ accessor: 'parameter' }, { accessor: 'value' }]
        }

        payLoad.data.push({
            parameter: 'Day In Program',
            value: rawProgramData.currentDayInProgram
        })
        payLoad.data.push({
            parameter: 'Acute Timeframe',
            value: rawProgramData.acutePeriod
        })
        payLoad.data.push({
            parameter: 'Chronic Timeframe',
            value: rawProgramData.chronicPeriod
        })
        payLoad.data.push({
            parameter: 'Program Type',
            value: rawProgramData.order ? 'Sequential' : 'Unlimited'
        })

        if (rawProgramData.order) {
            payLoad.data.push({
                parameter: 'Sequence Name',
                value: rawProgramData.order.split('_')[1]
            })
            payLoad.data.push({
                parameter: 'Order In Sequence',
                value: rawProgramData.order.split('_')[0]
            })
            payLoad.data.push({
                parameter: 'Currently Active In Sequence',
                value: rawProgramData.isActiveInSequence ? 'Yes' : 'No'
            })
        }

        return payLoad
    }

    const initialiseAvailableExerciseData = (rawProgramData, exerciseData) => {

        return {
            rawData: exerciseData,
            chartData: setAvailExerciseChartData(
                exerciseData,
                convertTotalDaysToUIDay(rawProgramData.currentDayInProgram),
                rawProgramData.loadingScheme,
                convertTotalDaysToUIDay(rawProgramData.currentDayInProgram),
                handleAddExerciseButton
            )
        }


    }

    const initialiseProgressionData = (rawProgramData) => {
        console.log(rawProgramData)
        if (rawProgramData.order && !rawProgramData.isActiveInSequence) {
            return undefined
        } else {
            return {
                ACWRGraphProps: generateACWRGraphData(rawProgramData, rawAnatomyData),
                rollingAverageGraphProps: generateSafeLoadGraphProps(rawProgramData, rawAnatomyData),
                currentBodyPart: 'Overall_Total',
                currMuscleGroupOpen: 'Arms',

            }
        }
    }
    const anatomyData = rawAnatomyData
    const [exerciseData, setExerciseData] = useState(() => initialiseAvailableExerciseData(data, combinedAvailExerciseList))
    const [overviewData, setOverviewData] = useState(() => initialiseOverviewData(data))

    const [progressionData, setProgressionData] = useReducer(progressionDataReducer, data, initialiseProgressionData)

    const [programData, setProgramData] = useReducer(programDataReducer, data, initialiseProgramData)

    // Use Effects to monitor the loading state of the program page.

    useEffect(() => {
        if (programLoaded && exercisesLoaded) {
            console.log(programData)
            let newProgramData = { ...programData }
            const currDay = newProgramData.currentDayInProgram

            setProgramData({
                type: PROGRAM_ACTIONS.UPDATE_ON_WEEK_CHANGE,
                payLoad: {
                    daysInWeekScope: generateDaysInWeekScope(currDay),
                    currButtonView: initCurrButtonView(
                        true,
                        false,
                        currDay
                    ),
                    exerciseListPerDay: updatedDailyExerciseList(newProgramData.rawData, handleDeleteExerciseButton, handleUpdateExercise)
                }
            })
        }
    }, [programData.currentDayInProgram])

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
            setSubmitDailyExDataProcessing(false)
            if (!firstRender) {
                console.log("udpating progression data")
                console.log(data)
                console.log(programDataRef.current.rawData)
                setProgressionData({
                    type: PROGRESSION_ACTIONS.UPDATE_GRAPH_DATA,
                    payLoad: {
                        rawProgramData: data,
                        anatomyData: anatomyData
                    }
                })
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
            if (!programLoaded) {
                setProgramLoaded(true)
            }
        }
    }, [programData])

    useEffect(() => {
        if (overviewLoaded && programLoaded && progressionLoaded && exercisesLoaded) {
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
            <CoachProgramViewNavButtons
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
            <div className='rowContainer'>
                <div className='pageContainerLevel1 half-width'>
                    {/* <CoachAvailExProgHistToggle
                        currentView={currExerciseView}
                        clickHandler={(newView) => { setCurrExerciseView(newView) }}
                    /> */}
                    <AvailableExercisesList
                        columns={availExerciseColumns}
                        data={exerciseData.chartData}
                    />

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

const CoachProgramViewPageSubHeader = ({ data, name }) => {

    return (
        <>
            <div className='pageSubHeader2'>
                Current Program: {capitaliseFirstLetter(name.split('_')[0])}
            </div>
            <div className='pageSubHeader2'>
                Week {currentWeekInProgram(data.currentDayInProgram)}, Day {convertTotalDaysToUIDay(data.currentDayInProgram)}
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

const CoachProgramViewNavButtons = ({ currentView, clickHandler }) => {
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


const CoachAvailExProgHistToggle = ({ currentView, clickHandler }) => {
    return (
        <div className='availExercises-ExData-toggleContainer centred-info'>
            <Button.Group size='tiny'>
                {
                    currentView === 'availExercises' ?
                        <Button
                            className='smallerBtn'
                            active
                        >
                            Available Exercises
                                        </Button>
                        :
                        <Button
                            className='smallerBtn'
                            onClick={() => { { clickHandler('availExercises') } }}
                        >
                            Available Exercises
                    </Button>
                }
                {
                    currentView === 'progHistory' ?
                        <Button

                            active
                        >
                            Program Exercise History
                                        </Button>
                        :
                        <Button
                            onClick={() => { clickHandler('progHistory') }}
                        >
                            Program Exercise History
                    </Button>
                }
            </Button.Group>
        </div>
    )
}


export default CoachProgramView
export { CoachProgramViewPageSubHeader }