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
import ProgramView, { ProgramViewPageSubHeader } from '../CustomComponents/programView'
import { capitaliseFirstLetter, underscoreToSpaced } from '../../constants/stringManipulation';
import { calculateDailyLoads } from '../CurrentProgram/calculateWeeklyLoads'

class ManageProgramsPage extends Component {

    constructor(props) {
        super(props)

        this.PAGE_VIEWS = {
            HOME: 'home',
            PROG_VIEW_HOME: 'programHomeView'
        }

        this.state = {
            programManagementTableData: [],
            programManagementTableColumns: [],
            loading: true
        }
    }

    componentDidMount() {
        this.setState({ loading: true }, () => {
            this.props.firebase.getUser(this.props.firebase.auth.currentUser.uid)
                .then(snapshot => {
                    var userInfo = snapshot.data()

                    var userObject = createUserObject(
                        this.props.firebase.auth.currentUser.uid,
                        userInfo
                    )

                    this.props.firebase.getUserPrograms(userObject.getID(), userObject.getUserType())
                        .then(snapshot => {
                            var nonPendingPrograms = []
                            var pendingPrograms = []
                            var currentPrograms = []
                            var pastPrograms
                            if (snapshot.length === 0) {
                                nonPendingPrograms = []
                                pendingPrograms = []
                            } else {
                                snapshot.forEach(prog => {
                                    var progObj = createProgramObject(prog)
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
                                view: this.PAGE_VIEWS.HOME,
                                pageHistory: new PageHistory(),
                                editMode: false,
                                currProgram: undefined,
                                pageBodyContentLoading: false,
                                loading: false

                            })
                        })
                })
                .catch(error => {
                    console.log(error)
                })
        });
    }


    handleBackClick = () => {
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
        console.log(programList)
        var payload = []
        if (!editMode) {
            programList.getProgramList().forEach(prog => {
                payload.push({
                    program: prog.getName(),
                    programUID: prog.generateProgramUID(),
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
                payload.push({
                    program: prog.getName(),
                    loadingScheme: loadingSchemeString(prog.getLoadingScheme()),
                    programUID: prog.generateProgramUID(),
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

        return payload
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

                            Promise.all(this.props.firebase.getProgramExGoalData(programUID))
                                .then(snapshot => {
                                    var progData = this.state.nonPendingProgList.getProgram(programUID).generateCompleteJSONObject()

                                    if (Object.keys(snapshot[0]).length > 0) {
                                        progData.goals = snapshot[0]
                                    }

                                    progData = { ...progData, ...snapshot[1] }

                                    console.log(progData)

                                    this.state.pageHistory.next(this.state.view)

                                    this.setState(prev => ({
                                        ...prev,
                                        view: this.PAGE_VIEWS.PROG_VIEW_HOME,
                                        pageBodyContentLoading: false,
                                        currProgram: {
                                            programUID: programUID,
                                            availExData: exList,
                                            availExColumns: setAvailExerciseCols(),
                                            programData: progData,
                                            submitProcessingBackend: false,
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
                                                handleStartProgram: this.handleStartProgram,
                                                handleEditGoal: this.handleEditGoal,
                                                handleDeleteGoal: this.handleDeleteGoal,
                                                handleCompleteGoal: this.handleCompleteGoal,
                                                handleCreateSubGoal: this.handleCreateSubGoal,
                                                handleCreateMainGoal: this.handleCreateMainGoal,
                                                handleCopyPrevWeekExData: this.handleCopyPrevWeekExData
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

    handleCopyPrevWeekExData = (payload) => {

        this.props.firebase.copyExerciseDataDB(
            this.state.currProgram.programUID,
            payload
        )
    }

    handleCreateMainGoal = (mainGoalDBUID, payload) => {
        payload.goalProgUID = mainGoalDBUID
        payload.programUID = this.state.currProgram.programUID

        if (Object.keys(payload.subGoals).length === 0) {
            delete payload.subGoals
        }

        this.props.firebase.createMainGoalDB(payload)

    }

    handleCompleteGoal = (payload) => {
        this.props.firebase.changeGoalCompletionStatusDB(
            this.state.currProgram.programUID,
            payload.mainGoalDBUID,
            payload
        )
    }

    handleDeleteGoal = (payload) => {
        this.props.firebase.deleteGoalDB(
            this.state.currProgram.programUID,
            payload
        )
    }

    handleEditGoal = (payload) => {
        this.props.firebase.editGoalDB(
            this.state.currProgram.programUID,
            payload
        )
    }

    handleCreateSubGoal = (payload) => {
        this.props.firebase.createSubGoalDB(
            this.state.currProgram.programUID,
            payload
        )
    }


    handleDeleteExerciseButton = (id) => {

        var exUID = id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        var day = exUID.split('_').reverse()[1]
        this.props.firebase.deleteExerciseDB(
            this.state.currProgram.programUID,
            day,
            exUID
        )
    }

    handleUpdateExercise = (updateObject) => {

        var day = updateObject.exUid.split('_').reverse()[1]
        if (this.state.currProgram.programData.loadingScheme === 'rpe_time') {
            console.log("going in ")
            var dataPayload = {
                exercise: updateObject.exercise,
                rpe: updateObject.rpe,
                sets: updateObject.sets,
                time: updateObject.time,
                reps: updateObject.reps,
                primMusc: updateObject.primMusc
            }
        } else {
            dataPayload = {
                exercise: updateObject.exercise,
                time: updateObject.time,
                sets: updateObject.sets,
                rpe: updateObject.rpe,
                weight: updateObject.weight,
                reps: updateObject.reps,
                primMusc: updateObject.primMusc
            }
        }

        this.props.firebase.updateExerciseDB(
            this.state.currProgram.programUID,
            day,
            updateObject.exUid,
            dataPayload
        )
    }

    handleAddExerciseButton = (exerciseObject, exUID, loadingScheme, insertionDay) => {

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

        var payload = {}
        payload[exUID] = dataPayload

        console.log(payload)
        console.log(this.state.currProgram.programUID)

        this.props.firebase.addExerciseDB(
            this.state.currProgram.programUID,
            insertionDay,
            payload
        )

    }

    handleSubmitButton = () => {
        // Get the current exercise data for the given week.
        // And for the current active program.

        this.setState(prevState => ({
            currProgram: {
                ...prevState.currProgram,
                submitProcessingBackend: true
            }
        }), () => {
            this.props.firebase.getProgramExData(
                this.state.currProgram.programUID
            )
                .then(snapshot => {

                    var programClass = this.state.nonPendingProgList.getProgram(this.state.currProgram.programUID)

                    var programObject = programClass.generateCompleteJSONObject()

                    programObject = { ...programObject, ...snapshot }
                    console.log(programObject)

                    var dataCheck = checkNullExerciseData(
                        programObject[programObject.currentDay],
                        programObject.loadingScheme
                    )
                    console.log(dataCheck)
                    if (dataCheck.allValid) {
                        var processedDayData = calculateDailyLoads(
                            programObject,
                            programObject.currentDay,
                            programObject.loadingScheme,
                            programObject.acutePeriod,
                            programObject.chronicPeriod,
                            this.state.currProgram.rawAnatomyData
                        )

                        this.props.firebase.submitDayDB(
                            this.state.currProgram.programUID,
                            programObject.currentDay,
                            processedDayData
                        )
                            .then(() => {

                                this.state.nonPendingProgList.getProgram(this.state.currProgram.programUID).iterateCurrentDay(1)

                                var frontEndProgData = { ...programObject }

                                frontEndProgData[programObject.currentDay]['loadingData'] = processedDayData

                                frontEndProgData.currentDay += 1

                                this.setState(prevState => ({
                                    ...prevState,
                                    currProgram: {
                                        ...prevState.currProgram,
                                        submitProcessingBackend: false,
                                        programData: frontEndProgData
                                    }
                                }))
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    } else {

                        this.setState(prevState => ({
                            ...prevState,
                            currProgram: {
                                ...prevState.currProgram,
                                submitProcessingBackend: false,
                                nullExerciseData: {
                                    hasNullData: true,
                                    nullTableData: dataCheck.exercisesToCheck
                                },
                                pendingLoadSubmissionData: programObject
                            }
                        }))
                    }
                })
        })
    }

    handleNullCheckProceed = (proceed) => {
        if (proceed) {
            var programObject = this.state.currProgram.pendingLoadSubmissionData

            var processedDayData = calculateDailyLoads(
                programObject,
                programObject.currentDay,
                programObject.loadingScheme,
                programObject.acutePeriod,
                programObject.chronicPeriod,
                this.state.currProgram.rawAnatomyData
            )

            var frontEndProgData = { ...programObject }

            frontEndProgData[programObject.currentDay]['loadingData'] = processedDayData

            frontEndProgData.currentDay += 1

            this.props.firebase.submitDayDB(
                this.state.currProgram.programUID,
                programObject.currentDay,
                processedDayData
            )
                .then(() => {

                    this.state.nonPendingProgList.getProgram(this.state.currProgram.programUID).iterateCurrentDay(1)

                    var frontEndProgData = { ...programObject }

                    frontEndProgData[programObject.currentDay]['loadingData'] = processedDayData

                    frontEndProgData.currentDay += 1

                    this.setState(prevState => ({
                        ...prevState,
                        currProgram: {
                            ...prevState.currProgram,
                            submitProcessingBackend: false,
                            nullExerciseData: {
                                hasNullData: false,
                                nullTableData: []
                            },
                            programData: frontEndProgData,
                            pendingLoadSubmissionData: undefined

                        }
                    }))
                })
                .catch(error => {
                    console.log(error)
                })

        } else {
            this.setState(prevState => ({
                ...prevState,
                currProgram: {
                    ...prevState.currProgram,
                    submitProcessingBackend: false,
                    nullExerciseData: {
                        hasNullData: false,
                        nullTableData: []
                    },
                    pendingLoadSubmissionData: undefined
                }
            }))
        }
    }

    handleStartProgram = (startDateUTS) => {
        console.log('start program')
        this.props.firebase.startProgramDB(
            this.state.currProgram.programUID,
            startDateUTS
        )
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
            var payload = {}
            for (var day = currentDayInProgram + 1; day <= maxDay; day++) {

                (this.state.pendingProgramsData[programName][day]) ?
                    payload[path + day.toString()] = this.state.pendingProgramsData[programName][day]
                    : payload[path + day.toString()] = {}
            }

            if (this.state.currentProgramsData[programName].order) {
                payload[path + 'isActiveInSequence'] = null
                payload[path + 'order'] = null
            }

        } else {
            var path =
                currPath
                + programName

            var payload = {}

            payload[path] = this.state.pendingProgramsData[programName]
        }

        // Handle the behaviour of the current program sequences data.
        var currProgData = this.state.currentProgramsData[programName]
        if (currProgData.order) {
            var relatedCurrProgs = this.findRelatedSequentialPrograms(this.state.currentProgramsData, currProgData.order)

            // Remove the other programs in the sequence from the athletes current programs. 
            relatedCurrProgs.forEach(relProg => {
                payload[currPath + relProg.programUID] = null
            })
        }


        payload[basePath + '/activeProgram'] = programName
        var pendingPath =
            basePath
            + '/pendingPrograms/'
            + programName

        payload[pendingPath] = null

        // console.log(payload)
        this.props.firebase.updateDatabaseFromRootPath(payload)
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
        var payload = {}
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

        payload[pendingPath + firstProgram.programUID] = null
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

            payload[path + 'isActiveInSequence'] = true
            payload[path + 'order'] = this.state.pendingProgramsData[firstProgram.programUID].order

            path += '/'

            for (var day = firstProgram.currentDayInProgram + 1; day <= maxDay; day++) {
                (this.state.pendingProgramsData[firstProgram.programUID][day]) ?
                    payload[path + day.toString()] = this.state.pendingProgramsData[firstProgram.programUID][day]
                    : payload[path + day.toString()] = {}
            }

        } else {
            // This will account for a new program that doesn't currently exist in current programs or a full replace of the program selected by the user.
            var path =
                currProgPath
                + firstProgram.programUID

            payload[path] = this.state.pendingProgramsData[firstProgram.programUID]
        }

        payload[basePath + '/activeProgram'] = firstProgram.programUID
        // If the program you're replacement is also first in it's sequence. Iterate through current programs to find the associate sequence programs for deletion. 
        console.log(firstProgram)
        if (firstProgram.order) {
            var relatedSeqProgs = this.findRelatedSequentialPrograms(this.state.currentProgramsData, firstProgram.order)

            relatedSeqProgs.forEach(relProg => {
                if (!this.programInRelatedProgList(programData, relProg.programUID)) {
                    payload[currProgPath + relProg.programUID] = null
                }
            })
        }

        programData.forEach(program => {

            payload[pendingPath + program.programUID] = null

            payload[currProgPath + program.programUID] = this.state.pendingProgramsData[program.programUID]

            if (program.order !== undefined &&
                program.isActiveInSequence) {
                var relatedCurrPrograms = this.findRelatedSequentialPrograms(this.state.currentProgramsData, program.order)

                var relatedPendPrograms = this.findRelatedSequentialPrograms(this.state.pendingProgramsData, this.state.pendingProgramsData[program.programUID].order)

                relatedCurrPrograms.forEach(relProg => {
                    if (!this.programInRelatedProgList(relatedPendPrograms, relProg.programUID)) {
                        payload[currProgPath + relProg.programUID] = null
                    }
                })
            }
        })
        // console.log(payload)
        this.props.firebase.updateDatabaseFromRootPath(payload)
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
        var payload = []
        sequencePrograms.forEach(program => {
            payload.push(this.programInCurrentPrograms(userObject, program.programUID))
        })

        return (payload)
    }

    handlePendingProgramRequestAcceptence = (programName, isAccepted) => {
        var payload = {}
        var basePath = '/users/'
            + this.props.firebase.auth.currentUser.uid
        var pendingPath = basePath + '/pendingPrograms/'

        if (isAccepted) {
            var currProgPath =
                basePath
                + '/currentPrograms/'

            payload[basePath + '/activeProgram'] = programName
            payload[currProgPath + programName] = this.state.pendingProgramsData[programName]
            payload[pendingPath + programName] = null

            if (this.state.pendingProgramsData[programName].order) {

                var relatedProgs = this.findRelatedSequentialPrograms(
                    this.state.pendingProgramsData,
                    this.state.pendingProgramsData[programName].order
                )

                relatedProgs.forEach(relatedProgram => {
                    payload[currProgPath + relatedProgram.programUID] = this.state.pendingProgramsData[relatedProgram.programUID]

                    payload[pendingPath + relatedProgram.programUID] = null
                })
            }

        } else {

            payload[pendingPath + programName] = null

            if (this.state.pendingProgramsData[programName].order) {

                var relatedProgs = this.findRelatedSequentialPrograms(
                    this.state.pendingProgramsData,
                    this.state.pendingProgramsData[programName].order
                )

                relatedProgs.forEach(relatedProgram => {
                    payload[pendingPath + relatedProgram.programUID] = null
                })
            }
        }

        this.props.firebase.processPendingProgramsUpstream(payload)

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

            var payload = {
                name: programName,
                owner: this.props.firebase.auth.currentUser.uid,
                acutePeriod: acutePeriod,
                chronicPeriod: chronicPeriod,
                loadingScheme: loadingScheme,
                creationDate: timestamp,
                currentDay: 1,
                status: 'current',
                programUID:
                    programName
                    + '_' + this.props.firebase.auth.currentUser.uid
                    + '_' + timestamp

            }

            var goalListArr = []

            if (this.state.user.getUserType() === 'athlete') {
                var index = 1
                Object.values(goalList).forEach(goal => {
                    var formattedObj = goal.getFormattedGoalObject()

                    if (Object.keys(formattedObj.subGoals).length === 0) {
                        delete formattedObj.subGoals
                    }

                    formattedObj.programUID =
                        programName + '_' + this.props.firebase.auth.currentUser.uid + '_' + timestamp
                    formattedObj.goalProgUID = 'Goal_' + index.toString()
                    goalListArr.push(formattedObj)
                    index++
                })

                var dateConversion = date.split('-')

                dateConversion = dateConversion[2] + '-' + dateConversion[1] + '-' + dateConversion[0]

                const startTimestamp = Math.floor(new Date(dateConversion).getTime())

                payload.athlete = this.props.firebase.auth.currentUser.uid

                payload.team = 'none'

                payload.startDayUTS = startTimestamp
            }

            if (goalListArr.length === 0) {
                goalListArr = undefined
            }

            var newProg = createProgramObject(payload)

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

            console.log(payload)

            this.props.firebase.createProgramDB(
                payload,
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

            this.props.firebase.deleteProgramDB(
                programUID,
                this.state.user.getUserType(),
                this.state.user.getID()
            )
        })
    }

    handleCreateProgramGroup = (groupName, programData) => {

        console.log(groupName)
        console.log(programData)
        var payload = {
            sequential: false,
            unlimited: false
        }

        if (programData.unlimited) {
            var programArray = []
            programData.unlimited.forEach(program => {
                programArray.push(program.programUID)
            })
            payload.unlimited = programArray

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

            payload.sequential = programObj
        }

        this.props.firebase.createProgramGroupDB(
            this.props.firebase.auth.currentUser.uid,
            groupName,
            payload
        )
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
        console.log(currProgram)
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
                            view === this.PAGE_VIEWS.HOME &&
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
                            view === this.PAGE_VIEWS.PROG_VIEW_HOME &&
                            <ProgramViewPageSubHeader
                                data={currProgram.programData}
                                programUID={currProgram.programUID}
                            />
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
                    view !== this.PAGE_VIEWS.HOME &&
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
                    view === this.PAGE_VIEWS.HOME &&
                    <div className="pageContainerLevel1">
                        <BasicTable
                            data={progManageTableData}
                            columns={progManageTableColumns}
                        />
                    </div>
                }
                {
                    view === this.PAGE_VIEWS.PROG_VIEW_HOME && currProgram &&
                    <ProgramView
                        userType={user.getUserType()}
                        data={currProgram.programData}
                        availExData={currProgram.availExData}
                        availExColumns={currProgram.availExColumns}
                        rawAnatomyData={currProgram.rawAnatomyData}
                        nullExerciseData={currProgram.nullExerciseData}
                        handlerFunctions={currProgram.viewProgramFunctions}
                        submitProcessingBackend={currProgram.submitProcessingBackend}
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