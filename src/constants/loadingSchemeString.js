const loadingSchemeString = (scheme) => {
    if (scheme == 'rpe_time') {
        return 'RPE / Time'
    } else {
        return 'Weight / Repetitions'
    }
}

export default loadingSchemeString