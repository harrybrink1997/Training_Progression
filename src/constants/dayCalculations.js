const convertUIDayToTotalDays = (day, currentDayInProgram) => {
    return (parseInt((currentWeekInProgram(currentDayInProgram) - 1) * 7) + parseInt(day)).toString()
}

const currentWeekInProgram = (currentDayInProgram) => {
    return Math.ceil(currentDayInProgram / 7)
}

const convertTotalDaysToUIDay = (day) => {
    if (day < 8) {
        return day
    } else {
        if (day % 7 == 0) {
            return 7
        } else {
            return day % 7
        }
    }
}

export { convertUIDayToTotalDays, currentWeekInProgram, convertTotalDaysToUIDay }