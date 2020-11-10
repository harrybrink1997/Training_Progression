const calculateDailyLoads = (weekData, scheme) => {

    if (scheme === 'rpe_time') {
        var processedData = dailyLoadCalcsRpeTime(weekData)
        console.log(processedData)
    } else {
        var processedData = dailyLoadCalcsWeightReps(weekData)
        console.log(processedData)
    }

    return processedData
}


const dailyLoadCalcsRpeTime = (dayData) => {
    console.log(dayData)
    var dayLoading = {}

    for (var ex in dayData) {
        var exData = dayData[ex]

        var load = exData.sets * exData.reps * exData.time * exData.rpe

        for (var muscles in exData.primMusc) {
            var muscle = exData.primMusc[muscles]

            if (muscle in dayLoading) {
                dayLoading[muscle] += load
            } else {
                dayLoading[muscle] = load
            }
        }
    }

    console.log(dayLoading)
    return dayLoading

}


const dailyLoadCalcsWeightReps = (dayData) => {
    console.log(dayData)
    var dayLoading = {}

    for (var ex in dayData) {
        var exData = dayData[ex]

        var load = exData.sets * exData.reps * exData.weight

        for (var muscles in exData.primMusc) {
            var muscle = exData.primMusc[muscles]

            if (muscle in dayLoading) {
                dayLoading[muscle] += load
            } else {
                dayLoading[muscle] = load
            }
        }
    }
    console.log(dayLoading)
    return dayLoading

}




















const calculateWeeklyLoads = (weekData, scheme) => {
    if (scheme === 'rpe_time') {
        var processedData = weeklyLoadCalcsRpeTime(weekData)
        console.log(processedData)
    } else {
        var processedData = weeklyLoadCalcsWeightReps(weekData)
        console.log(processedData)
    }

    return processedData
}


const weeklyLoadCalcsRpeTime = (weekData) => {
    var weekLoading = {}

    for (var day in weekData) {
        for (var ex in weekData[day]) {
            var exData = weekData[day][ex]

            var load = exData.sets * exData.reps * exData.time * exData.rpe

            for (var muscles in exData.primMusc) {
                var muscle = exData.primMusc[muscles]

                if (muscle in weekLoading) {
                    weekLoading[muscle] += load
                } else {
                    weekLoading[muscle] = load
                }
            }
        }
    }

    return weekLoading

}


const weeklyLoadCalcsWeightReps = (weekData) => {
    console.log(weekData)
    var weekLoading = {}

    for (var day in weekData) {
        for (var ex in weekData[day]) {
            var exData = weekData[day][ex]

            var load = exData.sets * exData.reps * exData.weight

            for (var muscles in exData.primMusc) {
                var muscle = exData.primMusc[muscles]

                if (muscle in weekLoading) {
                    weekLoading[muscle] += load
                } else {
                    weekLoading[muscle] = load
                }
            }
        }
    }

    return weekLoading

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

    for (var bodyPart in averageLoad) {
        averageLoad[bodyPart] = parseFloat(averageLoad[bodyPart] / 4).toFixed(2)
    }

    return {
        averageLoads: averageLoad,
        weekID: startWeek + '_' + endWeek
    }
}

export { calculateDailyLoads, calculateWeeklyLoads, calculateRollingMonthlyAverage }