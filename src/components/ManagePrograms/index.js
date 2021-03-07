import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List, Button } from 'semantic-ui-react'

import CreateProgramModal from './createProgramModal'
import ManageProgramGroupModal from './manageProgramGroupModal'
import loadingSchemeString, { loadingSchemeStringInverse } from '../../constants/loadingSchemeString'
import ManageProgramTables from './manageProgramTables'
import { AcceptRequestButton, DeclineRequestButton, AcceptReplaceRequestButton, DeclineReplaceRequestButton } from '../CustomComponents/customButtons'
import ReplaceProgramOptionsModal from './replaceProgramOptionsModal'
import OverrideReplaceProgramModal from './overrideReplaceProgramModal'
import ReplaceProgramSequenceModal from './replaceProgramSequenceModal'
import { createUserObject } from '../../objects/user'
import { createProgramObject } from '../../objects/program'
import { ProgramList, PastProgramList } from '../../objects/programList'
import PageHistory from '../CustomComponents/pageHistory'
import { listAndFormatExercises, checkNullExerciseData, setAvailExerciseCols, generatePastProgramGoalTableData } from '../../constants/viewProgramPagesFunctions'
import ProgramView, { ProgramViewPageSubHeader } from '../CustomComponents/programView'
import { capitaliseFirstLetter, underscoreToSpaced } from '../../constants/stringManipulation';
import { calculateDailyLoads } from '../CurrentProgram/calculateWeeklyLoads'
import { initProgDeployCoachProgGroupTableData } from '../CustomComponents/programDeployment';
import CloseOffProgramModal from '../CurrentProgram/closeOffProgramModal'
import utsToDateString from '../../constants/utsToDateString'
import ErrorBanner from '../CustomComponents/errorBanner';
import PastProgramView from '../CustomComponents/pastProgramView';
import * as ROUTES from '../../constants/routes'



class ManageProgramsPage extends Component {

    constructor(props) {
        super(props)

        this.PAGE_VIEWS = {
            HOME: 'home',
            PROG_VIEW_HOME: 'programHomeView',
            PAST_PROG_VIEW_HOME: 'pastProgramHomeView'
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

                    this.props.firebase.getUserProgramsAndGroups(userObject.getID(), userObject.getUserType()).then(snap => {
                        let snapshot = snap.programs
                        let pendingPrograms = []
                        let currentPrograms = []
                        let pastPrograms = []
                        if (snapshot.length === 0) {
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
                            })
                        }

                        let pendingList = new ProgramList(pendingPrograms)
                        let currProgList = new ProgramList(currentPrograms)
                        let pastProgList = new PastProgramList(pastPrograms)

                        let programGroupList
                        let programGroupTableData = undefined

                        if (snap.programGroups) {
                            programGroupList = Object.keys(snap.programGroups)
                            programGroupTableData = initProgDeployCoachProgGroupTableData(snap.programGroups)
                        }

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
                            programGroupTableData: programGroupTableData,
                            currentProgramGroups: programGroupList,
                            currentTableView: 'current',
                            error: false,
                            errorText: undefined,
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
                                    <CloseOffProgramModal
                                        handleFormSubmit={() => { this.handleCloseOffProgram(prog.generateProgramUID()) }}
                                    />
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
            let payload = {
                columns: [
                    {
                        Header: 'Program',
                        accessor: 'name'
                    },
                    {
                        Header: 'Loading Scheme',
                        accessor: 'loadingScheme'
                    },
                    {
                        Header: 'Date Closed',
                        accessor: 'closeDay'
                    },
                    {
                        accessor: 'buttons'
                    }

                ],
                data: []
            }

            if (!editMode) {
                list.getProgramList().forEach(prog => {
                    payload.data.push({
                        name: prog.getName(),
                        programUID: prog.generateProgramUID(),
                        loadingScheme: loadingSchemeString(prog.getLoadingScheme()),
                        closeDay: utsToDateString(parseInt(prog.getEndDayUTS())),
                        buttons:
                            <Button
                                className='lightPurpleButton-inverted'
                                onClick={() => { this.handlePastProgramClick(prog.generateProgramUID(), prog.getEndDayUTS()) }}
                            >
                                View Program
                        </Button>

                    })
                })
            } else {
                list.getProgramList().forEach(prog => {
                    payload.data.push({
                        name: prog.getName(),
                        programUID: prog.generateProgramUID(),
                        loadingScheme: loadingSchemeString(prog.getLoadingScheme()),
                        closeDay: utsToDateString(parseInt(prog.getEndDayUTS())),

                        buttons:
                            <>
                                <Button
                                    className='lightPurpleButton-inverted'
                                    onClick={() => { this.handlePastProgramClick(prog.generateProgramUID(), prog.getEndDayUTS()) }}
                                >
                                    View Program
                                    </Button>
                                <Button
                                    className='lightRedButton-inverted'
                                    onClick={() => { this.handleDeleteProgram(prog.generateProgramUID(), prog.getStatus(), prog.getEndDayUTS()) }}
                                >
                                    Delete Program
                                    </Button>
                            </>
                    })
                })
            }

            return payload
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

    handlePastProgramClick = (programUID, endDayUTS) => {
        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.props.firebase.getPastProgramViewData(
                programUID,
                this.props.firebase.auth.currentUser.uid,
                endDayUTS
            ).then(data => {
                let program = this.state.pastProgList.getProgram(programUID, endDayUTS).generateDBObject()

                let goalData = generatePastProgramGoalTableData(data.goalData)
                let programData = { ...program, ...data.exData }

                console.log(data)
                console.log(goalData)

                this.state.pageHistory.next(this.state.view)

                this.setState(prev => ({
                    ...prev,
                    view: this.PAGE_VIEWS.PAST_PROG_VIEW_HOME,
                    pageBodyContentLoading: false,
                    currProgram: {
                        programUID: programUID,
                        status: 'past',
                        endDayUTS: endDayUTS,
                        programData: programData,
                        submitProcessingBackend: false,
                        rawAnatomyData: data.anatomy,
                        notes: data.notes,
                        goalData: goalData,
                        handlerFunctions: {
                            handlePastProgramNotesUpdate: this.handlePastProgramNotesUpdate
                        }
                    }
                }))
            })
        })
    }

    handlePastProgramNotesUpdate = (value) => {
        this.props.firebase.updatePastProgramNotes(
            this.state.currProgram.programUID,
            this.props.firebase.auth.currentUser.uid,
            this.state.currProgram.endDayUTS,
            value
        )
    }

    handleProgramClick = (programUID, status) => {

        // Get all the anatomy data for progression loading. 
        this.setState({
            pageBodyContentLoading: true
        }, () => {

            this.props.firebase.getAnatomyData()
                .then(snapshot => {
                    const anatomyObject = snapshot.data().anatomy
                    // Get the program exercise data

                    Promise.all(this.props.firebase.getProgramExGoalData(
                        this.state.user.getUserType() === 'coach',
                        this.state.user.getID(),
                        programUID,
                        status
                    ))
                        .then(snapshot => {

                            let progData = this.state.currProgList.getProgram(programUID).generateDBObject()

                            if (Object.keys(snapshot[0]).length > 0) {
                                progData.goals = snapshot[0]
                            }

                            progData = { ...progData, ...snapshot[1] }



                            // Get all exercise data to view with the program and format them all.

                            let exList = ['none', progData.athlete]

                            if (progData.athlete !== progData.owner) {
                                exList.push(progData.owner)
                            }

                            this.props.firebase.getExData(exList)
                                .then(snapshot => {
                                    var exList = listAndFormatExercises(snapshot)

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

    handleDeleteGoal = (payload, toggleMainGoalCompleted) => {
        this.props.firebase.deleteGoalDB(
            this.state.currProgram.programUID,
            payload,
            this.props.firebase.auth.currentUser.uid,
            toggleMainGoalCompleted
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

                                if (frontEndProgData[programObject.currentDay]) {
                                    frontEndProgData[programObject.currentDay]['loadingData'] = processedDayData

                                } else {
                                    frontEndProgData[programObject.currentDay] = {
                                        loadingData: processedDayData
                                    }
                                }

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
                                submitProcessingBackend: true,
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

    handleCloseOffProgram = (programUID) => {

        this.setState({
            pageBodyContentLoading: true
        }, () => {
            let program = this.state.currProgList.getProgram(programUID)

            if (program.getCurrentDay() === 1) {
                this.setState({
                    pageBodyContentLoading: false,
                    error: true,
                    errorText: 'We did some checking and we can process this request. The program you want to close off is on day 1 and contains no data. Maybe delete the program instead.'
                })
            } else {
                let timestamp = new Date().getTime()
                let nextInSeq = undefined
                // Remove the program from the current program list.
                this.state.currProgList.removeProgram(programUID)

                // Format new data object for the front end.
                let programData = program.generateDBObject()
                programData.status = 'past'
                programData.endDayUTS = timestamp

                // Create a past program object for new insertion.
                let newPastProgram = createProgramObject(programData)

                this.state.pastProgList.addProgStart(newPastProgram)

                // If the program is sequential start the next program. 
                if (program.getOrder()) {
                    nextInSeq = this.state.currProgList.activateNextProgramInSequence(program.getOrder())
                    if (nextInSeq) {
                        this.state.currProgList.getProgram(nextInSeq).setIsActiveInSequence(true)
                    }
                }

                this.props.firebase.closeOffProgramDB(
                    programUID,
                    this.props.firebase.auth.currentUser.uid,
                    timestamp,
                    nextInSeq
                ).then(() => {
                    this.setState({
                        pageBodyContentLoading: false,
                        currentProgTableData: this.initCurrentProgramTableData(
                            this.state.currProgList,
                            this.state.editMode
                        ),
                        pastProgTableData: this.initPastProgramTableData(
                            this.state.pastProgList,
                            this.state.editMode
                        )
                    })
                })
            }
        })

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

        if (
            this.state.currProgList.programNameExists(newProgram)
            ||
            this.state.pastProgList.programNameExists(newProgram)
        ) {
            return true
        }

        return false

    }

    handleDeleteProgramGroup = (groupNames) => {
        console.log(groupNames)

        this.props.firebase.deleteProgramGroupsDB(
            this.props.firebase.auth.currentUser.uid,
            groupNames
        ).then(() => {
            let currGroupList = [...this.state.currentProgramGroups].filter(group => {
                return !groupNames.includes(group)
            })

            let currGroupTableData = [...this.state.programGroupTableData].filter(group => {
                return !groupNames.includes(group.programGroup)
            })

            this.setState({
                currentProgramGroups: currGroupList,
                programGroupTableData: currGroupTableData
            })

        })
    }

    handleCreateProgram = async (programName, acutePeriod, chronicPeriod, loadingScheme, date, goalList) => {

        this.setState({
            pageBodyContentLoading: true
        }, () => {


            // Creates a unique name for a program. Input name + coach UID + timestamp of creation.
            var timestamp = new Date().getTime()
            programName = programName.trim()

            if (this.checkIfProgramAlreadyExists(programName)) {
                alert('Program with name "' + programName.split('_')[0] + '" already exists in either your current or past programs.')

                this.setState(prev => ({
                    ...prev,
                    pageBodyContentLoading: false
                }))
            } else {

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
                        formattedObj.programStatus = 'current'
                        formattedObj.athleteUID = this.props.firebase.auth.currentUser.uid
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
            }
        })
    }

    handleChangeCurrentTableView = (table) => {
        this.setState({
            currentTableView: table
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

    handleDeleteProgram = (programUID, status, endDayUTS = undefined) => {
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

                var newTableData = this.initCurrentProgramTableData(
                    this.state.currProgList,
                    this.state.editMode,
                    this.state.user.getUserType()
                )

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
                        currentProgTableData: newTableData,
                        pendingProgTableData: this.initPendingProgramTableData(this.state.pendingProgList, this.state.currProgList)
                    }))
                })
            } else if (status === 'past') {
                progObj = this.state.pastProgList.getProgram(programUID, endDayUTS)

                this.state.pastProgList.removeProgram(programUID, endDayUTS)

                var newTableData = this.initPastProgramTableData(
                    this.state.pastProgList,
                    this.state.editMode
                )

                let promises = []
                deleteList.forEach(progToDelete => {
                    promises.push(
                        this.props.firebase.deleteProgramDB(
                            progToDelete,
                            this.state.user.getUserType(),
                            this.state.user.getID(),
                            status,
                            progObj.getEndDayUTS()
                        )
                    )
                })

                Promise.all(promises).then(res => {
                    this.setState(prev => ({
                        ...prev,
                        pageBodyContentLoading: false,
                        pastProgTableData: newTableData,
                    }))
                })

            }
        })
    }

    homePageRedirect = () => {
        this.props.history.push(ROUTES.HOME)

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
        ).then(updatedData => {
            let newList = Object.keys(updatedData)
            let newGroupTableData = initProgDeployCoachProgGroupTableData(updatedData)

            this.setState({
                programGroupTableData: newGroupTableData,
                currentProgramGroups: newList
            })

        })
    }
    render() {
        const {
            loading,
            user,
            pendingProgTableData,
            currentProgTableData,
            pastProgTableData,
            view,
            pageBodyContentLoading,
            currProgram,
            currentProgramGroups,
            programGroupTableData,
            currentTableView,
            error,
            errorText
        } = this.state
        console.log(currentProgramGroups)
        console.log(programGroupTableData)

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    {
                        error &&
                        <ErrorBanner clickHandler={() => { this.setState({ error: false, errorText: undefined }) }}>
                            <p>
                                {errorText}
                            </p>
                        </ErrorBanner>
                    }
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
                                        <ManageProgramGroupModal
                                            programTableData={currentProgTableData.data}
                                            handleCreateFormSubmit={this.handleCreateProgramGroup}
                                            currentGroupList={currentProgramGroups}
                                            tableGroupTableData={programGroupTableData}
                                            handleDeleteFormSubmit={this.handleDeleteProgramGroup}
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
                    view &&
                    <div className='rowContainer clickableDiv'>
                        <Button
                            content='Back'
                            className='backButton-inverted'
                            circular
                            icon='arrow left'
                            onClick={() => {
                                view !== this.PAGE_VIEWS.HOME ?
                                    this.handleBackClick(view)
                                    : this.homePageRedirect()

                            }}
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
                            currentTableView={currentTableView}
                            changeTableHandler={this.handleChangeCurrentTableView}
                        />
                    </div>
                }
                {
                    view === this.PAGE_VIEWS.PROG_VIEW_HOME && currProgram && currProgram.status === 'current' &&
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
                {
                    view === this.PAGE_VIEWS.PAST_PROG_VIEW_HOME && currProgram && currProgram.status === 'past' &&
                    <PastProgramView
                        data={currProgram.programData}
                        processedGoalData={currProgram.goalData}
                        anatomy={currProgram.rawAnatomyData}
                        notes={currProgram.notes}
                        handlerFunctions={currProgram.handlerFunctions}

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