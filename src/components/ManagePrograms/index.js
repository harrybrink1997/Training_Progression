import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List, Button } from 'semantic-ui-react'

import BasicTable from '../CustomComponents/basicTable'
import ManageProgramsModal from './manageProgramsModal'
import ManagePendingProgramsModal from './managePendingProgramsModal'
import CreateProgramModal from './createProgramModal'
import CreateProgramGroupModal from './createProgramGroupModal'
import DeleteProgramModal from './deleteProgramModal'
import loadingSchemeString, { loadingSchemeStringInverse } from '../../constants/loadingSchemeString'
import { AcceptRequestButton, DeclineRequestButton, AcceptReplaceRequestButton, DeclineReplaceRequestButton } from '../CustomComponents/customButtons'
import ReplaceProgramOptionsModal from './replaceProgramOptionsModal'
import OverrideReplaceProgramModal from './overrideReplaceProgramModal'
import ReplaceProgramSequenceModal from './replaceProgramSequenceModal'
import { createUserObject } from '../../objects/user'
import { createProgramObject } from '../../objects/program'
import { ProgramList } from '../../objects/programList'
import PageHistory from '../CustomComponents/pageHistory'
import { listAndFormatExercises, checkNullExerciseData, setAvailExerciseCols } from '../../constants/viewProgramPagesFunctions'
import ProgramView from '../CustomComponents/programView'
import { capitaliseFirstLetter, underscoreToSpaced } from '../../constants/stringManipulation';

class ManageProgramsPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            programManagementTableData: [],
            programManagementTableColumns: [],
            loading: true
        }
    }

    componentDidMount() {
        console.log("going in 0")
        this.setState({ loading: true }, () => {
            console.log("going in 1")
            this.props.firebase.getUser(this.props.firebase.auth.currentUser.uid)
                .then(snapshot => {
                    var userInfo = snapshot.data()
                    console.log("going in 1")

                    var userObject = createUserObject(
                        this.props.firebase.auth.currentUser.uid,
                        userInfo
                    )
                    console.log(userObject)

                    this.props.firebase.getUserPrograms(userObject.getId())
                        .then(snapshot => {
                            console.log(userObject)
                            var nonPendingPrograms = []
                            var pendingPrograms = []
                            var currentPrograms = []
                            var pastPrograms
                            if (snapshot.empty) {
                                nonPendingPrograms = []
                                pendingPrograms = []
                            } else {
                                snapshot.forEach(doc => {

                                    var progObj = createProgramObject(doc.data())

                                    if (progObj.getStatus() === 'pending') {
                                        pendingPrograms.push(progObj)
                                    } else {
                                        nonPendingPrograms.push(progObj)

                                        if (progObj.getStatus() === 'current') {
                                            currentPrograms.push(progObj)
                                        } else if (progObj.getStatus() === 'past') {
                                            pastPrograms.push(progObj)
                                        }
                                    }
                                })
                            }

                            var nonPendingList = new ProgramList(nonPendingPrograms)

                            var pendingList = new ProgramList(pendingPrograms)

                            var currProgList = new ProgramList(currentPrograms)

                            var pastProgList = new ProgramList(pastPrograms)

                            this.setState({
                                user: userObject,
                                nonPendingProgList: nonPendingList,
                                currProgList: currProgList,
                                pastProgList: pastProgList,
                                progManageTableData: this.initProgramTableData(nonPendingList, false),
                                progManageTableColumns: this.initProgramTableColumns(userObject.getUserType()),
                                pendingProgList: pendingList,
                                pendProgsModalFootText: (!pendingList.isEmptyList()) && '',
                                view: 'home',
                                pageHistory: new PageHistory(),
                                editMode: false,
                                currProgram: undefined,
                                pageContentLoading: false,
                                loading: false

                            })
                        })
                })
                .catch(error => {
                    console.log(error)
                })
        });
    }


    handleBackClick = (pageView) => {


        this.setState({
            pageBodyContentLoading: true
        }, () => {

            var previousPage = this.state.pageHistory.back()
            if (previousPage === 'home') {
                this.setState(prevState => ({
                    ...prevState,
                    view: previousPage,
                    currProgram: undefined,
                    pageBodyContentLoading: false,
                }))
            } else {
                this.setState(prevState => ({
                    ...prevState,
                    view: previousPage,
                    pageBodyContentLoading: false,
                }))
            }
        })
    }

    handleViewChange = (view) => {

        this.state.pageHistory.next(this.state.view)

        this.setState(prevState => ({
            ...prevState,
            view: view
        }))
    }

    initProgramTableData = (programList, editMode) => {

        var payLoad = []
        if (!editMode) {
            programList.getProgramList().forEach(prog => {
                payLoad.push({
                    program: prog.getName(),
                    loadingScheme: loadingSchemeString(prog.getLoadingScheme()),
                    acutePeriod: prog.getAcutePeriod(),
                    chronicPeriod: prog.getChronicPeriod(),
                    buttons:
                        <Button
                            className='lightPurpleButton-inverted'
                            onClick={() => { this.handleProgramClick(prog.generateProgramUID()) }}
                        >
                            View Program
                        </Button>

                })
            })
        } else {
            programList.getProgramList().forEach(prog => {
                payLoad.push({
                    program: prog.getName(),
                    loadingScheme: loadingSchemeString(prog.getLoadingScheme()),
                    acutePeriod: prog.getAcutePeriod(),
                    chronicPeriod: prog.getChronicPeriod(),
                    buttons:
                        <>
                            <Button
                                className='lightPurpleButton-inverted'
                                onClick={() => { this.handleProgramClick(prog.generateProgramUID()) }}
                            >
                                View Program
                            </Button>
                            <Button
                                className='lightRedButton-inverted'
                                onClick={() => { this.handleDeleteProgram(prog.generateProgramUID()) }}
                            >
                                Delete Program
                            </Button>
                        </>
                })
            })
        }

        return payLoad
    }

    handleProgramClick = (programUID) => {

        // Get all the anatomy data for progression loading. 
        this.setState({
            pageBodyContentLoading: true
        }, () => {

            this.props.firebase.getAnatomyData()
                .then(snapshot => {
                    const anatomyObject = snapshot.data().anatomy

                    // Get all exercise data to view with the program and format them all.
                    this.props.firebase.getExData(['none'])
                        .then(snapshot => {
                            var exList = listAndFormatExercises(
                                snapshot.docs.map(doc => doc.data())
                            )

                            // Get the program exercise data
                            this.props.firebase.getProgramExData(programUID)
                                .then(snapshot => {
                                    var exData = {}

                                    var progData = this.state.nonPendingProgList.getProgram(programUID).generateCompleteJSONObject()

                                    if (!snapshot.empty) {
                                        snapshot.docs.forEach(doc => {

                                            progData[doc.id] = { ...doc.data() }

                                        })
                                    }

                                    this.state.pageHistory.next(this.state.view)

                                    this.setState(prev => ({
                                        ...prev,
                                        view: 'programHomeView',
                                        pageBodyContentLoading: false,
                                        currProgram: {
                                            programUID: programUID,
                                            availExData: exList,
                                            availExColumns: setAvailExerciseCols(),
                                            programData: progData,
                                            rawAnatomyData: anatomyObject,
                                            nullExerciseData: {
                                                hasNullData: false,
                                                nullTableData: []
                                            },
                                            viewProgramFunctions: {
                                                handleDeleteExerciseButton: this.handleDeleteExerciseButton,
                                                handleUpdateExercise: this.handleUpdateExercise,
                                                handleAddExerciseButton: this.handleAddExerciseButton,
                                                handleSubmitButton: this.handleSubmitButton,
                                                handleNullCheckProceed: this.handleNullCheckProceed,
                                                handleStartProgram: this.handleStartProgram
                                            },
                                        }
                                    }))

                                })
                        })


                })
                .catch(error => {
                    console.log(error)
                })
        })
    }

    handleDeleteExerciseButton = (exercise) => {
        console.log('delete exercise')
        console.log(exercise)
    }

    handleUpdateExercise = (exercise) => {
        console.log('update exercise')
        console.log(exercise)
    }

    handleAddExerciseButton = (exerciseObject, exUID, loadingScheme, insertionDay) => {
        console.log('add exercise')
        console.log(exerciseObject)
        console.log(exUID)
        console.log(loadingScheme)
        console.log(insertionDay)


        if (loadingScheme == 'rpe_time') {
            var dataPayload = {
                exercise: underscoreToSpaced(exerciseObject.name),
                sets: exerciseObject.sets,
                rpe: exerciseObject.rpe,
                time: exerciseObject.time,
                reps: exerciseObject.reps,
                primMusc: exerciseObject.primMusc
            }
        } else {
            dataPayload = {
                exercise: underscoreToSpaced(exerciseObject.name),
                sets: exerciseObject.sets,
                time: exerciseObject.time,
                reps: exerciseObject.reps,
                rpe: exerciseObject.rpe,
                weight: exerciseObject.weight,
                primMusc: exerciseObject.primMusc
            }
        }

        var payLoad = {}
        payLoad[exUID] = dataPayload

        console.log(payLoad)
        console.log(this.state.currProgram.programUID)

        this.props.firebase.addExerciseDB(
            this.state.currProgram.programUID,
            insertionDay,
            payLoad
        )

    }

    handleSubmitButton = () => {
        console.log('submit button')

    }

    handleNullCheckProceed = () => {
        console.log('null check')

    }

    handleStartProgram = () => {
        console.log('start program')
    }

    initProgramTableColumns = (userType) => {
        if (userType === 'coach') {
            return (
                [
                    {
                        Header: 'Program',
                        accessor: 'program',
                        filter: 'fuzzyText'
                    },
                    {
                        Header: 'Loading Scheme',
                        accessor: 'loadingScheme',
                        filter: 'fuzzyText'
                    },
                    {
                        Header: 'Acute Period',
                        accessor: 'acutePeriod',
                    },
                    {
                        Header: 'Chronic Period',
                        accessor: 'chronicPeriod',
                    },
                    {
                        Header: 'Program Length (Weeks)',
                        accessor: 'programLength',
                    },
                    {
                        accessor: 'buttons',
                    }
                ]
            )
        } else {
            return (
                [
                    {
                        Header: 'Program',
                        accessor: 'program',
                        filter: 'fuzzyText'
                    },
                    {
                        Header: 'Loading Scheme',
                        accessor: 'loadingScheme',
                        filter: 'fuzzyText'
                    },
                    {
                        Header: 'Acute Period',
                        accessor: 'acutePeriod',
                    },
                    {
                        Header: 'Chronic Period',
                        accessor: 'chronicPeriod',
                    },
                    {
                        accessor: 'buttons',
                    }
                ]
            )
        }
    }

    findRelatedSequentialPrograms = (programObject, seqOrderString) => {

        // If the start of the sequence is 1 - there will be no related programs in current or past programs. Related programs will only exist in pending programs.
        // if (seqOrderString.split('_')[0] === '1') {
        var seqOrderArray = seqOrderString.split('_')
        seqOrderArray.shift()
        var sequenceString = seqOrderArray.join("_")
        var relatedPrograms = []

        Object.keys(programObject).forEach(programUID => {
            var programData = programObject[programUID]

            if (programData.order) {
                if (programData.order !== seqOrderString) {
                    var currOrderArray = programData.order.split('_')
                    currOrderArray.shift()
                    var currSeqString = currOrderArray.join("_")

                    if (sequenceString === currSeqString) {
                        relatedPrograms.push({
                            programUID: programUID,
                            order: programData.order
                        })
                    }
                }
            }
        })
        return relatedPrograms

        // }
    }

    programInCurrentPrograms = (userObject, programName) => {
        if (!userObject.currentPrograms) {
            return {
                inCurrProg: false,
                programUID: programName
            }
        } else {
            for (var program in userObject.currentPrograms) {
                if (program === programName) {
                    return {
                        inCurrProg: true,
                        order: userObject.currentPrograms[program].order,
                        isActiveInSequence: userObject.currentPrograms[program].isActiveInSequence,
                        currentDayInProgram: userObject.currentPrograms[program].currentDayInProgram,
                        programUID: program
                    }
                }
            }
            return {
                inCurrProg: false,
                programUID: programName
            }
        }
    }

    programInPastPrograms = (userObject, programName) => {
        if (!userObject.pastPrograms) {
            return false
        } else {
            for (var program in userObject.pastPrograms) {
                if (program === programName) {
                    return true
                }
            }
            return false
        }
    }

    handlePendingProgramReplacement = (programName, replacementType, currentDayInProgram) => {
        // Handles the replacement of unlimited programs not sequential programs. That is more involved and found in another function. 
        var basePath =
            '/users/'
            + this.props.firebase.auth.currentUser.uid

        var currPath =
            basePath
            + '/currentPrograms/'

        if (replacementType === 'future') {
            var maxDay = 0
            Object.keys(this.state.pendingProgramsData[programName]).forEach(key => {
                if (parseInt(key)) {
                    if (parseInt(key) > maxDay) {
                        maxDay = key
                    }
                }
            })
            var path =
                currPath
                + programName + '/'
            var payLoad = {}
            for (var day = currentDayInProgram + 1; day <= maxDay; day++) {

                (this.state.pendingProgramsData[programName][day]) ?
                    payLoad[path + day.toString()] = this.state.pendingProgramsData[programName][day]
                    : payLoad[path + day.toString()] = {}
            }

            if (this.state.currentProgramsData[programName].order) {
                payLoad[path + 'isActiveInSequence'] = null
                payLoad[path + 'order'] = null
            }

        } else {
            var path =
                currPath
                + programName

            var payLoad = {}

            payLoad[path] = this.state.pendingProgramsData[programName]
        }

        // Handle the behaviour of the current program sequences data.
        var currProgData = this.state.currentProgramsData[programName]
        if (currProgData.order) {
            var relatedCurrProgs = this.findRelatedSequentialPrograms(this.state.currentProgramsData, currProgData.order)

            // Remove the other programs in the sequence from the athletes current programs. 
            relatedCurrProgs.forEach(relProg => {
                payLoad[currPath + relProg.programUID] = null
            })
        }


        payLoad[basePath + '/activeProgram'] = programName
        var pendingPath =
            basePath
            + '/pendingPrograms/'
            + programName

        payLoad[pendingPath] = null

        // console.log(payLoad)
        this.props.firebase.updateDatabaseFromRootPath(payLoad)
    }

    checkSameMetaParameters = (userObject, programName) => {
        var metaParameters = {
            'Loading Scheme': false,
            'Chronic Period': false,
            'Acute Period': false
        }
        if (!userObject.currentPrograms) {
            return metaParameters
        } else {
            if (!userObject.currentPrograms[programName]) {
                return metaParameters
            } else {
                if (userObject.currentPrograms[programName].loading_scheme === userObject.pendingPrograms[programName].loading_scheme) {
                    metaParameters['Loading Scheme'] = true
                }

                if (userObject.currentPrograms[programName].chronicPeriod === userObject.pendingPrograms[programName].chronicPeriod) {
                    metaParameters['Chronic Period'] = true
                }

                if (userObject.currentPrograms[programName].acutePeriod === userObject.pendingPrograms[programName].acutePeriod) {
                    metaParameters['Acute Period'] = true
                }
                if (metaParameters['Acute Period'] && metaParameters['Chronic Period'] && metaParameters['Loading Scheme']) {
                    return true
                }

                return metaParameters
            }

        }
    }

    initPendingProgramsTableData = (userObject) => {
        if (userObject.pendingPrograms) {
            var tableData = []

            Object.keys(userObject.pendingPrograms).forEach(programName => {
                var program = userObject.pendingPrograms[programName]
                var currentProgramInfo = this.programInCurrentPrograms(userObject, programName)
                // If the pending program is an unlimited program. 
                if (program.order === undefined) {
                    // If the current program is already in the athletes current programs data.
                    if (currentProgramInfo.inCurrProg) {
                        // Check if there is a metaParameter mismatch if there is. A full replace is required. Cannot migrate old program data to the new program. 
                        var noMetaParameterMismatch = this.checkSameMetaParameters(userObject, programName)

                        if (noMetaParameterMismatch === true) {

                            // If the program in current program is an unlimited program or is an active program is a current sequence. A migration option is offered.
                            if (currentProgramInfo.order === undefined || currentProgramInfo.isActiveInSequence === true) {
                                tableData.push({
                                    program: programName.split('_')[0],
                                    coach: userObject.teams[programName.split('_')[1]].username,
                                    relatedPrograms: 'None',
                                    programType: 'Stand-Alone',
                                    buttons:
                                        <div>
                                            <ReplaceProgramOptionsModal
                                                handleFormSubmit={this.handlePendingProgramReplacement}
                                                programUID={programName}
                                                currentDayInProgram={userObject.currentPrograms[programName].currentDayInProgram}
                                            />
                                            <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                        </div>
                                })
                            } else {
                                // If its not active in a sequence. Then a full replace is offered and it will be removed from the current sequence and changed to an unlimited program.  
                                tableData.push({
                                    program: programName.split('_')[0],
                                    coach: userObject.teams[programName.split('_')[1]].username,
                                    relatedPrograms: 'None',
                                    programType: 'Stand-Alone',
                                    buttons:
                                        <div>
                                            <OverrideReplaceProgramModal
                                                handleFormSubmit={this.handlePendingProgramRequestAcceptence}
                                                programUID={programName}
                                                currSeq={currentProgramInfo.order.split('_')[1]}
                                                modalType={'unlimPend->nonActiveSeqCurr'}
                                            />
                                            <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                        </div>
                                })
                            }
                        } else {
                            tableData.push({
                                program: programName.split('_')[0],
                                coach: userObject.teams[programName.split('_')[1]].username,
                                relatedPrograms: 'None',
                                programType: 'Stand-Alone',
                                buttons:
                                    <div>
                                        <OverrideReplaceProgramModal
                                            handleFormSubmit={this.handlePendingProgramRequestAcceptence}
                                            programUID={programName}
                                            mismatchedParams={noMetaParameterMismatch}
                                            modalType={'metaParamter-Mismatch'}
                                        />
                                        <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                    </div>
                            })
                        }
                    } else {
                        // If its not in past or current programs. 
                        tableData.push({
                            program: programName.split('_')[0],
                            coach: userObject.teams[programName.split('_')[1]].username,
                            relatedPrograms: 'None',
                            programType: 'Stand-Alone',
                            buttons:
                                <div>
                                    <AcceptRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                    <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                </div>
                        })
                    }

                } else {
                    // Only considers the first program in the sequence. This is what will be displayed on the front end. All logic will be considered below. 
                    if (program.order.split('_')[0] === '1') {

                        var relatedPrograms = this.findRelatedSequentialPrograms(userObject.pendingPrograms, program.order)

                        relatedPrograms.sort((a, b) => {
                            return parseInt(a.order.split('_')[0]) - parseInt(b.order.split('_')[0])
                        })
                        var sequenceProgramsInOrder = [
                            {
                                programUID: programName,
                                order: program.order
                            },
                            ...relatedPrograms
                        ]

                        var currProgSeqCheckData = this.checkSequenceProgramsInCurrentPrograms(
                            userObject, sequenceProgramsInOrder
                        )
                        var allSeqNotInCurrProgs = true

                        for (var program in currProgSeqCheckData) {
                            var checkData = currProgSeqCheckData[program]
                            if (checkData.inCurrProg) {
                                allSeqNotInCurrProgs = false
                                break
                            }
                        }

                        // If none of the program in the sequence is currently in the athletes current program. No special action is required. 
                        if (allSeqNotInCurrProgs) {
                            var numInSequence = 2
                            // If its not in past or current programs. 
                            tableData.push({
                                program: programName.split('_')[0],
                                coach: userObject.teams[programName.split('_')[1]].username,
                                programType: 'Sequential',
                                buttons:
                                    <div>
                                        <AcceptRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                        <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                    </div>,
                                relatedPrograms:
                                    <List>
                                        {
                                            relatedPrograms.map(relProgram => {

                                                let listHTML =
                                                    <List.Item key={relProgram.programUID}>
                                                        {numInSequence + ': ' + relProgram.programUID.split('_')[0]
                                                        }
                                                    </List.Item>

                                                numInSequence++
                                                return listHTML
                                            })
                                        }
                                    </List>
                            })
                        } else {
                            var numInSequence = 2
                            console.log(currProgSeqCheckData)

                            currProgSeqCheckData.forEach(prog => {
                                prog.sameMetaParams = this.checkSameMetaParameters(userObject, prog.programUID)
                            })

                            // If its not in past or current programs. 
                            tableData.push({
                                program: programName.split('_')[0],
                                coach: userObject.teams[programName.split('_')[1]].username,
                                programType: 'Sequential',
                                buttons:
                                    <div>
                                        <ReplaceProgramSequenceModal
                                            buttonHandler={this.handleAcceptOverlappingProgramSequence}
                                            sequenceOverlapData={currProgSeqCheckData}
                                        />
                                        <DeclineRequestButton
                                            buttonHandler={this.handlePendingProgramRequestAcceptence}
                                            objectUID={programName}
                                        />
                                    </div>,
                                relatedPrograms:
                                    <List>
                                        {
                                            relatedPrograms.map(relProgram => {

                                                let listHTML =
                                                    <List.Item key={relProgram.programUID}>
                                                        {numInSequence + ': ' + relProgram.programUID.split('_')[0]
                                                        }
                                                    </List.Item>

                                                numInSequence++
                                                return listHTML
                                            })
                                        }
                                    </List>
                            })
                        }
                    }
                }
            })
            return tableData
        } else {
            return undefined
        }
    }

    handleAcceptOverlappingProgramSequence = (firstProgReplacement, programData) => {
        var payLoad = {}
        var basePath =
            '/users/'
            + this.props.firebase.auth.currentUser.uid
        var pendingPath =
            basePath
            + '/pendingPrograms/'
        var currProgPath =
            basePath
            + '/currentPrograms/'

        var firstProgram = programData.shift()

        payLoad[pendingPath + firstProgram.programUID] = null
        // Generates the exact replacement data for the first program in the sequence. 
        if (firstProgReplacement === 'future') {
            var maxDay = 0
            Object.keys(this.state.pendingProgramsData[firstProgram.programUID
            ]).forEach(key => {
                if (parseInt(key)) {
                    if (parseInt(key) > maxDay) {
                        maxDay = key
                    }
                }
            })
            var path =
                currProgPath
                + firstProgram.programUID + '/'

            payLoad[path + 'isActiveInSequence'] = true
            payLoad[path + 'order'] = this.state.pendingProgramsData[firstProgram.programUID].order

            path += '/'

            for (var day = firstProgram.currentDayInProgram + 1; day <= maxDay; day++) {
                (this.state.pendingProgramsData[firstProgram.programUID][day]) ?
                    payLoad[path + day.toString()] = this.state.pendingProgramsData[firstProgram.programUID][day]
                    : payLoad[path + day.toString()] = {}
            }

        } else {
            // This will account for a new program that doesn't currently exist in current programs or a full replace of the program selected by the user.
            var path =
                currProgPath
                + firstProgram.programUID

            payLoad[path] = this.state.pendingProgramsData[firstProgram.programUID]
        }

        payLoad[basePath + '/activeProgram'] = firstProgram.programUID
        // If the program you're replacement is also first in it's sequence. Iterate through current programs to find the associate sequence programs for deletion. 
        console.log(firstProgram)
        if (firstProgram.order) {
            var relatedSeqProgs = this.findRelatedSequentialPrograms(this.state.currentProgramsData, firstProgram.order)

            relatedSeqProgs.forEach(relProg => {
                if (!this.programInRelatedProgList(programData, relProg.programUID)) {
                    payLoad[currProgPath + relProg.programUID] = null
                }
            })
        }

        programData.forEach(program => {

            payLoad[pendingPath + program.programUID] = null

            payLoad[currProgPath + program.programUID] = this.state.pendingProgramsData[program.programUID]

            if (program.order !== undefined &&
                program.isActiveInSequence) {
                var relatedCurrPrograms = this.findRelatedSequentialPrograms(this.state.currentProgramsData, program.order)

                var relatedPendPrograms = this.findRelatedSequentialPrograms(this.state.pendingProgramsData, this.state.pendingProgramsData[program.programUID].order)

                relatedCurrPrograms.forEach(relProg => {
                    if (!this.programInRelatedProgList(relatedPendPrograms, relProg.programUID)) {
                        payLoad[currProgPath + relProg.programUID] = null
                    }
                })
            }
        })
        // console.log(payLoad)
        this.props.firebase.updateDatabaseFromRootPath(payLoad)
    }

    programInRelatedProgList = (list, program) => {

        for (var prog in list) {
            if (list[prog].programUID === program) {
                return true
            }
        }
        return false
    }

    checkSequenceProgramsInCurrentPrograms = (userObject, sequencePrograms) => {
        var payLoad = []
        sequencePrograms.forEach(program => {
            payLoad.push(this.programInCurrentPrograms(userObject, program.programUID))
        })

        return (payLoad)
    }

    handlePendingProgramRequestAcceptence = (programName, isAccepted) => {
        var payLoad = {}
        var basePath = '/users/'
            + this.props.firebase.auth.currentUser.uid
        var pendingPath = basePath + '/pendingPrograms/'

        if (isAccepted) {
            var currProgPath =
                basePath
                + '/currentPrograms/'

            payLoad[basePath + '/activeProgram'] = programName
            payLoad[currProgPath + programName] = this.state.pendingProgramsData[programName]
            payLoad[pendingPath + programName] = null

            if (this.state.pendingProgramsData[programName].order) {

                var relatedProgs = this.findRelatedSequentialPrograms(
                    this.state.pendingProgramsData,
                    this.state.pendingProgramsData[programName].order
                )

                relatedProgs.forEach(relatedProgram => {
                    payLoad[currProgPath + relatedProgram.programUID] = this.state.pendingProgramsData[relatedProgram.programUID]

                    payLoad[pendingPath + relatedProgram.programUID] = null
                })
            }

        } else {

            payLoad[pendingPath + programName] = null

            if (this.state.pendingProgramsData[programName].order) {

                var relatedProgs = this.findRelatedSequentialPrograms(
                    this.state.pendingProgramsData,
                    this.state.pendingProgramsData[programName].order
                )

                relatedProgs.forEach(relatedProgram => {
                    payLoad[pendingPath + relatedProgram.programUID] = null
                })
            }
        }

        this.props.firebase.processPendingProgramsUpstream(payLoad)

    }

    checkIfProgramAlreadyExists(newProgram) {
        var nameToCheck = newProgram.split('_')[0] + '_' + newProgram.split('_')[1]
        if (this.state.currentProgramList.length > 0) {
            for (var program in this.state.currentProgramList) {
                var currProgName = this.state.currentProgramList[program]
                currProgName = currProgName.split('_')[0] + '_' + currProgName.split('_')[1]

                if (currProgName === nameToCheck) {
                    return true
                }
            }
        }

        if (this.state.pastProgramList.length > 0) {
            for (program in this.state.pastProgramList) {
                var currProgName = this.state.pastProgramList[program]
                currProgName = currProgName.split('_')[0] + '_' + currProgName.split('_')[1]

                if (currProgName === nameToCheck) {
                    return true
                }
            }
        }

        return false

    }

    handleCreateProgram = async (programName, acutePeriod, chronicPeriod, loadingScheme, date, goalList) => {

        this.setState({
            pageBodyContentLoading: true
        }, () => {


            // Creates a unique name for a program. Input name + coach UID + timestamp of creation.
            var timestamp = new Date().getTime()
            programName = programName.trim()


            // if (this.checkIfProgramAlreadyExists(programName)) {
            //     alert('Program with name "' + programName.split('_')[0] + '" already exists in either your current or past programs.')
            // } else {

            var payLoad = {
                name: programName,
                owner: this.props.firebase.auth.currentUser.uid,
                acutePeriod: acutePeriod,
                chronicPeriod: chronicPeriod,
                loadingScheme: loadingScheme,
                creationDate: timestamp,
                currentDay: 1,
                status: 'current'

            }

            var goalListArr = []

            if (this.state.user.getUserType() === 'athlete') {
                Object.values(goalList).forEach(goal => {
                    var formattedObj = goal.getFormattedGoalObject()
                    formattedObj.programUID =
                        programName + '_' + this.props.firebase.auth.currentUser.uid + '_' + timestamp

                    goalListArr.push(formattedObj)
                })

                var dateConversion = date.split('-')

                dateConversion = dateConversion[2] + '-' + dateConversion[1] + '-' + dateConversion[0]

                const startTimestamp = Math.floor(new Date(dateConversion).getTime())

                payLoad.athlete = this.props.firebase.auth.currentUser.uid

                payLoad.team = 'none'

                payLoad.startDayUTS = startTimestamp
            }

            if (goalListArr.length === 0) {
                goalListArr = undefined
            }

            var newProg = createProgramObject(payLoad)

            this.state.nonPendingProgList.addProgStart(newProg)
            this.state.currProgList.addProgStart(newProg)

            let newTableData = this.initProgramTableData(
                this.state.nonPendingProgList,
                this.state.editMode
            )

            this.setState(prev => ({
                ...prev,
                progManageTableData: newTableData,
                pageBodyContentLoading: false
            }))

            console.log(payLoad)

            this.props.firebase.createProgramDB(
                newProg.generateProgramUID(),
                payLoad,
                goalListArr
            )
        })
    }

    toggleEditPrograms = () => {


        this.setState({
            pageBodyContentLoading: true
        }, () => {

            var newTableData = this.initProgramTableData(
                this.state.nonPendingProgList,
                !this.state.editMode
            )


            this.setState(prev => ({
                ...prev,
                editMode: !this.state.editMode,
                progManageTableData: newTableData,
                pageBodyContentLoading: false
            }))
        })


    }

    handleDeleteProgram = (programUID) => {
        this.setState({
            pageBodyContentLoading: true
        }, () => {

            var progObj = this.state.nonPendingProgList.getProgram(programUID)

            this.state.nonPendingProgList.removeProgram(programUID)

            if (progObj.getStatus === 'current') {
                this.state.currProgList.removeProgram(programUID)
            } else if (progObj.getStatus() === 'past') {
                this.state.pastProgList.removeProgram(programUID)
            }

            let newTableData = this.initProgramTableData(
                this.state.nonPendingProgList,
                this.state.editMode
            )

            this.setState(prev => ({
                ...prev,
                pageBodyContentLoading: false,
                progManageTableData: newTableData
            }))

            this.props.firebase.deleteProgramDB(programUID)
        })
    }

    handleCreateProgramGroup = (groupName, programData) => {

        var payLoad = {
            sequential: false,
            unlimited: false
        }

        if (programData.unlimited) {
            var programArray = []
            programData.unlimited.forEach(program => {
                programArray.push(program.programUID)
            })
            payLoad.unlimited = programArray

        }

        if (programData.sequential) {
            var programObj = {}
            var timestamp = new Date().getTime()

            programData.sequential.forEach(program => {

                programObj[program.programUID] =
                    program.order
                    + '_' + programData.sequenceName
                    + '_' + 'none'
                    + '_' + this.props.firebase.auth.currentUser.uid
                    + '_' + timestamp
            })

            payLoad.sequential = programObj
        }


        console.log(groupName)
        console.log(payLoad)

        // this.props.firebase.createProgramGroupUpstream(
        //     this.props.firebase.auth.currentUser.uid,
        //     groupName,
        //     payLoad
        // )

    }
    render() {
        const {
            loading,
            user,
            nonPendingList,
            pendingList,
            progManageTableData,
            progManageTableColumns,
            view,
            pageBodyContentLoading,
            currProgram
        } = this.state
        console.log(user)
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    <div id='mainContainerHeaderDiv'>
                        <div id='mainHeaderText'>
                            Program Management
                        </div>
                        {
                            view === 'home' &&
                            <div id='hpBtnContainer' >
                                <div id='hpLeftBtnContainer'>
                                    <Button
                                        className='lightPurpleButton-inverted'
                                        onClick={() => { this.toggleEditPrograms() }}
                                    >
                                        Edit Programs
                                </Button>
                                </div>
                                <div id='hpMidBtnContainer'>
                                    {
                                        user &&
                                        <CreateProgramModal
                                            handleFormSubmit={this.handleCreateProgram}
                                            userType={user.getUserType()}
                                        />
                                    }
                                </div>
                                {
                                    user && user.getUserType() === 'coach' &&
                                    <div id='hpRightBtnContainer'>
                                        <CreateProgramGroupModal
                                            programTableData={progManageTableData}
                                            handleFormSubmit={this.handleCreateProgramGroup}
                                        />
                                    </div>
                                }

                            </div>
                        }

                        {
                            pendingList && !pendingList.isEmptyList() &&
                            <div id='pendingProgramsModalContainer'>
                                {/* <ManagePendingProgramsModal
                                    programTableData={pendingProgramsTableData}
                                    numPrograms={pendingList.countPrograms()}
                                /> */}
                            </div>
                        }
                    </div>
                </div>
                {
                    view !== 'home' &&
                    <div className='rowContainer clickableDiv'>
                        <Button
                            content='Back'
                            className='backButton-inverted'
                            circular
                            icon='arrow left'
                            onClick={() => { this.handleBackClick(view) }}
                        />
                    </div>
                }
                {
                    view === 'home' &&
                    <div className="pageContainerLevel1">
                        <BasicTable
                            data={progManageTableData}
                            columns={progManageTableColumns}
                        />
                    </div>
                }
                {
                    view === 'programHomeView' && currProgram &&
                    <ProgramView
                        data={currProgram.programData}
                        availExData={currProgram.availExData}
                        availExColumns={currProgram.availExColumns}
                        rawAnatomyData={currProgram.rawAnatomyData}
                        nullExerciseData={currProgram.nullExerciseData}
                        handlerFunctions={currProgram.viewProgramFunctions}
                    />

                }
            </NonLandingPageWrapper>

        let pageBodyContentLoadingHTML =
            <NonLandingPageWrapper>
                <div className='vert-aligned'>
                    <Loader active inline='centered' content='Preparing Program Data...' />
                </div>

            </NonLandingPageWrapper>

        return (

            <div>
                {loading && !pageBodyContentLoading && loadingHTML}
                {!loading && !pageBodyContentLoading && nonLoadingHTML}
                {!loading && pageBodyContentLoading && pageBodyContentLoadingHTML}
            </div>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageProgramsPage)