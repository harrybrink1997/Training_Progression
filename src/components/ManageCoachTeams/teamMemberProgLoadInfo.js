import React, { useReducer, useState, useEffect } from 'react'

import { Icon, Loader, Popup } from 'semantic-ui-react'
import BodyPartListGroup from '../CustomComponents/bodyPartListGroup'
import InputLabel from '../CustomComponents/DarkModeInput'
import { ACWEGraph, RollChronicACWRGraph } from '../ProgressionData/ACWRGraph'
import { LoadingSchemeExTable } from '../CustomComponents/exerciseTablesNoBtns'
import * as dayFunctions from '../../constants/dayCalculations'

const TeamMemberProgLoadInfo = ({ loadingInfo, anatomyData, specificDayExData, clickDayHandler }) => {

    const PROGRESSION_ACTIONS = {
        CHANGE_BODY_PART: 'changeBodyPart',
        CHANGE_OPEN_BODY_GROUP: 'changeOpenBodyGroup',
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
            default:
                return state
        }
    }

    const [exDayDataLoading, setExDayDataLoading] = useState(false)
    const [currDay, setCurrDay] = useState(undefined)
    const [progressionData, setProgressionData] = useReducer(progressionDataReducer, loadingInfo)
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

    const handleClickDay = (day) => {
        setCurrDay(day)
    }



    useEffect(() => {
        if (currDay) {
            setExDayDataLoading(true)
            // clickDayHandler(currDay)
        }
    }, [currDay])

    useEffect(() => {
        if (exDayDataLoading) {
            clickDayHandler(currDay)
        }
    }, [exDayDataLoading])

    useEffect(() => {
        if (specificDayExData && exDayDataLoading) {
            setExDayDataLoading(false)
        }
    })

    return (
        <>
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
                        <ACWEGraph
                            ACWRData={progressionData.ACWRGraphProps[progressionData.currentBodyPart]}
                            clickHandler={handleClickDay}
                        />
                    </div>
                </div>
            </div>
            {
                specificDayExData && !exDayDataLoading &&
                < div className='pageContainerLevel1 half-width'>
                    <div className='graphTitle'>
                        Exercise Data: Week {dayFunctions.currentWeekInProgram(currDay)} Day {dayFunctions.convertTotalDaysToUIDay(currDay)}
                    </div>
                    <LoadingSchemeExTable
                        scheme={loadingInfo.loadingScheme}
                        data={specificDayExData}
                    />
                </div>
            }
            {
                exDayDataLoading &&
                <div className='pageContainerLevel1 half-width'>
                    <Loader active inline='centered' content='Preparing Team Data...' />
                </div>
            }
        </>
    )
}


export default TeamMemberProgLoadInfo