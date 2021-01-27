import React, { useEffect, useState } from 'react'
import { Loader, Button } from 'semantic-ui-react'
import { capitaliseFirstLetter } from '../../constants/stringManipulation'
import BasicTable from '../CustomComponents/basicTable'
import CurrentWeekExercisesContainer from '../CurrentProgram/currentWeekExercisesContainer'
import { generateDaysInWeekScope, updatedDailyExerciseList } from '../../constants/viewProgramPagesFunctions'


const CoachProgramView = ({ data, name, handlerFunctions }) => {

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
            openDaysUI: [false, false, false, false, false, false, false]
        }
        console.log(programData)


        console.log(payLoad)
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

    const overviewData = initialiseOverviewData(data)
    const [programData, setProgramData] = useState(initialiseProgramData(data))



    // Use Effects to monitor the loading state of the program page.
    useEffect(() => {
        if (overviewData) {
            setOverviewLoaded(true)
        }
    }, [overviewData])

    useEffect(() => {
        if (programData) {
            console.log(programData)
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
                exercises
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