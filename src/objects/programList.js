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
        return undefined
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

    findRelatedSequentialPrograms = (order) => {
        var list = this.getProgramList()

        var seqOrderArray = order.split('_')
        seqOrderArray.shift()
        var sequenceString = seqOrderArray.join("_")
        var relatedPrograms = []

        list.forEach(program => {
            if (program.getOrder()) {
                if (program.getOrder() !== order) {
                    var currOrderArray = program.getOrder().split('_')
                    currOrderArray.shift()
                    var currSeqString = currOrderArray.join("_")

                    if (sequenceString === currSeqString) {
                        relatedPrograms.push({
                            programUID: program.getProgramUID(),
                            order: program.getOrder()
                        })
                    }
                }
            }
        })
        return relatedPrograms
    }
}

export { ProgramList }