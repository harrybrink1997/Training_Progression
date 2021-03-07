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

    activateNextProgramInSequence(order) {
        let relatedPrograms = this.findRelatedSequentialPrograms(order)

        if (relatedPrograms.length === 0) {
            return false
        } else if (relatedPrograms.length === 1) {
            return relatedPrograms[0].programUID
        } else {
            relatedPrograms.sort((a, b) => {
                return parseInt(a.order.split("_")[0]) - parseInt(b.order.split("_")[0])
            })
            return relatedPrograms[0].programUID
        }

    }

    programNameExists = (newProgramUID) => {
        let proposedName = newProgramUID.split('_')[0]

        for (var i in this.getProgramList()) {
            let program = this.getProgramList()[i]
            if (program.name === proposedName) {
                return true
            }
        }

        return false
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

    removeProgramSequence = (programUID, programOrder, exclusions = []) => {
        let list = this.findRelatedSequentialPrograms(programOrder)

        this.removeProgram(programUID)

        list.forEach(program => {
            if (!exclusions.includes(program.programUID)) {
                this.removeProgram(program.programUID)
            }
        })
    }

    sequentialProgramUIDList = (order, exclusions = []) => {
        let relatedProgs = this.findRelatedSequentialPrograms(order)
        console.log(relatedProgs)
        console.log(exclusions)
        let payload = []
        relatedProgs.forEach(prog => {
            if (!exclusions.includes(prog.programUID)) {
                payload.push(prog.programUID)
            }
        })

        return payload
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

class PastProgramList extends ProgramList {
    constructor(props) {
        super(props)
    }

    removeProgram = (programUID, closeDayUTS) => {
        for (var prog in this.programList) {
            let program = this.programList[prog]

            if (program.programEqualToUID(programUID) && program.getEndDayUTS() === closeDayUTS) {
                this.programList.splice(prog, 1)
            }
        }
    }

    getProgram = (programUID, closeDayUTS) => {
        for (var prog in this.programList) {
            let program = this.programList[prog]

            if (program.programEqualToUID(programUID) && program.getEndDayUTS() === closeDayUTS) {
                return program
            }
        }
        return undefined
    }

}

export { ProgramList, PastProgramList }