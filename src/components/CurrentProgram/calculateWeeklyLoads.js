
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
                    load = exData.sets * exData.reps * exData.weight
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

export { calculateDailyLoads, dailyLoadCalcs }