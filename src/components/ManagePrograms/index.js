import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List, Button } from 'semantic-ui-react'

import CreateProgramModal from './createProgramModal'
import CreateProgramGroupModal from './createProgramGroupModal'
import loadingSchemeString, { loadingSchemeStringInverse } from '../../constants/loadingSchemeString'
import ManageProgramTables from './manageProgramTables'
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
import { create, thomsonCrossSectionDependencies } from 'mathjs';

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

                                    if (progObj.getStatus() === 'current') {
                                        currentPrograms.push(progObj)
                                    } else if (progObj.getStatus() === 'past') {
                                        pastPrograms.push(progObj)
                                    } else {
                                        pendingPrograms.push(progObj)
                                    }

                                    // if (progObj.getStatus() === 'pending') {
                                    //     pendingPrograms.push(progObj)
                                    // } else {
                                    //     nonPendingPrograms.push(progObj)

                                    //     if (progObj.getStatus() === 'current') {
                                    //         currentPrograms.push(progObj)
                                    //     } else if (progObj.getStatus() === 'past') {
                                    //         pastPrograms.push(progObj)
                                    //     }
                                    // }
                                })
                            }

                            // var nonPendingList = new ProgramList(nonPendingPrograms)

                            var pendingList = new ProgramList(pendingPrograms)

                            var currProgList = new ProgramList(currentPrograms)

                            var pastProgList = new ProgramList(pastPrograms)

                            console.log(currProgList)
                            console.log(pendingList)
                            console.log(pastProgList)

                            this.setState({
                                user: userObject,
                                currProgList: currProgList,
                                pastProgList: pastProgList,
                                pendingProgList: pendingList,
                                pendingProgTableData: this.initPendingProgramTableData(pendingList, currProgList),
                                currentProgTableData: this.initCurrentProgramTableData(currProgList, false, userObject.getUserType()),
                                pastProgTableData: this.initPastProgramTableData(pastProgList, false),
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

    initCurrentProgramTableData = (programList, editMode, userType) => {
        if (programList.isEmptyList()) {
            return undefined
        } else {
            var payload = {
                columns: this.currentProgTableColumns(userType),
                data: []
            }

            if (!editMode) {
                programList.getProgramList().forEach(prog => {
                    // if (prog.isActiveInSequence !== false) {
                    payload.data.push({
                        program: prog.getName(),
                        programUID: prog.generateProgramUID(),
                        loadingScheme: loadingSchemeString(prog.getLoadingScheme()),
                        acutePeriod: prog.getAcutePeriod(),
                        chronicPeriod: prog.getChronicPeriod(),
                        buttons:
                            <Button
                                className='lightPurpleButton-inverted'
                                onClick={() => { this.handleProgramClick(prog.generateProgramUID(), prog.getStatus()) }}
                            >
                                View Program
                        </Button>

                    })
                    // }

                })
            } else {
                programList.getProgramList().forEach(prog => {
                    if (prog.isActiveInSequence !== false) {

                        payload.data.push({
                            program: prog.getName(),
                            loadingScheme: loadingSchemeString(prog.getLoadingScheme()),
                            programUID: prog.generateProgramUID(),
                            acutePeriod: prog.getAcutePeriod(),
                            chronicPeriod: prog.getChronicPeriod(),
                            buttons:
                                <>
                                    <Button
                                        className='lightPurpleButton-inverted'
                                        onClick={() => { this.handleProgramClick(prog.generateProgramUID(), prog.getStatus()) }}
                                    >
                                        View Program
                            </Button>
                                    <Button
                                        className='lightRedButton-inverted'
                                        onClick={() => { this.handleDeleteProgram(prog.generateProgramUID(), prog.getStatus()) }}
                                    >
                                        Delete Program
                            </Button>
                                </>
                        })
                    }
                })
            }

            return payload
        }
    }

    initPendingProgramTableData = (programList, currProgList) => {
        if (programList.isEmptyList()) {
            return undefined
        } else {

            var payload = {
                columns: [
                    {
                        Header: 'Program',
                        accessor: 'program'
                    },
                    {
                        Header: 'Coach',
                        accessor: 'coach'
                    },
                    {
                        Header: 'Related Programs',
                        accessor: 'relatedPrograms'
                    },
                    {
                        Header: 'Program Type',
                        accessor: 'programType'
                    },
                    {
                        accessor: 'buttons'
                    }
                ],
                data: this.generatePendingTableData(programList, currProgList)
            }
            return payload
        }
    }

    initPastProgramTableData = (list, editMode) => {
        if (list.isEmptyList()) {
            return undefined
        } else {

        }
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
                            onClick={() => { this.handleProgramClick(prog.generateProgramUID(), prog.getStatus()) }}
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
                                onClick={() => { this.handleProgramClick(prog.generateProgramUID(), prog.getStatus()) }}
                            >
                                View Program
                            </Button>
                            <Button
                                className='lightRedButton-inverted'
                                onClick={() => { this.handleDeleteProgram(prog.generateProgramUID(), prog.getStatus()) }}
                            >
                                Delete Program
                            </Button>
                        </>
                })
            })
        }

        return payload
    }

    handleProgramClick = (programUID, status) => {

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

                            Promise.all(this.props.firebase.getProgramExGoalData(
                                this.state.user.getUserType() === 'coach',
                                this.state.user.getID(),
                                programUID,
                                status
                            ))
                                .then(snapshot => {
                                    let progData
                                    if (status === 'current') {
                                        progData = this.state.currProgList.getProgram(programUID).generateCompleteJSONObject()

                                    } else if (status === 'past') {
                                        progData = this.state.pastProgList.getProgram(programUID).generateCompleteJSONObject()
                                    }

                                    if (Object.keys(snapshot[0]).length > 0) {
                                        progData.goals = snapshot[0]
                                    }

                                    progData = { ...progData, ...snapshot[1] }

                                    this.state.pageHistory.next(this.state.view)

                                    this.setState(prev => ({
                                        ...prev,
                                        view: this.PAGE_VIEWS.PROG_VIEW_HOME,
                                        pageBodyContentLoading: false,
                                        currProgram: {
                                            programUID: programUID,
                                            status: status,
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
            this.state.user.getUserType() === 'coach',
            this.props.firebase.auth.currentUser.uid,
            this.state.currProgram.programUID,
            payload
        )
    }

    handleCreateMainGoal = (mainGoalDBUID, payload) => {
        payload.goalProgUID = mainGoalDBUID
        payload.programUID = this.state.currProgram.programUID
        payload.athleteUID = this.props.firebase.auth.currentUser.uid
        payload.programStatus = 'current'

        if (Object.keys(payload.subGoals).length === 0) {
            delete payload.subGoals
        }

        this.props.firebase.createMainGoalDB(payload)

    }

    handleCompleteGoal = (payload) => {
        this.props.firebase.changeGoalCompletionStatusDB(
            this.state.currProgram.programUID,
            payload.mainGoalDBUID,
            payload,
            this.props.firebase.auth.currentUser.uid
        )
    }

    handleDeleteGoal = (payload) => {
        this.props.firebase.deleteGoalDB(
            this.state.currProgram.programUID,
            payload,
            this.props.firebase.auth.currentUser.uid
        )
    }

    handleEditGoal = (payload) => {
        this.props.firebase.editGoalDB(
            this.state.currProgram.programUID,
            payload,
            this.props.firebase.auth.currentUser.uid
        )
    }

    handleCreateSubGoal = (payload) => {
        this.props.firebase.createSubGoalDB(
            this.state.currProgram.programUID,
            payload,
            this.props.firebase.auth.currentUser.uid
        )
    }


    handleDeleteExerciseButton = (id) => {

        var exUID = id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        var day = exUID.split('_').reverse()[1]
        this.props.firebase.deleteExerciseDB(
            this.state.user.getUserType() === 'coach',
            this.state.user.getID(),
            this.state.currProgram.programUID,
            day,
            exUID
        )
    }

    handleUpdateExercise = (updateObject) => {

        var day = updateObject.exUid.split('_').reverse()[1]
        if (this.state.currProgram.programData.loadingScheme === 'rpe_time') {
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
            this.state.user.getUserType() === 'coach',
            this.state.user.getID(),
            this.state.currProgram.programUID,
            day,
            updateObject.exUid,
            dataPayload
        )
    }

    handleAddExerciseButton = (exerciseObject, exUID, loadingScheme, insertionDay) => {
        console.log("going in add exercise button")
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

        this.props.firebase.addExerciseDB(
            this.state.user.getUserType() === 'coach',
            this.props.firebase.auth.currentUser.uid,
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
                this.state.user.getUserType() === 'coach',
                this.props.firebase.auth.currentUser.uid,
                this.state.currProgram.programUID,
            )
                .then(snapshot => {
                    let programClass = this.state.currProgList.getProgram(this.state.currProgram.programUID)

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
                            this.state.user.getUserType() === 'coach',
                            this.props.firebase.auth.currentUser.uid,
                            this.state.currProgram.programUID,
                            programObject.currentDay,
                            processedDayData
                        )
                            .then(() => {

                                this.state.currProgList.getProgram(this.state.currProgram.programUID).iterateCurrentDay(1)

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
                this.state.user.getUserType() === 'coach',
                this.props.firebase.auth.currentUser.uid,
                this.state.currProgram.programUID,
                programObject.currentDay,
                processedDayData
            )
                .then(() => {

                    this.state.currProgList.getProgram(this.state.currProgram.programUID).iterateCurrentDay(1)

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
        this.state.currProgList.getProgram(this.state.currProgram.programUID).setStartDayUTS(startDateUTS)

        this.props.firebase.startProgramDB(
            this.props.firebase.auth.currentUser.uid,
            this.state.currProgram.programUID,
            startDateUTS
        )
    }

    currentProgTableColumns = (userType) => {
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

    programInCurrentPrograms = (list, programUID) => {

        var prog = list.getProgram(programUID)

        if (!prog) {
            return {
                inCurrProg: false,
                programUID: programUID
            }
        } else {
            return {
                inCurrProg: true,
                order: prog.getOrder(),
                isActiveInSequence: prog.getIsActiveInSequence(),
                currentDayInProgram: prog.getCurrentDay(),
                programUID: programUID
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

    handlePendingProgramReplacement = (programUID, replacementType, currentDayInProgram) => {

        console.log(programUID)
        console.log(replacementType)
        console.log(currentDayInProgram)
        let pendingProgram = this.state.pendingProgList.getProgram(programUID)

        let firstProgramOrder = pendingProgram.getOrder()
        let firstProgramUID = pendingProgram.getProgramUID()

        if (replacementType === 'future') {
            let currVersionFirstProg = this.state.currProgList.getProgram(programUID)
            let firstProgData = pendingProgram.generateDBObject()
            firstProgData.isActiveInSequence = true
            firstProgData.order = firstProgramOrder
            firstProgData.status = 'current'
            firstProgData.currentDay = currentDayInProgram
            firstProgData.startDayUTS = currVersionFirstProg.getStartDayUTS()

            let firstProgPayload = createProgramObject(firstProgData)

            let acceptPendingList = []
            let delCurrentList = []
            let delPendingList = []
            // If the pending program is sequential - remove all the relevant program in the athletes current programs first before replacing. 
            if (pendingProgram.getOrder()) {
                let relatedUIDs = this.state.pendingProgList.sequentialProgramUIDList(pendingProgram.getOrder())
                acceptPendingList = [...relatedUIDs]

                // Iterate through all programs in the sequence and check if there is a version in current programs. 
                acceptPendingList.forEach(relProgUID => {
                    let currVersion = this.state.currProgList.getProgram(relProgUID)

                    if (currVersion) {
                        delCurrentList.push(relProgUID)
                        console.log(relProgUID)
                        if (currVersion.getOrder()) {
                            // If the version is sequential in current programs get all related programUIDs. These are to be removed from current programs. 
                            let relatedUIDs = this.state.currProgList.sequentialProgramUIDList(currVersion.getOrder(), [programUID])
                            delCurrentList = [...delCurrentList, ...relatedUIDs]

                            // Remove the sequence from the front end. 
                            this.state.currProgList.removeProgramSequence(currVersion.getProgramUID(), currVersion.getOrder())
                        } else {
                            this.state.currProgList.removeProgram(relProgUID)
                        }
                    }

                    let pendingVersion = this.state.pendingProgList.getProgram(relProgUID)
                    let pendingVersionRawData = pendingVersion.generateDBObject()
                    pendingVersionRawData.status = 'current'
                    let newCurrVersion = createProgramObject(pendingVersionRawData)


                    this.state.pendingProgList.removeProgram(relProgUID)
                    this.state.currProgList.addProgStart(newCurrVersion)

                })

                // Remove the accepted pending program from the pending program list, do not replace in current programs. 
                this.state.pendingProgList.removeProgram(programUID)
                this.state.currProgList.removeProgram(programUID)
                this.state.currProgList.addProgStart(firstProgPayload)
                delPendingList.push(programUID)
            } else {

                let currVersion = this.state.currProgList.getProgram(programUID)

                if (currVersion) {
                    if (currVersion.getOrder()) {
                        // If the version is sequential in current programs get all related programUIDs. These are to be removed from current programs. 
                        let relatedUIDs = this.state.currProgList.sequentialProgramUIDList(currVersion.getOrder())
                        delCurrentList = [...delCurrentList, ...relatedUIDs]

                        // Remove the sequence from the front end. 
                        this.state.currProgList.removeProgramSequence(currVersion.getProgramUID(), currVersion.getOrder())
                    } else {
                        this.state.currProgList.removeProgram(programUID)
                    }
                }

                this.state.pendingProgList.removeProgram(programUID)
                this.state.currProgList.addProgStart(firstProgPayload)

                delPendingList.push(programUID)

            }

            console.log(delCurrentList)
            console.log(delPendingList)
            console.log(acceptPendingList)
            console.log(this.state.currProgList)
            this.props.firebase.handleAcceptPendingProgramFutureReplace(
                this.props.firebase.auth.currentUser.uid,
                firstProgramUID,
                firstProgramOrder,
                currentDayInProgram,
                delPendingList,
                delCurrentList,
                acceptPendingList
            ).then(res => {
                this.setState(prev => ({
                    ...prev,
                    currentProgTableData: this.initCurrentProgramTableData(this.state.currProgList, this.state.editMode, this.state.user.getUserType()),
                    pendingProgTableData: this.initPendingProgramTableData(this.state.pendingProgList, this.state.currProgList)

                }))
            })
        } else {
            // THIS CODE IS FINE AND FUNCTIONAL - NOT TO BE CHANGED
            this.handlePendingProgramRequestAcceptence(programUID, true)
        }
    }

    generatePendingTableData = (programList, currentProgList) => {
        if (!programList.isEmptyList()) {
            var tableData = []

            programList.getProgramList().forEach(program => {
                var currentProgramInfo = this.programInCurrentPrograms(currentProgList, program.getProgramUID())
                // If the pending program is an unlimited program. 
                if (!program.getOrder()) {
                    // If the current program is already in the athletes current programs data.
                    if (currentProgramInfo.inCurrProg) {
                        // Check if there is a metaParameter mismatch if there is. A full replace is required. Cannot migrate old program data to the new program.
                        var currentVersion = currentProgList.getProgram(program.getProgramUID())


                        var noMetaParameterMismatch = program.checkSameMetaParameters(currentVersion)

                        if (noMetaParameterMismatch === true) {

                            // If the program in current program is an unlimited program or is an active program is a current sequence. A migration option is offered.
                            if (currentProgramInfo.order === undefined || currentProgramInfo.isActiveInSequence === true) {
                                tableData.push({
                                    program: program.getName(),
                                    coach: program.getOwnerUsername(),
                                    relatedPrograms: 'None',
                                    programType: 'Stand-Alone',
                                    buttons:
                                        <div>
                                            <ReplaceProgramOptionsModal
                                                handleFormSubmit={this.handlePendingProgramReplacement}
                                                programUID={program.getProgramUID()}
                                                currentDayInProgram={currentVersion.getCurrentDay()}
                                            />
                                            <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={program.getProgramUID()} />
                                        </div>
                                })
                            } else {
                                // If its not active in a sequence. Then a full replace is offered and it will be removed from the current sequence and changed to an unlimited program.  
                                tableData.push({
                                    program: program.getName(),
                                    coach: program.getOwnerUsername(),
                                    relatedPrograms: 'None',
                                    programType: 'Stand-Alone',
                                    buttons:
                                        <div>
                                            <OverrideReplaceProgramModal
                                                handleFormSubmit={this.handlePendingProgramRequestAcceptence}
                                                programUID={program.getProgramUID()}
                                                currSeq={currentVersion.getSequenceName()}
                                                modalType={'unlimPend->nonActiveSeqCurr'}
                                            />
                                            <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={program.getProgramUID()} />
                                        </div>
                                })
                            }
                        } else {
                            tableData.push({
                                program: program.getName(),
                                coach: program.getOwnerUsername(),
                                relatedPrograms: 'None',
                                programType: 'Stand-Alone',
                                buttons:
                                    <div>
                                        <OverrideReplaceProgramModal
                                            handleFormSubmit={this.handlePendingProgramRequestAcceptence}
                                            programUID={program.getProgramUID()}
                                            mismatchedParams={noMetaParameterMismatch}
                                            modalType={'metaParamter-Mismatch'}
                                        />
                                        <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={program.getProgramUID()} />
                                    </div>
                            })
                        }
                    } else {
                        // If its not in past or current programs. 
                        tableData.push({
                            program: program.getName(),
                            coach: program.getOwnerUsername(),
                            relatedPrograms: 'None',
                            programType: 'Stand-Alone',
                            buttons:
                                <div>
                                    <AcceptRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={program.getProgramUID()} />
                                    <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={program.getProgramUID()} />
                                </div>
                        })
                    }

                } else {
                    // Only considers the first program in the sequence. This is what will be displayed on the front end. All logic will be considered below. 
                    if (program.getPositionInSequence() === '1') {
                        var relatedPrograms = programList.findRelatedSequentialPrograms(program.getOrder())

                        relatedPrograms.sort((a, b) => {
                            return parseInt(a.order.split('_')[0]) - parseInt(b.order.split('_')[0])
                        })
                        var sequenceProgramsInOrder = [
                            {
                                programUID: program.getProgramUID(),
                                order: program.getOrder()
                            },
                            ...relatedPrograms
                        ]

                        var currProgSeqCheckData = this.checkSequenceProgramsInCurrentPrograms(
                            currentProgList, sequenceProgramsInOrder
                        )
                        var allSeqNotInCurrProgs = true

                        for (var seqProg in currProgSeqCheckData) {
                            var checkData = currProgSeqCheckData[seqProg]
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
                                program: program.getName(),
                                coach: program.getOwnerUsername(),
                                programType: 'Sequential',
                                buttons:
                                    <div>
                                        <AcceptRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={program.getProgramUID()} />
                                        <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={program.getProgramUID()} />
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

                            currProgSeqCheckData.forEach(prog => {
                                console.log(prog)
                                var currentVersion = currentProgList.getProgram(prog.programUID)

                                var pendingVersion = programList.getProgram(prog.programUID)

                                prog.sameMetaParams = pendingVersion.checkSameMetaParameters(currentVersion)
                            })

                            // If its not in past or current programs. 
                            tableData.push({
                                program: program.getName(),
                                coach: program.getOwnerUsername(),
                                programType: 'Sequential',
                                buttons:
                                    <div>
                                        <ReplaceProgramSequenceModal
                                            buttonHandler={this.handlePendingProgramReplacement}
                                            sequenceOverlapData={currProgSeqCheckData}
                                        />
                                        <DeclineRequestButton
                                            buttonHandler={this.handlePendingProgramRequestAcceptence}
                                            objectUID={program.getProgramUID()}
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

    checkSequenceProgramsInCurrentPrograms = (list, sequencePrograms) => {
        var payload = []
        sequencePrograms.forEach(program => {
            payload.push(this.programInCurrentPrograms(list, program.programUID))
        })

        return (payload)
    }

    handlePendingProgramRequestAcceptence = (programUID, isAccepted) => {
        console.log(programUID)
        console.log(isAccepted)
        let delPendingList = []
        let delCurrentList = []
        let acceptPendingList = []
        var pendingProgram = this.state.pendingProgList.getProgram(programUID)

        if (isAccepted) {
            pendingProgram.setStatus('current')
            // If the pending program is sequential - remove all the relevant program in the athletes current programs first before replacing. 
            if (pendingProgram.getOrder()) {
                let relatedUIDs = this.state.pendingProgList.sequentialProgramUIDList(pendingProgram.getOrder())
                acceptPendingList = [programUID, ...relatedUIDs]

                // Iterate through all programs in the sequence and check if there is a version in current programs. 
                acceptPendingList.forEach(relProgUID => {
                    let currVersion = this.state.currProgList.getProgram(relProgUID)

                    if (currVersion) {
                        delCurrentList.push(relProgUID)
                        if (currVersion.getOrder()) {
                            // If the version is sequential in current programs get all related programUIDs. These are to be removed from current programs. 
                            let relatedUIDs = this.state.currProgList.sequentialProgramUIDList(currVersion.getOrder())
                            delCurrentList = [...delCurrentList, ...relatedUIDs]

                            // Remove the sequence from the front end. 
                            this.state.currProgList.removeProgramSequence(currVersion.getProgramUID(), currVersion.getOrder())
                        } else {
                            this.state.currProgList.removeProgram(relProgUID)
                        }
                    }

                    let pendingVersion = this.state.pendingProgList.getProgram(relProgUID)
                    let pendingVersionRawData = pendingVersion.generateDBObject()
                    pendingVersionRawData.status = 'current'
                    let newCurrVersion = createProgramObject(pendingVersionRawData)

                    this.state.pendingProgList.removeProgram(relProgUID)
                    this.state.currProgList.addProgStart(newCurrVersion)

                })
            } else {
                acceptPendingList = [programUID]

                let currVersion = this.state.currProgList.getProgram(programUID)

                if (currVersion) {
                    // Push programUID to remove from current programs. 
                    delCurrentList.push(programUID)
                    if (currVersion.getOrder()) {
                        // If the version is sequential in current programs get all related programUIDs. These are to be removed from current programs. 
                        let relatedUIDs = this.state.currProgList.sequentialProgramUIDList(currVersion.getOrder())
                        delCurrentList = [...delCurrentList, ...relatedUIDs]

                        // Remove the sequence from the front end. 
                        this.state.currProgList.removeProgramSequence(currVersion.getProgramUID(), currVersion.getOrder())
                    } else {
                        this.state.currProgList.removeProgram(programUID)
                    }
                }

                this.state.pendingProgList.removeProgram(programUID)

                let firstProgPayload = pendingProgram.generateDBObject()
                firstProgPayload.status = 'current'
                firstProgPayload = createProgramObject(firstProgPayload)

                this.state.currProgList.addProgStart(firstProgPayload)
            }



            console.log(delCurrentList)
            console.log(delPendingList)
            console.log(acceptPendingList)
            console.log(this.state.currProgList)
            console.log(this.state.pendingProgList)
            this.props.firebase.handleAcceptPendingProgramCompleteReplace(
                this.props.firebase.auth.currentUser.uid,
                delCurrentList,
                delPendingList,
                acceptPendingList
            ).then(result => {
                this.setState(prev => ({
                    ...prev,
                    currentProgTableData: this.initCurrentProgramTableData(this.state.currProgList, this.state.editMode, this.state.user.getUserType()),
                    pendingProgTableData: this.initPendingProgramTableData(this.state.pendingProgList, this.state.currProgList)

                }))
            })

        } else {

            delPendingList.push(programUID)

            if (pendingProgram.getOrder()) {
                var relatedPrograms = this.state.pendingProgList.findRelatedSequentialPrograms(pendingProgram.getOrder())

                delPendingList = [...delPendingList, ...this.state.pendingProgList.sequentialProgramUIDList(pendingProgram.getOrder())]

                this.state.pendingProgList.removeProgramSequence(programUID, pendingProgram.getOrder())

            } else {
                this.state.pendingProgList.removeProgram(programUID)

            }

            this.props.firebase.handlePendingProgramDenied(
                this.props.firebase.auth.currentUser.uid,
                delPendingList
            ).then(res => {
                this.setState(prev => ({
                    ...prev,
                    pendingProgTableData: this.initPendingProgramTableData(this.state.pendingProgList, this.state.currProgList)

                }))
            })
        }

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
                athlete: this.props.firebase.auth.currentUser.uid,
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

                payload.team = 'none'

                payload.startDayUTS = startTimestamp
            }

            if (goalListArr.length === 0) {
                goalListArr = undefined
            }

            var newProg = createProgramObject(payload)

            this.state.currProgList.addProgStart(newProg)

            this.setState(prev => ({
                ...prev,
                currentProgTableData: this.initCurrentProgramTableData(this.state.currProgList, this.state.editMode),
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

            var newPastTableData = this.initPastProgramTableData(
                this.state.pastProgList,
                !this.state.editMode
            )

            var newCurrTableData = this.initCurrentProgramTableData(
                this.state.currProgList,
                !this.state.editMode,
                this.state.user.getUserType()
            )

            this.setState(prev => ({
                ...prev,
                editMode: !this.state.editMode,
                currentProgTableData: newCurrTableData,
                pastProgTableData: newPastTableData,
                pageBodyContentLoading: false
            }))
        })


    }

    handleDeleteProgram = (programUID, status) => {
        this.setState({
            pageBodyContentLoading: true
        }, () => {
            let deleteList = [programUID]
            let progObj

            if (status === 'current') {
                progObj = this.state.currProgList.getProgram(programUID)

                if (progObj.getOrder()) {

                    deleteList = [...deleteList, ...this.state.currProgList.sequentialProgramUIDList(progObj.getOrder())]

                    this.state.currProgList.removeProgramSequence(programUID, progObj.getOrder())
                } else {
                    this.state.currProgList.removeProgram(programUID)
                }

                var tableTarget = 'currentProgTableData'
                var newTableData = this.initCurrentProgramTableData(
                    this.state.currProgList,
                    this.state.editMode,
                    this.state.user.getUserType()
                )
            } else if (progObj.getStatus() === 'past') {
                progObj = this.state.pastProgList.getProgram(programUID)

                this.state.pastProgList.removeProgram(programUID)

                var tableTarget = 'pastProgTableData'
                var newTableData = this.initPastProgramTableData(
                    this.state.pastProgList,
                    this.state.editMode
                )
            }

            console.log(deleteList)
            let promises = []
            deleteList.forEach(progToDelete => {
                promises.push(
                    this.props.firebase.deleteProgramDB(
                        progToDelete,
                        this.state.user.getUserType(),
                        this.state.user.getID(),
                        status
                    )
                )
            })

            Promise.all(promises).then(res => {
                this.setState(prev => ({
                    ...prev,
                    pageBodyContentLoading: false,
                    [tableTarget]: newTableData
                }))
            })
        })
    }

    handleCreateProgramGroup = (groupName, programData) => {

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
            pendingProgTableData,
            currentProgTableData,
            pastProgTableData,
            view,
            pageBodyContentLoading,
            currProgram
        } = this.state
        console.log(pendingProgTableData)
        console.log(currentProgTableData)
        console.log(pastProgTableData)

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
                                    user && user.getUserType() === 'coach' && currentProgTableData &&
                                    < div id='hpRightBtnContainer'>
                                        <CreateProgramGroupModal
                                            programTableData={currentProgTableData.data}
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
                        <ManageProgramTables
                            pendingData={pendingProgTableData}
                            currentData={currentProgTableData}
                            pastData={pastProgTableData}
                        />
                    </div>
                }
                {
                    view === this.PAGE_VIEWS.PROG_VIEW_HOME && currProgram &&
                    <ProgramView
                        developmentMode={user.getUserType() === 'coach'}
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
            </NonLandingPageWrapper >

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