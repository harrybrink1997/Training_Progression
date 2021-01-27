const convertUIDayToTotalDays = (day) => {
    return (parseInt((this.state.currentWeekInProgram - 1) * 7) + parseInt(day)).toString()
}

const currentWeekInProgram = (currentDayInProgram) => {

}

export { convertUIDayToTotalDays, currentWeekInProgram }