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

export {
    generateDaysInWeekScope,
    updatedDailyExerciseList,
    setAvailExerciseCols,
    listAndFormatLocalGlobalExercises,
    setAvailExerciseChartData,
    formatExerciseObjectForLocalInsertion,
    generateExerciseUID,
    checkNullExerciseData
}