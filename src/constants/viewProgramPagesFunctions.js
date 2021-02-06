import React from 'react'
import { EditExerciseModalWeightSets, EditExerciseModalRpeTime } from '../components/CurrentProgram/editExerciseModal'
import { DeleteExerciseButton, DeleteGoalButton, CompleteGoalButton } from '../components/CurrentProgram/currentProgramPageButtons'
import { orderUserExercisesBasedOnExUID } from './orderingFunctions'
import { SelectColumnFilter } from '../components/CurrentProgram/filterSearch'
import { AddExerciseModalWeightReps, AddExerciseModalRpeTime } from '../components/CurrentProgram/addExerciseModal'
import { convertUIDayToTotalDays, currentWeekInProgram, convertTotalDaysToUIDay } from './dayCalculations'
import { max } from 'mathjs'
import { render } from '@testing-library/react'


const generateDaysInWeekScope = (currentDayInProgram) => {
    var currWeek = Math.ceil(currentDayInProgram / 7)

    var firstDayOfWeek = 1 + 7 * (currWeek - 1)
    var lastDayOfWeek = firstDayOfWeek + 6

    var programDaysInCurrWeek = []

    for (var day = firstDayOfWeek; day <= lastDayOfWeek; day++) {
        programDaysInCurrWeek.push(day)
    }

    return programDaysInCurrWeek
}

const formatExerciseObjectForLocalInsertion = (exerciseObject, exUID, loadingScheme, currentDayInProgram, handleUpdateExercise, handleDeleteExerciseButton) => {

    var renderObj = exerciseObject
    renderObj.exercise = exerciseObject.name
    delete render.name
    renderObj.uid = exUID
    renderObj.deleteButton =
        (shouldRenderExerciseButtons(
            exUID,
            currentDayInProgram
        )) ? (loadingScheme === 'rpe_time') ?
                <div className='currDayExBtnContainer'>
                    <EditExerciseModalRpeTime submitHandler={handleUpdateExercise} exUid={exUID} currentData={renderObj} />
                    <DeleteExerciseButton buttonHandler={handleDeleteExerciseButton} uid={exUID} />
                </div>
                :
                <div className='currDayExBtnContainer'>
                    <EditExerciseModalWeightSets submitHandler={handleUpdateExercise} exUid={exUID} currentData={renderObj} />
                    <DeleteExerciseButton buttonHandler={handleDeleteExerciseButton} uid={exUID} />
                </div>
            :
            <></>

    return renderObj

}

const generateExerciseUID = (exerciseObject, exerciseListPerDay, currentDayInProgram) => {

    var exerciseName = exerciseObject.name
    var uiDay = exerciseObject.day

    var insertionDay = convertUIDayToTotalDays(uiDay, currentDayInProgram)

    if (exerciseListPerDay[insertionDay].length > 0) {
        var dayExercises = exerciseListPerDay[insertionDay]

        var currMaxID = -1

        dayExercises.forEach(exercise => {

            if (exercise.exercise.split(' ').join('_') === exerciseName) {
                console.log("going in ")
                // First iterate off the letter. 
                if (parseInt(exercise.uid.split('_').slice(-1)[0]) > currMaxID) {
                    currMaxID = exercise.uid.split('_').slice(-1)[0]
                }
            }
        })

        return exerciseName + '_' + currentWeekInProgram(currentDayInProgram) + '_' + insertionDay + '_' + (parseInt(currMaxID) + 1).toString()

    }
    return exerciseName + '_' + currentWeekInProgram(currentDayInProgram) + '_' + insertionDay + '_' + '0'


}


const updatedDailyExerciseList = (programObject, handleDeleteExerciseButton, handleUpdateExercise) => {
    // Introduce a call back to show the current exercises. 
    // Can only be done once the other parameters above have been set. 
    var currWeek = Math.ceil(programObject.currentDayInProgram / 7)

    var firstDayOfWeek = 1 + 7 * (currWeek - 1)
    var lastDayOfWeek = firstDayOfWeek + 6

    var programDaysInCurrWeek = []

    for (var day = firstDayOfWeek; day <= lastDayOfWeek; day++) {
        programDaysInCurrWeek.push(day)
    }

    var exPerDayObj = {}

    for (var dayIndex = 0; dayIndex < 7; dayIndex++) {

        var dailyExercises = []

        if (programDaysInCurrWeek[dayIndex] in programObject) {
            for (var exercise in programObject[programDaysInCurrWeek[dayIndex]]) {

                if (exercise != 'loadingData') {
                    var renderObj = programObject[programDaysInCurrWeek[dayIndex]][exercise]
                    renderObj.uid = exercise
                    renderObj.deleteButton =
                        (shouldRenderExerciseButtons(
                            exercise,
                            programObject.currentDayInProgram
                        )) ? (programObject.loading_scheme === 'rpe_time') ?
                                <div className='currDayExBtnContainer'>
                                    <EditExerciseModalRpeTime submitHandler={handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                                    <DeleteExerciseButton buttonHandler={handleDeleteExerciseButton} uid={exercise} />
                                </div>
                                :
                                <div className='currDayExBtnContainer'>
                                    <EditExerciseModalWeightSets submitHandler={handleUpdateExercise} exUid={exercise} currentData={renderObj} />
                                    <DeleteExerciseButton buttonHandler={handleDeleteExerciseButton} uid={exercise} />
                                </div>
                            :
                            <></>
                    dailyExercises.push(renderObj)
                }
            }
        }
        var sortedExerciseArray = orderUserExercisesBasedOnExUID(dailyExercises)
        exPerDayObj[programDaysInCurrWeek[dayIndex]] = sortedExerciseArray
    }
    return exPerDayObj
}

const shouldRenderExerciseButtons = (uid, currDay) => {
    if (uid.split("_").reverse()[1] < currDay) {
        return false
    }
    return true
}

const setAvailExerciseCols = () => {
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


// Updated with new ratio calcs format
const setAvailExerciseChartData = (exerciseList, currDay, loadingScheme, currDayInProg, handleAddExerciseButton) => {
    var tableData = []
    exerciseList.forEach(exercise => {
        tableData.push({
            exercise: exercise.name,
            primMusc: exercise.primary.join(', '),
            secMusc: exercise.secondary.join(', '),
            expLevel: exercise.experience,
            addExerciseBtn: (loadingScheme === 'rpe_time') ?
                <AddExerciseModalRpeTime submitHandler={handleAddExerciseButton} name={exercise.uid} currDay={currDay} primMusc={exercise.primary} currDayInProg={currDayInProg}
                />
                : <AddExerciseModalWeightReps submitHandler={handleAddExerciseButton} name={exercise.uid} currDay={currDay} primMusc={exercise.primary} currDayInProg={currDayInProg} />
        })
    })
    return tableData
}

const listAndFormatLocalGlobalExercises = (globalExercises, localExercises) => {
    const globalList = Object.keys(globalExercises).map(key => ({
        uid: key,
        primary: globalExercises[key].primary,
        secondary: globalExercises[key].secondary,
        experience: globalExercises[key].experience,
        name: underscoreToSpaced(key)
    }));

    if (localExercises) {
        var localList = Object.keys(localExercises).map(key => ({
            uid: key,
            primary: localExercises[key].primary,
            secondary: localExercises[key].secondary,
            experience: localExercises[key].experience,
            name: underscoreToSpaced(key)
        }));
    } else {
        localList = []
    }

    return globalList.concat(localList)
}

const underscoreToSpaced = (string) => {
    string = string.split('_')
    var returnString = ''

    string.forEach(word => {
        returnString = returnString + word + ' '
    })


    return returnString.trim()
}

const checkNullExerciseData = (data, scheme) => {

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

const generateACWRGraphData = (programData, muscleGroups) => {


    var dataToGraph = {}

    for (var day = 1; day < programData.currentDayInProgram; day++) {

        var dateString = stripDateFromTSString(new Date((programData.startDayUTS + 86400000 * (day - 1))))

        if (day == 1) {
            dataToGraph['Overall_Total'] = []

            var insertObj = {
                name: dateString,
                day: day
            }
            insertObj['Acute Load'] = parseFloat(programData[day]['loadingData']['Total'].acuteEWMA.toFixed(2))
            insertObj['Chronic Load'] = parseFloat(programData[day]['loadingData']['Total'].chronicEWMA.toFixed(2))
            insertObj['ACWR'] = programData[day]['loadingData']['Total'].ACWR
            dataToGraph['Overall_Total'].push(insertObj)

        } else {
            insertObj = {
                name: dateString,
                day: day
            }

            insertObj['Acute Load'] = parseFloat(programData[day]['loadingData']['Total'].acuteEWMA.toFixed(2))
            insertObj['Chronic Load'] = parseFloat(programData[day]['loadingData']['Total'].chronicEWMA.toFixed(2))
            insertObj['ACWR'] = programData[day]['loadingData']['Total'].ACWR

            dataToGraph['Overall_Total'].push(insertObj)
        }


        Object.keys(muscleGroups).forEach(muscleGroup => {

            if (day == 1) {
                dataToGraph[muscleGroup + '_Total'] = []

                var insertObj = {
                    name: dateString,
                    day: day
                }
                insertObj['Acute Load'] = parseFloat(programData[day]['loadingData'][muscleGroup]['Total'].acuteEWMA.toFixed(2))
                insertObj['Chronic Load'] = parseFloat(programData[day]['loadingData'][muscleGroup]['Total'].chronicEWMA.toFixed(2))
                insertObj['ACWR'] = programData[day]['loadingData'][muscleGroup]['Total'].ACWR

                dataToGraph[muscleGroup + '_Total'].push(insertObj)

            } else {
                insertObj = {
                    name: dateString,
                    day: day
                }

                insertObj['Acute Load'] = parseFloat(programData[day]['loadingData'][muscleGroup]['Total'].acuteEWMA.toFixed(2))
                insertObj['Chronic Load'] = parseFloat(programData[day]['loadingData'][muscleGroup]['Total'].chronicEWMA.toFixed(2))
                insertObj['ACWR'] = programData[day]['loadingData']['Total'].ACWR

                dataToGraph[muscleGroup + '_Total'].push(insertObj)
            }


            muscleGroups[muscleGroup].forEach(muscle => {
                if (day == 1) {
                    dataToGraph[muscle] = []

                    var insertObj = {
                        name: dateString,
                        day: day
                    }
                    insertObj['Acute Load'] = parseFloat(programData[day]['loadingData'][muscleGroup][muscle].acuteEWMA.toFixed(2))
                    insertObj['Chronic Load'] = parseFloat(programData[day]['loadingData'][muscleGroup][muscle].chronicEWMA.toFixed(2))
                    insertObj['ACWR'] = programData[day]['loadingData'][muscleGroup][muscle].ACWR

                    dataToGraph[muscle].push(insertObj)

                } else {
                    insertObj = {
                        name: dateString,
                        day: day
                    }

                    insertObj['Acute Load'] = parseFloat(programData[day]['loadingData'][muscleGroup][muscle].acuteEWMA.toFixed(2))
                    insertObj['Chronic Load'] = parseFloat(programData[day]['loadingData'][muscleGroup][muscle].chronicEWMA.toFixed(2))
                    insertObj['ACWR'] = programData[day]['loadingData'][muscleGroup][muscle].ACWR

                    dataToGraph[muscle].push(insertObj)
                }


            })

        })
    }
    return dataToGraph

}

const generateSafeLoadGraphProps = (programData, muscleGroups) => {

    var ghostThresholds = [20]

    // First generate the series
    var chartSeries = ['Actual Loading']
    var dataToGraph = {}

    ghostThresholds.forEach(threshold => {

        var lowerSeries = 'Threshold - (-' + threshold + '%)'
        var upperSeries = 'Threshold - (+' + threshold + '%)'


        for (var day = 1; day < programData.currentDayInProgram; day++) {



            var dateString = stripDateFromTSString(new Date((programData.startDayUTS + 86400000 * (day - 1))))

            var loadingVal = parseFloat(programData[day]['loadingData']['Total'].chronicEWMA)

            if (day == 1) {
                dataToGraph['Overall_Total'] = []

                var insertObj = {
                    name: dateString,
                    day: day
                }
                insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                insertObj['Actual Loading'] = parseFloat(loadingVal.toFixed(2))

                dataToGraph['Overall_Total'].push(insertObj)

            } else {
                insertObj = {
                    name: dateString,
                    day: day
                }

                insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                insertObj['Actual Loading'] = parseFloat(loadingVal.toFixed(2))

                dataToGraph['Overall_Total'].push(insertObj)
            }

            Object.keys(muscleGroups).forEach(muscleGroup => {

                var loadingVal = parseFloat(programData[day]['loadingData'][muscleGroup]['Total'].chronicEWMA)

                if (day == 1) {
                    dataToGraph[muscleGroup + '_Total'] = []

                    var insertObj = {
                        name: dateString,
                        day: day
                    }
                    insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                    insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                    insertObj['Actual Loading'] = parseFloat(loadingVal.toFixed(2))

                    dataToGraph[muscleGroup + '_Total'].push(insertObj)

                } else {
                    insertObj = {
                        name: dateString,
                        day: day
                    }

                    insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                    insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                    insertObj['Actual Loading'] = parseFloat(loadingVal.toFixed(2))

                    dataToGraph[muscleGroup + '_Total'].push(insertObj)
                }



                muscleGroups[muscleGroup].forEach(muscle => {
                    var loadingVal = parseFloat(programData[day]['loadingData'][muscleGroup][muscle].chronicEWMA)

                    if (day == 1) {
                        dataToGraph[muscle] = []

                        var insertObj = {
                            name: dateString,
                            day: day
                        }
                        insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                        insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                        insertObj['Actual Loading'] = parseFloat(loadingVal.toFixed(2))

                        dataToGraph[muscle].push(insertObj)

                    } else {
                        insertObj = {
                            name: dateString,
                            day: day
                        }

                        insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                        insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                        insertObj['Actual Loading'] = parseFloat(loadingVal.toFixed(2))

                        dataToGraph[muscle].push(insertObj)
                    }
                })
            })
        }
        chartSeries.push(lowerSeries)
        chartSeries.push(upperSeries)
    })

    return {
        series: chartSeries,
        totalData: dataToGraph
    }
}

const stripDateFromTSString = (inputDay) => {

    var day = String(inputDay.getDate()).padStart(2, '0');
    var month = String(inputDay.getMonth() + 1).padStart(2, '0'); //January is 0!
    var year = inputDay.getFullYear();

    var date = day + '-' + month + '-' + year;

    return date
}

const generateCurrDaySafeLoadData = (programData, anatomyObject) => {

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
                    subRows: generateSpecificMuscleSafeLoadData(
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

const generateSpecificMuscleSafeLoadData = (programData, muscleGroup, currDayData, specificMuscleData) => {

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


const calculateDailyLoads = (programData,
    currentDayInProgram,
    scheme,
    acutePeriod,
    chronicPeriod,
    muscleGroups) => {

    var currDayData = programData[currentDayInProgram]


    var processedData = dailyLoadCalcs(currDayData, muscleGroups, scheme)

    const averageArray = [
        { type: 'acuteEWMA', period: acutePeriod },
        { type: 'chronicEWMA', period: chronicPeriod }
    ]


    averageArray.forEach(avgType => {
        processedData = appendEWMA(
            programData,
            processedData,
            currentDayInProgram,
            avgType.period,
            avgType.type,
            muscleGroups
        )
    })


    Object.keys(processedData).forEach(muscleGroup => {
        if (muscleGroup == 'Total') {
            if (processedData[muscleGroup].acuteEWMA != 0 &&
                processedData[muscleGroup].chronicEWMA != 0) {
                processedData[muscleGroup].ACWR = parseFloat(processedData[muscleGroup].acuteEWMA / processedData[muscleGroup].chronicEWMA).toFixed(2)
            } else {
                processedData[muscleGroup].ACWR = 0
            }
        } else {
            Object.keys(processedData[muscleGroup]).forEach(muscle => {
                if (processedData[muscleGroup][muscle].acuteEWMA != 0 &&
                    processedData[muscleGroup][muscle].chronicEWMA != 0) {
                    processedData[muscleGroup][muscle].ACWR = parseFloat(processedData[muscleGroup][muscle].acuteEWMA / processedData[muscleGroup][muscle].chronicEWMA).toFixed(2)
                } else {
                    processedData[muscleGroup][muscle].ACWR = 0
                }
            })
        }
    })

    return processedData
}


const dailyLoadCalcs = (dayData, muscleGroups, scheme) => {

    var dayLoading = {
        Total: {
            dailyLoad: 0
        }
    }

    if (dayData == undefined ||
        (Object.keys(dayData).length == 1
            && dayData.loadingData != undefined)
    ) {
        dayData = {}
    }

    Object.keys(muscleGroups).forEach(group => {
        dayLoading[group] = {
            Total: {
                dailyLoad: 0
            }
        }
    })
    // Account for the fact that the day is empty and no exercises
    // have been created
    if (Object.keys(dayData).length == 0) {

        Object.keys(muscleGroups).forEach(key => {
            var muscleList = muscleGroups[key]
            dayLoading[key]['Total'] = {
                dailyLoad: 0
            }

            muscleList.forEach(muscle => {
                dayLoading[key][muscle] = {
                    dailyLoad: 0
                }

            })

        })

    } else {
        for (var ex in dayData) {
            if (ex != 'loadingData') {
                var exData = dayData[ex]

                if (scheme == 'rpe_time') {
                    var load = exData.sets * exData.reps * exData.time * exData.rpe
                } else {
                    load = exData.sets * exData.reps * exData.weight * exData.rpe
                }

                dayLoading['Total']['dailyLoad'] += load

                Object.keys(muscleGroups).forEach(key => {
                    var muscleList = muscleGroups[key]

                    // Add a new object for that muscle group in the 
                    // daily loading for the new muscle group. 

                    var groupTotalUpdated = false

                    muscleList.forEach(muscle => {

                        if (exData.primMusc.includes(muscle)) {
                            if (muscle in dayLoading[key]) {
                                dayLoading[key][muscle].dailyLoad += load
                            } else {
                                dayLoading[key][muscle] = {
                                    dailyLoad: load
                                }
                            }
                            if (!groupTotalUpdated) {
                                dayLoading[key].Total.dailyLoad += load
                                groupTotalUpdated = true
                            }
                        } else {
                            // Check if the muscle group load has already been
                            // calculated from a previous exercise. 
                            // IF it hasnt then just set the load to zero. 
                            // If it does already exist 
                            if (dayLoading[key][muscle] == undefined) {
                                dayLoading[key][muscle] = {
                                    dailyLoad: 0
                                }
                            }
                        }
                    })

                })

            }
        }
    }
    return dayLoading

}

const appendEWMA = (
    programData,
    currDayData,
    currentDayInProgram,
    period,
    inputVariable,
    muscleGroups) => {

    if (currentDayInProgram == 1) {

        Object.keys(currDayData).forEach(muscleGroup => {
            if (muscleGroup == 'Total') {
                currDayData[muscleGroup][inputVariable] = currDayData[muscleGroup].dailyLoad

            } else {
                Object.keys(currDayData[muscleGroup]).forEach(muscle => {
                    currDayData[muscleGroup][muscle][inputVariable] = currDayData[muscleGroup][muscle].dailyLoad
                })
            }
        })

    } else if (currentDayInProgram <= period) {
        var prevDayData = programData[currentDayInProgram - 1].loadingData


        Object.keys(currDayData).forEach(muscleGroup => {
            if (muscleGroup == 'Total') {

                if (prevDayData[muscleGroup][inputVariable] == 0) {
                    currDayData[muscleGroup][inputVariable] = currDayData[muscleGroup].dailyLoad
                } else {
                    currDayData[muscleGroup][inputVariable] = calculateCurrentEWMA(
                        currDayData[muscleGroup].dailyLoad,
                        period,
                        prevDayData[muscleGroup][inputVariable]
                    )
                }

            } else {
                Object.keys(currDayData[muscleGroup]).forEach(muscle => {
                    if (prevDayData[muscleGroup][muscle][inputVariable] == 0) {
                        currDayData[muscleGroup][muscle][inputVariable] = currDayData[muscleGroup][muscle].dailyLoad
                    } else {
                        currDayData[muscleGroup][muscle][inputVariable] = calculateCurrentEWMA(
                            currDayData[muscleGroup][muscle].dailyLoad,
                            period,
                            prevDayData[muscleGroup][muscle][inputVariable]
                        )
                    }

                })
            }
        })
    } else {
        var startDay = currentDayInProgram - period + 1
        var calculatedEWMA = {}

        Object.keys(currDayData).forEach(muscleGroup => {
            calculatedEWMA[muscleGroup] = {}
        })
        for (var day = startDay; day < currentDayInProgram; day++) {
            Object.keys(currDayData).forEach(muscleGroup => {
                if (muscleGroup == 'Total') {
                    if (day == startDay) {
                        calculatedEWMA[muscleGroup] = programData[day]['loadingData'][muscleGroup].dailyLoad
                    } else {
                        if (calculatedEWMA[muscleGroup] == 0) {
                            calculatedEWMA[muscleGroup] = programData[day]['loadingData'][muscleGroup].dailyLoad
                        } else {
                            calculatedEWMA[muscleGroup] = calculateCurrentEWMA(
                                programData[day]['loadingData'][muscleGroup].dailyLoad,
                                period,
                                calculatedEWMA[muscleGroup]
                            )
                        }
                    }
                } else {
                    Object.keys(currDayData[muscleGroup]).forEach(muscle => {
                        if (day == startDay) {
                            calculatedEWMA[muscleGroup][muscle] = programData[day]['loadingData'][muscleGroup][muscle].dailyLoad
                        } else {
                            if (calculatedEWMA[muscleGroup][muscle] == 0) {
                                calculatedEWMA[muscleGroup][muscle] = programData[day]['loadingData'][muscleGroup][muscle].dailyLoad
                            } else {
                                calculatedEWMA[muscleGroup][muscle] = calculateCurrentEWMA(
                                    programData[day]['loadingData'][muscleGroup][muscle].dailyLoad,
                                    period,
                                    calculatedEWMA[muscleGroup][muscle]
                                )
                            }
                        }
                    })
                }
            })

        }
        Object.keys(currDayData).forEach(muscleGroup => {

            if (muscleGroup == 'Total') {
                if (calculatedEWMA[muscleGroup] == 0) {
                    currDayData[muscleGroup][inputVariable] = currDayData[muscleGroup].dailyLoad
                } else {
                    currDayData[muscleGroup][inputVariable] = calculateCurrentEWMA(
                        currDayData[muscleGroup].dailyLoad,
                        period,
                        calculatedEWMA[muscleGroup]
                    )
                }
            } else {
                Object.keys(currDayData[muscleGroup]).forEach(muscle => {

                    if (calculatedEWMA[muscleGroup][muscle] == 0) {
                        currDayData[muscleGroup][muscle][inputVariable] = currDayData[muscleGroup][muscle].dailyLoad
                    } else {
                        currDayData[muscleGroup][muscle][inputVariable] = calculateCurrentEWMA(
                            currDayData[muscleGroup][muscle].dailyLoad,
                            period,
                            calculatedEWMA[muscleGroup][muscle]
                        )
                    }
                })
            }

        })
    }

    return currDayData

}


const calculateCurrentEWMA = (currDayLoad, period, prevDayEWMA) => {

    var lambda = 2 / (period + 1)

    return (currDayLoad * lambda + prevDayEWMA * (1 - lambda))
}


const calculateRollingMonthlyAverage = (pastUserData, currentWeekData) => {

    var averageLoad = {}
    var startWeek = pastUserData.currentWeek - 3
    var endWeek = pastUserData.currentWeek

    pastUserData['week' + pastUserData.currentWeek].loadingData = currentWeekData

    // Generate the average loads for each of muscle groups
    // In the first 3 weeks of the section. 
    for (var week = startWeek; week <= endWeek; week++) {
        var weekData = pastUserData['week' + week].loadingData

        for (var bodyPart in weekData) {
            if (bodyPart in averageLoad) {
                averageLoad[bodyPart] += weekData[bodyPart]
            } else {
                averageLoad[bodyPart] = weekData[bodyPart]
            }
        }
    }

    for (bodyPart in averageLoad) {
        averageLoad[bodyPart] = parseFloat(averageLoad[bodyPart] / 4).toFixed(2)
    }

    return {
        averageLoads: averageLoad,
        weekID: startWeek + '_' + endWeek
    }
}

export {
    generateDaysInWeekScope,
    updatedDailyExerciseList,
    setAvailExerciseCols,
    listAndFormatLocalGlobalExercises,
    setAvailExerciseChartData,
    formatExerciseObjectForLocalInsertion,
    generateExerciseUID,
    checkNullExerciseData,
    generateACWRGraphData,
    generateSafeLoadGraphProps,
    generateCurrDaySafeLoadData
}