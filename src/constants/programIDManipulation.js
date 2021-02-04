const getName = (id) => {
    return id.split('_')[0]
}

const getCreator = (id) => {
    return id.split('_')[1]
}

const getCreationTime = (id) => {
    return id.split('_')[2]
}

const getCloseOffTime = (id) => {
    var idArr = id.split('_')
    if (idArr.length > 3) {
        return idArr[3]
    }
    return undefined
}

export {
    getName,
    getCreationTime,
    getCreator,
    getCloseOffTime
}