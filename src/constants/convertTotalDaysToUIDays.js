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

export default convertTotalDaysToUIDay