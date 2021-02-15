const isMainGoal = (tableUID) => {
    if (tableUID.split('_')[0] === 'sg') {
        return false
    }
    return true
}

const goalDBUID = (tableUID) => {
    var arr = tableUID.split('_')
    return arr[1] + '_' + arr[2]
}

const subGoalParent = (tableUID) => {
    return 'Goal_' + tableUID.split('_')[1]
}

const generateGoalParentIDFromSubgoalID = (id) => {
    var goalIDs = {}
    var idComponents = id.split('_')
    // return 'Goal_' + idComponents[1]

    if (idComponents[0] == 'mg') {
        goalIDs['isSubGoal'] = false
        goalIDs['mainGoal'] = 'Goal_' + idComponents[2]
    } else if (idComponents[0] == 'sg') {
        goalIDs['isSubGoal'] = true
        goalIDs['mainGoal'] = 'Goal_' + idComponents[1]
        goalIDs['subGoal'] = idComponents[1] + '_' + idComponents[2]
    }
    return goalIDs
}

export { isMainGoal, goalDBUID, subGoalParent, generateGoalParentIDFromSubgoalID }