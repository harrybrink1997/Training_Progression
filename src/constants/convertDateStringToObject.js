const convertDateStringToObject = (dateString, separator) => {
    var dateArray = dateString.split(separator)
    return new Date(dateArray[2], dateArray[1], dateArray[0])
}

export default convertDateStringToObject