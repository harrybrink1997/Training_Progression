const loadingSchemeString = (scheme) => {
    if (scheme == 'rpe_time') {
        return 'RPE / Time'
    } else {
        return 'Weight / Repetitions'
    }
}

const loadingSchemeStringInverse = (scheme) => {
    if (scheme == 'RPE / Time') {
        return 'rpe_time'
    } else {
        return 'weight_reps'
    }
}

export default loadingSchemeString

export { loadingSchemeStringInverse }