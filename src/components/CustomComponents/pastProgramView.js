import React, { useState, useEffect } from 'react'

import utsToDateString from '../../constants/utsToDateString'
import { generatePastProgramExerciseData } from '../../constants/viewProgramPagesFunctions'
import { GeneralInfoTable } from '../PastPrograms/generalInfoTable'
import InputLabel from './DarkModeInput'
import loadingSchemeString from '../../constants/loadingSchemeString'
import BodyPartListGroup from './bodyPartListGroup'
import LoadInfoTable from '../PastPrograms/loadInfoTable'
import GoalHistoryModal from '../PastPrograms/goalHistoryModal'
import ExerciseHistoryModal from '../PastPrograms/viewPrevWeeksDataModal'
import { currentWeekInProgram } from '../../constants/dayCalculations'
import FinalProgramNotes from '../PastPrograms/finalProgramNotes'

const PastProgramView = ({ data, processedGoalData, anatomy, notes, handlerFunctions }) => {

    const anatomyObject = anatomy
    const programData = data
    const [currentBodyPart, setCurrentBodyPart] = useState('Overall_Total')
    const [currMuscleGroupOpen, setCurrMuscleGroupOpen] = useState('Arms')

    const getMuscleGroupFromSpecificMuscle = (muscle) => {
        for (var muscleGroup in anatomyObject) {
            if (anatomyObject[muscleGroup].includes(muscle)) {
                return muscleGroup
            }
        }
    }

    const generateLoadInfoTableData = (muscle) => {
        var endDay = overviewData.currentDay

        // If for some reason the per ended the program on Day One Just return empty array.
        if (endDay === 1) return []

        var startChronicLoad = 0

        if (muscle == 'Overall_Total') {
            for (var day = 1; day < endDay; day++) {

                var dayChronicLoad = programData[day]['loadingData']['Total']['chronicEWMA']
                if (startChronicLoad == 0 && dayChronicLoad != 0) {
                    startChronicLoad = dayChronicLoad
                    break
                }
            }

            var endChronicLoad = programData[endDay - 1]['loadingData']['Total']['chronicEWMA']
        } else if (muscle.split('_').length == 2) {
            var muscleGroup = muscle.split('_')[0]

            for (var day = 1; day < endDay; day++) {

                var dayChronicLoad = programData[day]['loadingData'][muscleGroup]['Total']['chronicEWMA']
                if (startChronicLoad == 0 && dayChronicLoad != 0) {
                    startChronicLoad = dayChronicLoad
                    break
                }
            }

            var endChronicLoad = programData[endDay - 1]['loadingData'][muscleGroup]['Total']['chronicEWMA']
        } else {

            var muscleGroup = getMuscleGroupFromSpecificMuscle(muscle)

            for (var day = 1; day < endDay; day++) {

                var dayChronicLoad = programData[day]['loadingData'][muscleGroup][muscle]['chronicEWMA']
                if (startChronicLoad == 0 && dayChronicLoad != 0) {
                    startChronicLoad = dayChronicLoad
                    break
                }
            }

            var endChronicLoad = programData[endDay - 1]['loadingData'][muscleGroup][muscle]['chronicEWMA']
        }


        return [
            {
                col1: 'Initial Chronic Load',
                col2: startChronicLoad.toFixed(2)
            },
            {
                col1: 'Final Chronic Load',
                col2: endChronicLoad.toFixed(2)
            },
            {
                col1: 'Net Increase',
                col2: ((endChronicLoad - startChronicLoad).toFixed(2)).toString()
            },
            {
                col1: 'Percentage Increase',
                col2:
                    (startChronicLoad == 0) ? '0.00' :
                        (((endChronicLoad - startChronicLoad)
                            / startChronicLoad * 100))
                            .toFixed(2).toString()
                        +
                        '%'
            },
            {
                col1: 'Average Increase Per Week',
                col2:
                    ((endChronicLoad - startChronicLoad) / (endDay - 1) * 7).toFixed(2).toString()
            }
        ]
    }

    const handleNotesUpdate = (value) => {
        handlerFunctions.handlePastProgramNotesUpdate(value)
    }


    const generateGeneralStatsTableData = (rawData) => {

        let duration = Math.ceil((rawData.currentDay - 1) / 7)

        var returnData = [
            {
                col1: 'Time Period',
                col2: utsToDateString(rawData.startDayUTS) + ' - ' + utsToDateString(rawData.endDayUTS)
            },
            {
                col1: 'Program Duration',
                col2: duration + ((duration == 1) ? ' Week' : ' Weeks')

            },
            {
                col1: 'Loading Scheme',
                col2: loadingSchemeString(rawData.loadingScheme)
            }
        ]

        return returnData
    }

    const initOverviewData = (rawData) => {
        return ({
            programDuration: Math.ceil((rawData.currentDay - 1) / 7),
            loadingScheme: rawData.loadingScheme,
            startDate: utsToDateString(rawData.startDayUTS),
            endDate: utsToDateString(rawData.endDayUTS),
            currentDay: rawData.currentDay,
            generalStatsData: generateGeneralStatsTableData(rawData),
            currentWeek: currentWeekInProgram(rawData.currentDay)

        })
    }

    const [overviewData, setOverviewData] = useState(initOverviewData(data))

    const initGoalData = (rawGoalData) => {
        console.log(rawGoalData)
        return ({
            goalTableData: rawGoalData.tableData,
            goalStatsData: rawGoalData.statsData,
            goalProgPieChartData: rawGoalData.pieChartData
        })
    }

    const initLoadData = (rawData) => {
        return {
            prevWeekData: generatePastProgramExerciseData(rawData),
            loadInfoData: generateLoadInfoTableData(currentBodyPart)
        }
    }

    const [loadData, setLoadData] = useState(initLoadData(data))

    const [goalData, setGoalData] = useState(initGoalData(processedGoalData))

    useEffect(() => {
        setLoadData(prev => ({
            ...prev,
            loadInfoData: generateLoadInfoTableData(currentBodyPart)
        }))
    }, [currentBodyPart])

    return (
        <>
            <div className='rowContainer'>
                <div className='pageContainerLevel1 half-width' id='ppPageGeneralStatsTable'>
                    <div className='centeredPageContainerLabel'>
                        <InputLabel
                            text='General Information'
                            custID='ppGenInfoTableLabel'
                        />
                    </div>
                    <GeneralInfoTable data={overviewData.generalStatsData} />
                </div>
                <div className='pageContainerLevel1 half-width' id='ppPageLoadingStatsTable'>
                    <div className='rowContainer'>
                        <div id='ppPageBodyPartListContainer'>
                            <BodyPartListGroup
                                activeMuscle={currentBodyPart}
                                muscleGroups={anatomyObject}
                                changeMuscleHandler={setCurrentBodyPart}
                                activeMuscleGroup={currMuscleGroupOpen}
                                openMuscleGroupHandler={setCurrMuscleGroupOpen}
                            />
                        </div>
                        <div id='ppPageLoadInfoContainer'>
                            {
                                (loadData.loadInfoData.length == 0) ?
                                    <div id='ppNoLoadInfoString'>
                                        No Load Information Was Found
                                        </div>
                                    :
                                    <div>
                                        <div className='centeredPageContainerLabel'>
                                            <InputLabel
                                                text='Key Load Information'
                                                custID='ppLoadInfoTableLabel'
                                            />
                                        </div>
                                        <LoadInfoTable data={loadData.loadInfoData} />
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className='rowContainer'>
                <div className='pageContainerLevel1 half-width' id='ppPageExHistTable'>
                    <div className='centeredPageContainerLabel'>
                        <InputLabel
                            text='Historical Data'
                            custID='ppExHistoryLabel'
                        />
                    </div>
                    <div id='ppPageExGoalHistBtnContainer' className='rowContainer'>
                        <div className='half-width centred-info'>
                            <GoalHistoryModal
                                goalTableData={goalData.goalTableData}
                                goalStatsData={goalData.goalStatsData}
                                goalProgPieChartData={goalData.goalProgPieChartData}
                            />
                        </div>
                        <div className='half-width centred-info'>
                            < ExerciseHistoryModal
                                data={loadData.prevWeekData}
                                defaultWeek={overviewData.currentWeek}
                                progScheme={overviewData.loadingScheme}
                            />
                        </div>
                    </div>
                </div>
                <div className='pageContainerLevel1 half-width' id='ppPageGeneralStatsTable'>
                    <div className='centeredPageContainerLabel'>
                        <InputLabel
                            text='Program Notes'
                            custID='ppProgNotesLabel'
                        />
                    </div>
                    <FinalProgramNotes
                        initialText={notes}
                        submitHandler={handleNotesUpdate}
                    />


                </div>
            </div>
        </>
    )
}

export default PastProgramView