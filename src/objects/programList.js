class ProgramList {
    constructor(list = []) {
        this.programList = list
    }

    addProgStart = (prog) => {
        this.programList.unshift(prog)
    }

    isEmptyList() {
        if (this.getProgramList().length === 0) {
            return true
        } else {
            return false
        }
    }

    removeProgram = (programUID) => {
        for (var prog in this.programList) {
            if (this.programList[prog].programEqualToUID(programUID)) {
                this.programList.splice(prog, 1)
            }
        }
    }

    getProgram = (programUID) => {
        for (var prog in this.programList) {
            if (this.programList[prog].programEqualToUID(programUID)) {
                return this.programList[prog]
            }
        }
    }

    setProgramList(value) {
        this.programList = value
    }

    getProgramList() {
        return this.programList
    }

    countPrograms() {
        return this.getProgramList().length
    }

    generateCompleteProgListTableData(buttons) {
        var payLoad = []

        this.getProgramList().forEach(program => {
            payLoad.push(program.generateCompleteProgTableData(buttons))
        })

        return payLoad

    }
}

export { ProgramList }