
const calculateDailyLoads = (programData,
    currentDayInProgram,
    scheme,
    acutePeriod,
    chronicPeriod,
    muscleGroups) => {

    // console.log(programData)
    // console.log(muscleGroups)

    // var muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Total']


    var currDayData = programData[currentDayInProgram]
    // console.log(currDayData)

    if (scheme === 'rpe_time') {
        var processedData = dailyLoadCalcsRpeTime(currDayData, muscleGroups)
        console.log(processedData)
    } else {
        processedData = dailyLoadCalcsWeightReps(currDayData, muscleGroups)
    }


    // [{ type: 'acuteEWMA', period: acutePeriod },
    // { type: 'chronicEWMA', period: chronicPeriod }]
    //     .forEach(avgType => {
    //         console.log(processedData)
    //         console.log(avgType)
    //         processedData = appendEWMA(
    //             programData,
    //             processedData,
    //             currentDayInProgram,
    //             avgType.period,
    //             avgType.type,
    //             muscleGroups
    //         )
    //     })

    // muscleGroups.forEach(muscle => {
    //     if (processedData[muscle].acuteEWMA != 0 &&
    //         processedData[muscle].chronicEWMA != 0) {
    //         processedData[muscle].ACWR = parseFloat(processedData[muscle].acuteEWMA / processedData[muscle].chronicEWMA).toFixed(2)
    //     } else {
    //         processedData[muscle].ACWR = 0
    //     }
    // })

    // console.log(processedData)
    // return processedData
}


const dailyLoadCalcsRpeTime = (dayData, muscleGroups) => {

    var dayLoading = {
        Total: {
            dailyLoad: 0
        }
    }


    Object.keys(muscleGroups).forEach(group => {
        dayLoading[group] = {
            Total: {
                dailyLoad: 0
            }
        }
    })

    for (var ex in dayData) {
        if (ex != 'loadingData') {
            var exData = dayData[ex]

            var load = exData.sets * exData.reps * exData.time * exData.rpe
            dayLoading['Total']['dailyLoad'] += load

            Object.keys(muscleGroups).forEach(key => {
                var muscleList = muscleGroups[key]

                // Add a new object for that muscle group in the 
                // daily loading for the new muscle group. 

                var groupTotalUpdated = false

                muscleList.forEach(muscle => {
                    // console.log(dayLoading)
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
                        dayLoading[key][muscle] = {
                            dailyLoad: 0
                        }
                    }
                })

            })

        }
    }

    return dayLoading

}


const dailyLoadCalcsWeightReps = (dayData, muscleGroups) => {
    var dayLoading = {
        Total: {
            dailyLoad: 0
        }
    }

    for (var ex in dayData) {
        var exData = dayData[ex]

        var load = exData.sets * exData.reps * exData.weight
        dayLoading['Total']['dailyLoad'] += load


        for (var muscles in exData.primMusc) {
            var muscle = exData.primMusc[muscles]

            if (muscle in dayLoading) {
                dayLoading[muscle].dailyLoad += load
            } else {
                dayLoading[muscle] = {
                    dailyLoad: load
                }
            }
        }
    }

    muscleGroups.forEach(muscle => {
        if (!(muscle in dayLoading)) {
            dayLoading[muscle] = {
                dailyLoad: 0
            }
        }
    })

    return dayLoading

}

const appendEWMA = (
    programData,
    currDayData,
    currentDayInProgram,
    period,
    inputVariable,
    muscleGroups) => {

    console.log(currDayData)



    if (currentDayInProgram == 1) {

        for (var musc in currDayData) {
            currDayData[musc][inputVariable] = currDayData[musc].dailyLoad
        }

    } else if (currentDayInProgram <= period) {
        var prevDayData = programData[currentDayInProgram - 1].loadingData
        muscleGroups.forEach(muscle => {
            if (prevDayData[muscle][inputVariable] == 0) {
                currDayData[muscle][inputVariable] = currDayData[muscle].dailyLoad
            } else {
                currDayData[muscle][inputVariable] = calculateCurrentEWMA(
                    currDayData[muscle].dailyLoad,
                    period,
                    prevDayData[muscle][inputVariable]
                )
            }
        })

    } else {
        var startDay = currentDayInProgram - period + 1
        console.log(startDay)
        var calculatedEWMA = {}

        for (var day = startDay; day < currentDayInProgram; day++) {
            muscleGroups.forEach(muscle => {
                if (day == startDay) {
                    console.log(programData)
                    calculatedEWMA[muscle] = programData[day]['loadingData'][muscle].dailyLoad
                } else {
                    if (calculatedEWMA[muscle] == 0) {
                        calculatedEWMA[muscle] = programData[day]['loadingData'][muscle].dailyLoad
                    } else {
                        calculatedEWMA[muscle] = calculateCurrentEWMA(
                            programData[day]['loadingData'][muscle].dailyLoad,
                            period,
                            calculatedEWMA[muscle]
                        )
                    }
                }
            })
        }
        console.log(calculatedEWMA)
        console.log(currDayData)

        muscleGroups.forEach(muscle => {
            if (calculatedEWMA[muscle] == 0) {
                currDayData[muscle][inputVariable] = currDayData[muscle].dailyLoad
            } else {
                currDayData[muscle][inputVariable] = calculateCurrentEWMA(
                    currDayData[muscle].dailyLoad,
                    period,
                    calculatedEWMA[muscle]
                )
            }
        })
    }

    return currDayData

}


const calculateCurrentEWMA = (currDayLoad, period, prevDayEWMA) => {

    var lambda = 2 / (period + 1)

    return (currDayLoad * lambda + prevDayEWMA * (1 - lambda))
}















// const calculateWeeklyLoads = (weekData, scheme) => {
//     if (scheme === 'rpe_time') {
//         var processedData = weeklyLoadCalcsRpeTime(weekData)
//         console.log(processedData)
//     } else {
//         var processedData = weeklyLoadCalcsWeightReps(weekData)
//         console.log(processedData)
//     }

//     return processedData
// }


// const weeklyLoadCalcsRpeTime = (weekData) => {
//     var weekLoading = {}

//     for (var day in weekData) {
//         for (var ex in weekData[day]) {
//             var exData = weekData[day][ex]

//             var load = exData.sets * exData.reps * exData.time * exData.rpe

//             for (var muscles in exData.primMusc) {
//                 var muscle = exData.primMusc[muscles]

//                 if (muscle in weekLoading) {
//                     weekLoading[muscle] += load
//                 } else {
//                     weekLoading[muscle] = load
//                 }
//             }
//         }
//     }

//     return weekLoading

// }


// const weeklyLoadCalcsWeightReps = (weekData) => {
//     console.log(weekData)
//     var weekLoading = {}

//     for (var day in weekData) {
//         for (var ex in weekData[day]) {
//             var exData = weekData[day][ex]

//             var load = exData.sets * exData.reps * exData.weight

//             for (var muscles in exData.primMusc) {
//                 var muscle = exData.primMusc[muscles]

//                 if (muscle in weekLoading) {
//                     weekLoading[muscle] += load
//                 } else {
//                     weekLoading[muscle] = load
//                 }
//             }
//         }
//     }

//     return weekLoading

// }


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

export { calculateDailyLoads, dailyLoadCalcsRpeTime, dailyLoadCalcsWeightReps }