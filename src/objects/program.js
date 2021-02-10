class Program {
    constructor(data) {
        this.name = data.name
        this.owner = data.owner
        this.athlete = data.athlete
        this.team = data.team
        this.creationDate = data.creationDate
        this.deploymentDate = data.deploymentDate
        this.status = data.status
        this.loadingScheme = data.loadingScheme
        this.currentDay = data.currentDay
        this.acutePeriod = data.acutePeriod
        this.chronicPeriod = data.chronicPeriod
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

    generateCompleteProgTableData = () => {
        return {
            program: this.getName(),
            programUID: this.generateProgramUID(),
            loadingScheme: this.getLoadingScheme(),
            acutePeriod: this.getAcutePeriod(),
            chronicPeriod: this.getChronicPeriod(),
            buttons: ''
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

export { createProgramObject }