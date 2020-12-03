export const orderUserExercisesBasedOnExUID = (exerciseArray) => {
    var sortedArray = exerciseArray.sort((x, y) => {
        var xp = parseInt(x.uid.split('_').slice(-1)[0])
        var yp = parseInt(y.uid.split('_').slice(-1)[0])

        return xp == yp ? 0 : xp < yp ? -1 : 1
    })

    return sortedArray

}


