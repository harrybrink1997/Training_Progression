export const calculateWeeklyLoads = (weekData, scheme) => {

    if (scheme === 'rpe_time') {
        var processedData = weeklyLoadCalcsRpeTime(weekData)
        console.log(processedData)
    } else {
        var processedData = weeklyLoadCalcsWeightReps(weekData)
        console.log(processedData)
    }

    return 1
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