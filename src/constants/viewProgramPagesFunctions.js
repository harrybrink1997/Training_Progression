import React from 'react'
import { EditExerciseModalWeightSets, EditExerciseModalRpeTime } from '../components/CurrentProgram/editExerciseModal'
import { DeleteExerciseButton, DeleteGoalButton, CompleteGoalButton } from '../components/CurrentProgram/currentProgramPageButtons'
import { orderUserExercisesBasedOnExUID } from './orderingFunctions'
import { SelectColumnFilter } from '../components/CurrentProgram/filterSearch'
import { AddExerciseModalWeightReps, AddExerciseModalRpeTime } from '../components/CurrentProgram/addExerciseModal'
import { convertUIDayToTotalDays, currentWeekInProgram, convertTotalDaysToUIDay } from './dayCalculations'
import { max } from 'mathjs'
import { render } from '@testing-library/react'
import EditGoalModal from '../components/CustomComponents/editGoalModal'
import AddSubGoalModal from '../components/CustomComponents/addSubGoalsModal'


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
    console.log(insertionDay)
    console.log(exerciseListPerDay)
    console.log(exerciseObject)
    if (exerciseListPerDay[insertionDay] && exerciseListPerDay[insertionDay].length > 0) {
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
    var currWeek = currentWeekInProgram(programObject.currentDay)

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
                            programObject.currentDay
                        )) ? (programObject.loadingScheme === 'rpe_time') ?
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
    console.log(exPerDayObj)
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
const setAvailExerciseChartData = (exerciseList, loadingScheme, handleAddExerciseButton) => {
    var tableData = []
    exerciseList.forEach(exercise => {
        tableData.push({
            exercise: exercise.name,
            primMusc: exercise.primary.join(', '),
            secMusc: exercise.secondary.join(', '),
            expLevel: exercise.experience,
            addExerciseBtn: (loadingScheme === 'rpe_time') ?
                <AddExerciseModalRpeTime submitHandler={handleAddExerciseButton} name={exercise.uid} primMusc={exercise.primary}
                />
                : <AddExerciseModalWeightReps submitHandler={handleAddExerciseButton} name={exercise.uid} primMusc={exercise.primary} />
        })
    })
    return tableData
}

const listAndFormatExercises = (exercises) => {
    const exerciseList = exercises.map(exercise => ({
        uid: exercise.name,
        primary: exercise.primary,
        secondary: exercise.secondary,
        experience: exercise.experience,
        name: underscoreToSpaced(exercise.name)
    }))

    return exerciseList
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
    console.log(data)
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
                        time: exercise.time,
                        exercise: exercise.exercise
                    })
                    break;
                }
            }
        } else {
            for (var stat in exercise) {
                if (exercise[stat] === '' || exercise[stat] === undefined) {
                    if (exData.allValid) {
                        exData.allValid = false
                    }
                    exData.exercisesToCheck.push({
                        rpe: exercise.rpe,
                        weight: exercise.weight,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        time: exercise.time,
                        exercise: exercise.exercise
                    })
                    break;
                }
            }
        }
    })

    return exData
}

const generateACWRGraphData = (programData, muscleGroups) => {

    console.log(muscleGroups)
    console.log(programData)

    var dataToGraph = {}

    for (var day = 1; day < programData.currentDay; day++) {

        var dateString = stripDateFromTSString(new Date((programData.startDayUTS + 86400000 * (day - 1))))

        if (day === 1) {
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

            if (day === 1) {
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
                insertObj['ACWR'] = programData[day]['loadingData'][muscleGroup]['Total'].ACWR

                dataToGraph[muscleGroup + '_Total'].push(insertObj)
            }


            muscleGroups[muscleGroup].forEach(muscle => {
                if (day === 1) {
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


        for (var day = 1; day < programData.currentDay; day++) {



            var dateString = stripDateFromTSString(new Date((programData.startDayUTS + 86400000 * (day - 1))))

            var loadingVal = parseFloat(programData[day]['loadingData']['Total'].chronicEWMA)

            if (day === 1) {
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

                if (day === 1) {
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

                    if (day === 1) {
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
    if (programData.currentDay !== 1) {
        var currDayData = dailyLoadCalcs(
            programData[programData.currentDay],
            anatomyObject,
            programData.loadingScheme
        )
        Object.keys(anatomyObject).forEach(muscleGroup => {

            var prevDayChronicLoad = programData[programData.currentDay - 1]['loadingData'][muscleGroup]['Total']['chronicEWMA']
            var prevDayAcuteLoad = programData[programData.currentDay - 1]['loadingData'][muscleGroup]['Total']['acuteEWMA']
            var maxLoadData = 0;
            (prevDayAcuteLoad * 1.1 > prevDayChronicLoad * 1.2) ? maxLoadData = parseFloat(prevDayAcuteLoad) * 1.1 : maxLoadData = parseFloat(prevDayChronicLoad) * 1.2

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
        var prevDayChronicLoad = programData[programData.currentDay - 1]['loadingData'][muscleGroup][muscle]['chronicEWMA']
        var prevDayAcuteLoad = programData[programData.currentDay - 1]['loadingData'][muscleGroup][muscle]['acuteEWMA']
        var maxLoadData = 0;
        (prevDayAcuteLoad * 1.1 > prevDayChronicLoad * 1.2) ? maxLoadData = parseFloat(prevDayAcuteLoad) * 1.1 : maxLoadData = parseFloat(prevDayChronicLoad) * 1.2

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
        if (muscleGroup === 'Total') {
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
        (Object.keys(dayData).length === 1
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
    if (Object.keys(dayData).length === 0) {

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

                if (scheme === 'rpe_time') {
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
                            if (dayLoading[key][muscle] === undefined) {
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

    if (currentDayInProgram === 1) {

        Object.keys(currDayData).forEach(muscleGroup => {
            if (muscleGroup === 'Total') {
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
            if (muscleGroup === 'Total') {

                if (prevDayData[muscleGroup][inputVariable] === 0) {
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
                    if (prevDayData[muscleGroup][muscle][inputVariable] === 0) {
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
                if (muscleGroup === 'Total') {
                    if (day === startDay) {
                        calculatedEWMA[muscleGroup] = programData[day]['loadingData'][muscleGroup].dailyLoad
                    } else {
                        if (calculatedEWMA[muscleGroup] === 0) {
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
                        if (day === startDay) {
                            calculatedEWMA[muscleGroup][muscle] = programData[day]['loadingData'][muscleGroup][muscle].dailyLoad
                        } else {
                            if (calculatedEWMA[muscleGroup][muscle] === 0) {
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

            if (muscleGroup === 'Total') {
                if (calculatedEWMA[muscleGroup] === 0) {
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

                    if (calculatedEWMA[muscleGroup][muscle] === 0) {
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

const generateHistoricalTableData = (dayData, scheme) => {
    var tableData = []
    if (scheme === 'rpe_time') {
        Object.keys(dayData).forEach(exerciseName => {

            if (exerciseName !== 'loadingData') {
                var exercise = dayData[exerciseName]
                tableData.push({
                    exercise: exercise.exercise,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    time: exercise.time,
                    rpe: exercise.rpe
                })
            }
        })
    } else {
        Object.keys(dayData).forEach(exerciseName => {

            if (exerciseName !== 'loadingData') {
                var exercise = dayData[exerciseName]
                tableData.push({
                    exercise: exercise.exercise,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    time: exercise.time,
                    rpe: exercise.rpe
                })
            }
        })
    }
    return tableData

}

const generateSubGoalData = (
    subGoalList,
    handleEditGoal,
    handleDeleteGoal,
    handleCompleteGoal
) => {
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
                <CompleteGoalButton buttonHandler={handleCompleteGoal} uid={'sg_' + subGoalKey} currProgress={subGoal.completed} />
                <EditGoalModal
                    submitHandler={handleEditGoal} uid={'sg_' + subGoalKey}
                    isSubGoal={true}
                    currentData={subGoal}
                />
                <DeleteGoalButton buttonHandler={handleDeleteGoal} uid={'sg_' + subGoalKey} />
            </div>
        })
    })

    return returnArray
}

const generateGoalTableData = (
    goalObject,
    handleCreateSubGoal,
    handleEditGoal,
    handleCompleteGoal,
    handleDeleteGoal
) => {

    if (goalObject) {
        if (Object.keys(goalObject).length > 0) {
            var tableData = []

            Object.keys(goalObject).forEach(goalKey => {
                var goal = goalObject[goalKey]
                if (goal.subGoals) {
                    tableData.push({
                        description: goal.mainGoal.description,
                        progressString: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                        completed: goal.mainGoal.completed,
                        subRows: generateSubGoalData(
                            goal.subGoals,
                            handleEditGoal,
                            handleDeleteGoal,
                            handleCompleteGoal
                        ),
                        goalUID: goalKey,
                        targetCloseDate: goal.mainGoal.closeOffDate,
                        difficulty: goal.mainGoal.difficulty,
                        btns:
                            <div className='editGoalTableBtnContainer'>
                                <AddSubGoalModal submitHandler={handleCreateSubGoal} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
                                <EditGoalModal submitHandler={handleEditGoal} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
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
                                <AddSubGoalModal submitHandler={handleCreateSubGoal} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
                                <CompleteGoalButton buttonHandler={handleCompleteGoal} uid={'mg_' + goalKey} currProgress={goal.mainGoal.completed} />
                                <EditGoalModal submitHandler={handleEditGoal} uid={'mg_' + goalKey} isSubGoal={false} currentData={goal.mainGoal} />
                                <DeleteGoalButton buttonHandler={handleDeleteGoal} uid={'mg_' + goalKey} />
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

const generatePrevWeeksData = (programObject) => {

    var currWeek = currentWeekInProgram(programObject.currentDay)

    var dataObject = {}

    if (currWeek == 1) {
        return {}
    } else {
        for (var prevWeekNum = 1; prevWeekNum < currWeek; prevWeekNum++) {
            dataObject[prevWeekNum] = {}

            for (var day = 1; day < 8; day++) {

                var dayInProgram = (prevWeekNum - 1) * 7 + day
                var dayObject = {}
                if (programObject[dayInProgram]) {
                    Object.keys(programObject[dayInProgram]).forEach(exercise => {
                        if (exercise != 'loadingData') {
                            dayObject[exercise] = programObject[dayInProgram][exercise]
                        }
                    })
                }

                dataObject[prevWeekNum][day] = dayObject
            }
        }
    }
    return dataObject
}

const generatePastProgramGoalTableData = (goals) => {

    if (goals) {
        if (Object.keys(goals).length > 0) {

            var tableData = []
            var goalStatsData = {
                numSubGoals: 0,
                numSubGoalsComplete: 0,
                numMainGoals: 0,
                numMainGoalsComplete: 0,
                numEasyGoalsComplete: 0,
                numMediumGoalsComplete: 0,
                numHardGoalsComplete: 0,
                numHardGoals: 0,
                numMediumGoals: 0,
                numEasyGoals: 0
            }

            Object.keys(goals).forEach(goalKey => {
                var goal = goals[goalKey]
                if (goal.subGoals != undefined) {

                    var processedSubGoalData = generatePastProgramSubGoalData(goal.subGoals)

                    tableData.push({
                        description: goal.mainGoal.description,
                        progressString: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                        completed: goal.mainGoal.completed,
                        subRows: processedSubGoalData.tableData,
                        goalUID: goalKey,
                        targetCloseDate: goal.mainGoal.closeOffDate,
                        difficulty: goal.mainGoal.difficulty,
                    })

                    goalStatsData.numSubGoals += processedSubGoalData.statsData.numSubGoals

                    goalStatsData.numSubGoalsComplete += processedSubGoalData.statsData.numSubGoalsComplete

                    goalStatsData.numEasyGoalsComplete += processedSubGoalData.statsData.numEasyGoalsComplete

                    goalStatsData.numMediumGoalsComplete += processedSubGoalData.statsData.numMediumGoalsComplete

                    goalStatsData.numHardGoalsComplete += processedSubGoalData.statsData.numHardGoalsComplete

                } else {
                    tableData.push({
                        description: goal.mainGoal.description,
                        progressString: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                        targetCloseDate: goal.mainGoal.closeOffDate,
                        completed: goal.mainGoal.completed,
                        goalUID: goalKey,
                        difficulty: goal.mainGoal.difficulty,
                    })


                }
                goalStatsData.numMainGoals++
                goalStatsData['num' + goal.mainGoal.difficulty + 'Goals']++

                if (goal.mainGoal.completed) {
                    goalStatsData.numMainGoalsComplete++
                    goalStatsData['num' + goal.mainGoal.difficulty + 'GoalsComplete']++
                }
            })

            var formattedGoalChartData = generateGoalProgChartData(goalStatsData)
            return {
                tableData: tableData,
                statsData: goalStatsData,
                pieChartData: formattedGoalChartData.pieChartData,
                barChartData: formattedGoalChartData.barChartData

            }
        } else {
            return {
                tableData: [],
                statsData: {},
                pieChartData: {
                    data: [],
                    colours: []
                },
                barChartData: []
            }
        }
    }
    return {
        tableData: [],
        statsData: {},
        pieChartData: {
            data: [],
            colours: []
        },
        barChartData: []
    }
}

const generatePastProgramSubGoalData = (subGoalList) => {
    var returnArray = []
    var subGoalStatsData = {
        numSubGoals: 0,
        numSubGoalsComplete: 0,
        numEasyGoalsComplete: 0,
        numMediumGoalsComplete: 0,
        numHardGoalsComplete: 0,
        numHardGoals: 0,
        numMediumGoals: 0,
        numEasyGoals: 0,
    }

    Object.keys(subGoalList).forEach(subGoalKey => {
        var subGoal = subGoalList[subGoalKey]
        console.log(subGoal)
        returnArray.push({
            description: subGoal.description,
            progressString: (subGoal.completed) ? 'Complete' : 'In Progress',
            completed: subGoal.completed,
            targetCloseDate: subGoal.closeOffDate,
            goalUID: subGoalKey,
            difficulty: subGoal.difficulty,
        })

        subGoalStatsData.numSubGoals++
        subGoalStatsData['num' + subGoal.difficulty + 'Goals']++

        if (subGoal.completed) {
            subGoalStatsData.numSubGoalsComplete++
            console.log('num' + subGoal.difficulty + 'GoalsComplete')
            subGoalStatsData['num' + subGoal.difficulty + 'GoalsComplete']++
        }
    })

    return {
        tableData: returnArray,
        statsData: subGoalStatsData
    }
}

const generateGoalProgChartData = (goalStatsData) => {

    return {
        pieChartData: {
            colours: ['#8cfc86', '#fcf686', '#fc868c'],
            data: [
                {
                    name: 'Easy',
                    value: goalStatsData.numEasyGoalsComplete
                },
                {
                    name: 'Medium',
                    value: goalStatsData.numMediumGoalsComplete
                },
                {
                    name: 'Hard',
                    value: goalStatsData.numHardGoalsComplete
                }
            ]
        },
        barChartData: {
            data: [
                {
                    name: 'All Goals',
                    Completed: goalStatsData.numSubGoalsComplete + goalStatsData.numMainGoalsComplete,
                    Total: goalStatsData.numSubGoals + goalStatsData.numMainGoals
                },
                {
                    name: 'Main Goals',
                    Completed: goalStatsData.numSubGoalsComplete,
                    Total: goalStatsData.numMainGoals
                },
                {
                    name: 'Sub Goals',
                    Completed: goalStatsData.numSubGoalsComplete,
                    Total: goalStatsData.numSubGoals
                }
            ]
        }
    }

}

const generatePastProgramExerciseData = (programData) => {
    var currWeek = Math.ceil(programData.currentDay / 7)

    var dataObject = {}
    for (var prevWeekNum = 1; prevWeekNum <= currWeek; prevWeekNum++) {
        dataObject[prevWeekNum] = {}

        for (var day = 1; day < 8; day++) {

            var dayInProgram = (prevWeekNum - 1) * 7 + day
            var dayObject = {}
            if (programData[dayInProgram] != undefined) {
                Object.keys(programData[dayInProgram]).forEach(exercise => {
                    if (exercise != 'loadingData') {
                        dayObject[exercise] = programData[dayInProgram][exercise]
                    }
                })
            }

            dataObject[prevWeekNum][day] = dayObject
        }
    }

    // Check if the object is actually empty and there is no data.
    var hasData = false

    for (var weeks in dataObject) {
        var week = dataObject[weeks]
        for (var day in week) {
            if (Object.keys(week[day]).length > 0) {
                hasData = true
                break
            }
        }
    }

    if (hasData) {
        return dataObject
    } else {
        return {}
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
    generateCurrDaySafeLoadData,
    generateHistoricalTableData,
    listAndFormatExercises,
    generateGoalTableData,
    generatePrevWeeksData,
    generatePastProgramGoalTableData,
    generatePastProgramExerciseData
}