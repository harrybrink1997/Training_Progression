class Program {
    constructor(data) {
        this.name = data.name
        this.owner = data.owner
        this.ownerUsername = data.ownerUsername
        this.athlete = data.athlete
        this.athleteUsername = data.athleteUsername
        this.team = data.team
        this.creationDate = data.creationDate
        this.deploymentDate = data.deploymentDate
        this.status = data.status
        this.loadingScheme = data.loadingScheme
        this.currentDay = data.currentDay
        this.acutePeriod = data.acutePeriod
        this.chronicPeriod = data.chronicPeriod
        this.order = data.order
        this.isActiveInSequence = data.isActiveInSequence
        this.programUID = data.programUID
    }

    checkSameMetaParameters = (program) => {
        var metaParameters = {
            'Loading Scheme': false,
            'Chronic Period': false,
            'Acute Period': false
        }

        if (this.getLoadingScheme() === program.getLoadingScheme()) {
            metaParameters['Loading Scheme'] = true
        }

        if (this.getChronicPeriod() === program.getChronicPeriod()) {
            metaParameters['Chronic Period'] = true
        }

        if (this.getAcutePeriod() === program.getAcutePeriod()) {
            metaParameters['Acute Period'] = true
        }

        if (metaParameters['Acute Period'] && metaParameters['Chronic Period'] && metaParameters['Loading Scheme']) {
            return true
        }

        return metaParameters

    }

    getOwnerUsername = () => {
        return this.ownerUsername
    }

    getAthleteUsername = () => {
        return this.athleteUsername
    }

    getProgramUID = () => {
        return this.programUID
    }

    programEqualToUID = (uid) => {
        if (this.generateProgramUID() === uid) {
            return true
        } else {
            return false
        }
    }

    generateProgramUID = () => {
        return this.getName() + '_' + this.getOwner() + '_' + this.getCreationDate()
    }

    generateCompleteJSONObject() {
        return {
            order: this.getOrder(),
            isActiveInSequence: this.getIsActiveInSequence(),
            acutePeriod: this.getAcutePeriod(),
            chronicPeriod: this.getChronicPeriod(),
            loadingScheme: this.getLoadingScheme(),
            currentDay: this.getCurrentDay(),
            name: this.getName()
        }
    }

    // Getters and Setters
    getName() {
        return this.name
    }

    getOwner() {
        return this.owner
    }

    getAthlete() {
        return this.athlete
    }

    getTeam() {
        return this.team
    }

    getOrder() {
        return this.order
    }

    getIsActiveInSequence() {
        return this.isActiveInSequence
    }

    getCreationDate() {
        return this.creationDate
    }

    getLoadingScheme() {
        return this.loadingScheme
    }

    getAcutePeriod() {
        return this.acutePeriod
    }

    getChronicPeriod() {
        return this.chronicPeriod
    }

    getDeploymentDate() {
        return this.deploymentDate
    }

    getStatus() {
        return this.status
    }

    getCurrentDay() {
        return this.currentDay
    }

    setCurrentDay(value) {
        this.currentDay = value
    }

    getSequenceName = () => {
        return this.getOrder().split('_')[1]
    }

    getPositionInSequence = () => {
        return this.getOrder().split('_')[0]
    }

}

class PendingProgram extends Program {
    constructor(data) {
        super(data)

    }
}


class CurrentProgram extends Program {
    constructor(data) {
        super(data)
        this.startDayUTS = data.startDayUTS
    }

    iterateCurrentDay = (num) => {
        this.setCurrentDay(this.getCurrentDay() + num)
    }

    generateCompleteJSONObject() {
        var baseObj = super.generateCompleteJSONObject()
        baseObj.startDayUTS = this.getStartDayUTS()

        return baseObj
    }

    getStartDayUTS() {
        return this.startDayUTS
    }
}

class PastProgram extends Program {
    constructor(data) {
        super(data)
        this.startDayUTS = data.startDayUTS
        this.endDayUTS = data.endDayUTS
    }
}

const createProgramObject = (data) => {
    if (data.status === 'current') {
        return new CurrentProgram(data)
    } else if (data.status === 'past') {
        return new PastProgram(data)
    } else {
        return new PendingProgram(data)
    }
}

export { createProgramObject, CurrentProgram, PastProgram, PendingProgram }