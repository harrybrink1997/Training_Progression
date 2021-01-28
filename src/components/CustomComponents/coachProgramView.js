import React, { useEffect, useState } from 'react'
import { Loader, Button } from 'semantic-ui-react'
import { capitaliseFirstLetter } from '../../constants/stringManipulation'
import BasicTable from '../CustomComponents/basicTable'
import CurrentWeekExercisesContainer from '../CurrentProgram/currentWeekExercisesContainer'
import AvailableExercisesList from '../CurrentProgram/availableExercisesList'
import { generateDaysInWeekScope, updatedDailyExerciseList, setAvailExerciseChartData, formatExerciseObjectForLocalInsertion, generateExerciseUID } from '../../constants/viewProgramPagesFunctions'
import { convertTotalDaysToUIDay, convertUIDayToTotalDays, currentWeekInProgram } from '../../constants/dayCalculations'


const CoachProgramView = ({ data, name, handlerFunctions, combinedAvailExerciseList, availExerciseColumns }) => {

    // Loading variables.
    const [loading, setLoading] = useState(true)
    const [overviewLoaded, setOverviewLoaded] = useState(false)
    const [programLoaded, setProgramLoaded] = useState(false)
    const [progressionLoaded, setProgressionLoaded] = useState(true)

    const [pageView, setPageView] = useState('overview')

    const handleChangeDaysOpenView = (day) => {
        var newArray = programData.openDaysUI
        newArray[day] = !newArray[day]

        let newProgramData = { ...programData }
        newProgramData.openDaysUI = newArray

        setProgramData(newProgramData)
    }

    const handleAddExerciseButton = (exerciseObject) => {

        console.log(exerciseObject)
        var exUID = generateExerciseUID(
            exerciseObject,
            programData.exerciseListPerDay,
            programData.currentDayInProgram
        )

        var insertionDay = exUID.split('_').reverse()[1]

        var frontEndRenderObj = formatExerciseObjectForLocalInsertion(
            exerciseObject,
            exUID,
            programData.loadingScheme,
            programData.currentDayInProgram,
            handleUpdateExercise,
            handleDeleteExerciseButton
        )


        let newProgramData = { ...programData }

        var newArray = [...newProgramData.exerciseListPerDay[insertionDay]]

        newArray.push(frontEndRenderObj)
        newProgramData.exerciseListPerDay[insertionDay] = newArray

        setProgramData(newProgramData)

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

        let newProgramData = { ...programData }

        var newArray = newProgramData.exerciseListPerDay[day].filter((value) => {
            console.log(value)
            return (value.uid !== exUid)
        })
        newProgramData.exerciseListPerDay[day] = newArray
        setProgramData(newProgramData)

        handlerFunctions.handleDeleteExerciseButton(id)
    }

    const handleUpdateExercise = (updateObject) => {

        var day = updateObject.exUid.split('_').reverse()[1]

        let newProgramData = { ...programData }

        var newArray = [...newProgramData.exerciseListPerDay[day]]

        newArray.forEach(ex => {
            if (ex.uid === updateObject.exUid) {
                ex.reps = updateObject.reps
                ex.time = updateObject.time
                ex.sets = updateObject.sets
                ex.rpe = updateObject.rpe

                if (updateObject.loadingScheme === 'weight-reps') {
                    ex.weight = updateObject.weight

                }
            }
        })

        newProgramData.exerciseListPerDay[day] = newArray
        setProgramData(newProgramData)

        handlerFunctions.handleUpdateExercise(updateObject)
    }

    const initialiseProgramData = (programData) => {
        var payLoad = {
            exerciseListPerDay: updatedDailyExerciseList(programData, handleDeleteExerciseButton, handleUpdateExercise),
            loadingScheme: programData.loading_scheme,
            daysInWeekScope: generateDaysInWeekScope(programData.currentDayInProgram),
            currentDayInProgram: programData.currentDayInProgram,
            currentDayUI: programData.currentDayInProgram,
            openDaysUI: [false, false, false, false, false, false, false]
        }

        return payLoad
    }

    const initialiseOverviewData = (programData) => {
        var payLoad = {
            data: [],
            columns: [{ accessor: 'parameter' }, { accessor: 'value' }]
        }

        payLoad.data.push({
            parameter: 'Day In Program',
            value: programData.currentDayInProgram
        })
        payLoad.data.push({
            parameter: 'Acute Timeframe',
            value: programData.acutePeriod
        })
        payLoad.data.push({
            parameter: 'Chronic Timeframe',
            value: programData.chronicPeriod
        })
        payLoad.data.push({
            parameter: 'Program Type',
            value: programData.order ? 'Sequential' : 'Unlimited'
        })

        if (programData.order) {
            payLoad.data.push({
                parameter: 'Sequence Name',
                value: programData.order.split('_')[1]
            })
            payLoad.data.push({
                parameter: 'Order In Sequence',
                value: programData.order.split('_')[0]
            })
            payLoad.data.push({
                parameter: 'Currently Active In Sequence',
                value: programData.isActiveInSequence ? 'Yes' : 'No'
            })
        }

        return payLoad
    }

    const initialiseAvailableExerciseData = (programData, exerciseData) => {
        console.log(exerciseData)

        return setAvailExerciseChartData(
            exerciseData,
            programData.currentDayInProgram,
            programData.loadingScheme,
            programData.currentDayInProgram,
            handleAddExerciseButton
        )

    }

    const [exerciseData, setExerciseData] = useState(() => initialiseAvailableExerciseData(data, combinedAvailExerciseList))
    const [overviewData, setOverviewData] = useState(() => initialiseOverviewData(data))
    const [programData, setProgramData] = useState(() => initialiseProgramData(data))



    // Use Effects to monitor the loading state of the program page.
    useEffect(() => {
        if (overviewData) {
            setOverviewLoaded(true)
        }
    }, [overviewData])

    useEffect(() => {
        if (programData) {
            if (!programLoaded) {
                setProgramLoaded(true)
            }
        }
    }, [programData])

    useEffect(() => {
        if (overviewLoaded && programLoaded && progressionLoaded) {
            setLoading(false)
        }
    }, [overviewLoaded, programLoaded, progressionLoaded])


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
        <div className='rowContainer'>
            <div className='pageContainerLevel1 half-width'>
                <AvailableExercisesList
                    columns={availExerciseColumns}
                    data={exerciseData}
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

    let progressionHTML =
        <div className='centred-info'>
            progression tab
        </div>




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

export default CoachProgramView
export { CoachProgramViewPageSubHeader }