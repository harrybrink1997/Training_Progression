import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List, Button } from 'semantic-ui-react'

import RowSelectTable from '../CustomComponents/rowSelectTable'
import ManageAthleteModal from './manageAthleteModal'
import loadingSchemeString from '../../constants/loadingSchemeString'
import { ManageAthleteButton } from '../CustomComponents/customButtons'
import utsToDateString from '../../constants/utsToDateString'
import BasicTablePagination from '../CustomComponents/basicTablePagination'
import InputLabel from '../CustomComponents/DarkModeInput'
import ManageCurrAthleteHome from './manageCurrAthleteHome'
import ProgramDeployment, { initProgDeployCoachProgGroupTableData, initProgDeployCoachProgramTableData } from '../CustomComponents/programDeployment'
import ViewProgramErrorModal from './viewProgramErrorModal'
import ProgramView, { ProgramViewPageSubHeader } from '../CustomComponents/programView'
import { capitaliseFirstLetter, underscoreToSpaced } from '../../constants/stringManipulation';
import { convertUIDayToTotalDays } from '../../constants/dayCalculations';
import { setAvailExerciseCols, listAndFormatExercises, checkNullExerciseData } from '../../constants/viewProgramPagesFunctions'
import { calculateDailyLoads, dailyLoadCalcs } from '../CurrentProgram/calculateWeeklyLoads'
import AssignNewTeam from './assignNewTeam'
import PageHistory from '../CustomComponents/pageHistory'
import { createProgramObject } from '../../objects/program'
import { ProgramList } from '../../objects/programList'


class ManageAthletesPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            athleteManagementTableData: [],
            athleteManagementTableColumns: [],
            selectedAthletesTable: [],
            currAthlete: undefined,
            pageBodyContentLoading: false,
            loading: true
        }
    }

    componentDidMount() {
        this.setState({ loading: true }, () => {

            // Data to grab before page can be fired. 
            // Program Groups
            // Individual Programs
            // Athlete list
            this.props.firebase.getAthleteManagementData(
                this.props.firebase.auth.currentUser.uid
            ).then(data => {
                this.setState({
                    manageAthleteTableData: this.initManageAthleteTableData(data.athletes),
                    programGroupData: initProgDeployCoachProgGroupTableData(data.programGroups),
                    programData: initProgDeployCoachProgramTableData(data.programs),
                    loading: false
                })
            })
        });
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
    }


    updateObjectState = (userObject) => {

        this.setState({
            athleteManagementTableData: this.initAthleteManagementTableData(userObject),
            athleteManagementTableColumns: this.initAthleteTableColumns(),
            coachProgramTableData: initProgDeployCoachProgramTableData(userObject),
            coachProgramGroupTableData: initProgDeployCoachProgGroupTableData(userObject),
            currentProgramsData: userObject.currentPrograms,
            loading: false,
            viewProgramProcessing: false
        })
    }

    checkProgramLocation = (locationData, name, time) => {

        if (!locationData) {
            return false
        } else {
            for (var prog in locationData) {

                if (prog === name) {
                    if (locationData[prog].deploymentDate === time) {
                        return true
                    }
                }
            }

            return false
        }


    }

    checkProgramExistenceInCurrPast = (userObject, programName, time) => {
        var payLoad = {
            pendingPrograms: this.checkProgramLocation(userObject.pendingPrograms, programName, time),
            currentPrograms: this.checkProgramLocation(userObject.currentPrograms, programName, time),
            pastPrograms: this.checkProgramLocation(userObject.pastPrograms, programName, time)
        }

        if (!payLoad.currentPrograms && !payLoad.pastPrograms) {
            return false
        }

        return payLoad
    }

    handleViewProgramClick = (athleteUID, programUID, deploymentTime, status) => {
        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.state.currAthlete.pageHistory.next(this.state.currAthlete.view)
            console.log(status)
            console.log(athleteUID)

            // Get all exercise data to view with the program and format them all.
            this.props.firebase.getExData(['none'])
                .then(snapshot => {
                    var exList = listAndFormatExercises(
                        snapshot.docs.map(doc => doc.data())
                    )

                    // Get the program exercise data

                    Promise.all(this.props.firebase.getProgramExGoalData(
                        false,
                        athleteUID,
                        programUID,
                        status
                    ))
                        .then(snapshot => {
                            let progData
                            if (status === 'current') {
                                progData = this.state.currAthlete.currentProgramList.getProgram(programUID).generateCompleteJSONObject()

                            } else if (status === 'past') {
                                progData = this.state.pastProgramList.getProgram(programUID).generateCompleteJSONObject()
                            }
                            console.log(snapshot)
                            if (Object.keys(snapshot[0]).length > 0) {
                                progData.goals = snapshot[0]
                            }

                            progData = { ...progData, ...snapshot[1] }

                            this.state.currAthlete.pageHistory.next(this.state.view)

                            console.log(progData)

                            this.setState(prev => ({
                                ...prev,
                                pageBodyContentLoading: false,
                                currAthlete: {
                                    ...prev.currAthlete,
                                    programUID: programUID,
                                    status: status,
                                    availExData: exList,
                                    availExColumns: setAvailExerciseCols(),
                                    programData: progData,
                                    submitProcessingBackend: false,
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
                                    view: 'viewProgram'
                                }
                            }))
                        })
                })
        })

    }


    handleCopyPrevWeekExData = (payload) => {

        this.props.firebase.copyExerciseDataDB(
            false,
            this.state.currAthlete.uid,
            this.state.currAthlete.programUID,
            payload
        )
    }

    handleEditGoal = (payload) => {
        this.props.firebase.editGoalDB(
            this.state.currAthlete.programUID,
            payload,
            this.state.currAthlete.uid
        )
    }

    handleCompleteGoal = (payload) => {
        this.props.firebase.changeGoalCompletionStatusDB(
            this.state.currAthlete.programUID,
            payload.mainGoalDBUID,
            payload,
            this.state.currAthlete.uid
        )
    }

    handleDeleteGoal = (payload, toggleMainGoalCompleted) => {
        this.props.firebase.deleteGoalDB(
            this.state.currAthlete.programUID,
            payload,
            this.state.currAthlete.uid,
            toggleMainGoalCompleted
        )
    }

    handleCreateMainGoal = (mainGoalDBUID, payload) => {
        payload.goalProgUID = mainGoalDBUID
        payload.programUID = this.state.currAthlete.programUID
        payload.athleteUID = this.state.currAthlete.uid
        payload.programStatus = 'current'

        if (Object.keys(payload.subGoals).length === 0) {
            delete payload.subGoals
        }

        this.props.firebase.createMainGoalDB(payload)

    }

    handleCreateSubGoal = (payload) => {
        this.props.firebase.createSubGoalDB(
            this.state.currAthlete.programUID,
            payload,
            this.state.currAthlete.uid
        )
    }







    handleViewProgramErrorModalDecision = (continueProcess) => {
        if (continueProcess === false) {
            this.setState(prevState => ({
                currAthlete: {
                    ...prevState.currAthlete,
                    showViewProgramErrorModal: false,
                    viewProgramErrorType: undefined
                },
            }))
        }
    }

    handleRemoveAthleteFromTeam = (teamName, athleteUID) => {

        let currTeamData = [...this.state.currAthlete.athTeamTableData.data]

        for (var team in currTeamData) {
            if (currTeamData[team].team === teamName) {
                currTeamData.splice(team, 1)
            }
        }

        this.props.firebase.removeAthleteFromTeam(
            this.props.firebase.auth.currentUser.uid,
            athleteUID,
            teamName
        ).then(() => {

            this.setState(prevState => ({
                ...prevState,
                currAthlete: {
                    ...prevState.currAthlete,
                    athTeamTableData: {
                        ...prevState.currAthlete.athTeamTableData,
                        data: currTeamData
                    }
                }
            }))
        })
    }

    initAthTeamTableData = (teams, athleteUid) => {
        console.log(teams)
        let returnData = {
            columns: [
                {
                    Header: 'Team',
                    accessor: 'team'
                },
                {
                    Header: 'Joining Date',
                    accessor: 'joiningDate'
                },
                {
                    accessor: 'buttons'
                }
            ],
            data: []
        }

        Object.keys(teams).forEach(team => {
            if (team !== 'none') {
                returnData.data.push({
                    team: team,
                    joiningDate: utsToDateString(parseInt(teams[team].joiningDate)),
                    buttons:
                        <Button
                            className='lightRedButton-inverted'
                            onClick={() => { this.handleRemoveAthleteFromTeam(team, athleteUid) }}
                        >
                            Remove From Team
                            </Button>
                })
            }
        })
        return returnData

    }

    handleManageCurrAthleteViewChange = (view) => {

        this.state.currAthlete.pageHistory.next(this.state.currAthlete.view)

        this.setState(prevState => ({
            ...prevState,
            currAthlete: {
                ...prevState.currAthlete,
                view: view,
            }
        }))
    }

    initAthProgTableData = (programs, athleteUID) => {

        let returnData = {
            columns: [
                {
                    Header: 'Program',
                    accessor: 'program'
                },
                {
                    Header: 'Related Team',
                    accessor: 'team'
                },
                {
                    Header: 'Date Assigned',
                    accessor: 'dateAssigned'
                },
                {
                    Header: 'Program Status',
                    accessor: 'status'
                },
                {
                    accessor: 'buttons'
                }
            ],
            data: []
        }

        if (programs.length > 0) {

            programs.forEach(program => {
                returnData.data.push({
                    program: program.name,
                    team: program.team,
                    timestampAssigned: program.deploymentDate,
                    dateAssigned: utsToDateString(parseInt(program.deploymentDate)),
                    status: program.status,
                    buttons:
                        program.status !== 'pending' &&
                        <Button
                            className='lightPurpleButton-inverted'
                            onClick={() => { this.handleViewProgramClick(athleteUID, program.programUID, program.deploymentDate, program.status) }}
                        >
                            View Program
                        </Button>

                })
            })
            returnData.data.sort((a, b) => {
                return (
                    parseInt(b.timestampAssigned) - parseInt(a.timestampAssigned)
                )
            })

        }
        return returnData
    }


    initManageAthleteTableColumns = () => {
        return (
            [
                {
                    Header: 'Athlete',
                    accessor: 'athlete',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Email',
                    accessor: 'email',
                    filter: 'fuzzyText'
                },
                {
                    accessor: 'buttons',
                }
            ]
        )
    }

    handleManageAthleteClick = (athlete) => {
        console.log(athlete)
        this.setState({
            pageBodyContentLoading: true,
            currAthlete: {
                uid: athlete.athleteUID
            }
        }, () => {
            this.props.firebase.getIndividualAthleteProfileAndManagementData(
                this.props.firebase.auth.currentUser.uid,
                athlete.athleteUID
            ).then(data => {
                console.log(data)

                let pastPrograms = []
                let currentPrograms = []

                data.programs.forEach(program => {
                    let progObj = createProgramObject(program)

                    if (progObj.getStatus() === 'current') {
                        currentPrograms.push(progObj)
                    } else if (progObj.getStatus() === 'past') {
                        pastPrograms.push(progObj)
                    }
                })

                pastPrograms = new ProgramList(pastPrograms)
                currentPrograms = new ProgramList(currentPrograms)
                console.log(data.anatomyObject)
                this.setState({
                    pageBodyContentLoading: false,
                    currAthlete: {
                        uid: athlete.athleteUID,
                        username: athlete.username,
                        pastProgramList: pastPrograms,
                        currentProgramList: currentPrograms,
                        email: athlete.email,
                        joinDate: utsToDateString(parseInt(athlete.joiningDate)),
                        currTeams: Object.keys(data.teams),
                        athProgTableData: this.initAthProgTableData(data.programs, athlete.athleteUID),
                        athTeamTableeData: this.initAthTeamTableData(data.teams, athlete.athleteUID),
                        view: 'home',
                        pageHistory: new PageHistory(),
                        showViewProgramErrorModal: false,
                        viewProgramErrorType: undefined,
                        coachTeamTableData: this.initCoachTeamTableData(data.currentCoachTeams),
                        submitProcessingBackend: false,
                        rawAnatomyData: data.anatomyObject.anatomy

                    }
                })
            })
        })
    }

    handleStartProgram = (startDateUTS) => {
        this.state.currAthlete.currentProgramList.getProgram(this.state.currAthlete.programUID).setStartDayUTS(startDateUTS)

        this.props.firebase.startProgramDB(
            this.state.currAthlete.uid,
            this.state.currAthlete.programUID,
            startDateUTS
        )
    }

    checkAthleteAssignedToTeam = (teamList, teamName) => {

        for (var team in teamList) {
            if (teamList[team].team === teamName) {
                return true
            }
        }

        return false
    }

    updateStateOnNewTeamAssignment = (teamList) => {
        this.setState(prevState => ({
            ...prevState,
            pageBodyContentLoading: false,
            currAthlete: {
                ...prevState.currAthlete,
                athTeamTableData: {
                    ...prevState.currAthlete.athTeamTableData,
                    data: teamList
                },
                view: 'manageTeams'
            }
        }))
    }

    handleAssignAthleteNewTeam = (team) => {

        this.setState({
            pageBodyContentLoading: true
        }, () => {
            var timestamp = new Date().getTime()

            let currentAthleteTeams = [...this.state.currAthlete.athTeamTableData.data]

            console.log(currentAthleteTeams)

            var alreadyInTeam = this.checkAthleteAssignedToTeam(
                currentAthleteTeams,
                team
            )
            console.log(alreadyInTeam)

            if (!alreadyInTeam) {
                currentAthleteTeams.push({
                    team: team,
                    joiningDate: utsToDateString(timestamp),
                    buttons:
                        <Button
                            className='lightRedButton-inverted'
                            onClick={() => { this.handleRemoveAthleteFromTeam(team, this.state.currAthlete.uid) }}
                        >
                            Remove From Team
                            </Button>

                })

                this.props.firebase.assignAthleteNewTeam(
                    this.props.firebase.auth.currentUser.uid,
                    this.state.currAthlete.uid,
                    team,
                    timestamp
                ).then(() => {
                    this.updateStateOnNewTeamAssignment(currentAthleteTeams)
                })

            } else {
                this.setState(prevState => ({
                    ...prevState,
                    pageBodyContentLoading: false,
                    currAthlete: {
                        ...prevState.currAthlete,
                        showViewProgramErrorModal: true,
                        viewProgramErrorType: 'athleteCurrBelongsToTeam',
                        view: 'manageTeams'
                    }

                }))
            }
        })
    }

    initCoachTeamTableData = (teams) => {

        if (teams.length === 0) {
            return undefined
        } else {

            var columns = [
                {
                    Header: 'Team Name',
                    accessor: 'team'
                },
                {
                    Header: 'Team Description',
                    accessor: 'description'
                }
            ]

            var data = []

            teams.forEach(team => {
                data.push({
                    team: team.name,
                    description: team.description
                })
            })

            return {
                data: data,
                columns: columns
            }
        }
    }

    initManageAthleteTableData = (athletes) => {
        let payload = {
            columns: this.initManageAthleteTableColumns(),
            data: []
        }

        athletes.forEach(athlete => {
            console.log(athlete)
            payload.data.push({
                athlete: athlete.username,
                email: athlete.email,
                athleteUID: athlete.athleteUID,
                buttons:
                    <ManageAthleteButton
                        objectUID={{
                            athleteUID: athlete.athleteUID,
                            email: athlete.email,
                            username: athlete.username,
                            joiningDate: athlete.joiningDate
                        }}
                        buttonHandler={this.handleManageAthleteClick}
                    />
            })
        })
        return payload
    }

    initProgramGroupTableData = (userObject) => {
        var tableData = []

        if (userObject.programGroups !== undefined) {
            Object.keys(userObject.programGroups).forEach(programGroupName => {
                var programGroup = userObject.programGroups[programGroupName]
                console.log(programGroup)

                var sequentialTableVal = ''

                if (programGroup.sequential) {
                    var sequentialOrder = []

                    Object.keys(programGroup.sequential).forEach(program => {
                        sequentialOrder.push([program.split('_')[0], parseInt(programGroup.sequential[program].split('_')[0])])
                    })

                    sequentialOrder.sort((a, b) => {
                        return a[1] - b[1]
                    })

                    sequentialTableVal =
                        <List bulleted>
                            {
                                sequentialOrder.map(program => {
                                    return (
                                        <List.Item key={program}>
                                            {program[1] + ': ' + program[0]}
                                        </List.Item>
                                    )
                                })

                            }
                        </List>

                    console.log(sequentialOrder)
                }

                tableData.push({
                    programGroup: programGroupName,
                    unlimited:
                        !programGroup.unlimited ?
                            ''
                            :
                            <List bulleted>
                                {
                                    programGroup.unlimited.map(program => {
                                        return (
                                            <List.Item key={program}>
                                                {program.split('_')[0]}
                                            </List.Item>
                                        )
                                    })
                                }
                            </List>,
                    sequential: sequentialTableVal,
                    unlimitedRawData: programGroup.unlimited,
                    sequentialRawData: programGroup.sequential

                })

            })
            return tableData
        } else {
            return undefined
        }
    }

    initCoachProgramTableData = (userObject) => {
        var tableData = []

        if (userObject.currentPrograms !== undefined) {
            Object.keys(userObject.currentPrograms).forEach(programName => {
                var program = userObject.currentPrograms[programName]
                console.log(program)
                tableData.push({
                    program: programName.split('_')[0],
                    loadingScheme: loadingSchemeString(program.loading_scheme),
                    acutePeriod: program.acutePeriod,
                    chronicPeriod: program.chronicPeriod,
                    programLength: program.currentDayInProgram % 7,
                    programUID: programName
                })
            })
            return tableData
        } else {
            return undefined
        }
    }

    handleBackClick = (pageView) => {

        if (pageView === 'home') {
            this.setState({
                pageBodyContentLoading: true
            }, () => {
                this.setState({
                    currAthlete: undefined,
                    pageBodyContentLoading: false,
                })
            })
        } else {
            this.setState({
                pageBodyContentLoading: true
            }, () => {

                var previousPage = this.state.currAthlete.pageHistory.back()

                this.setState(prevState => ({
                    currAthlete: {
                        ...prevState.currAthlete,
                        view: previousPage,
                    },
                    pageBodyContentLoading: false,
                }))
            })
        }
    }

    handleDeployAthleteProgram = (programData) => {

        this.setState({
            pageBodyContentLoading: true,
        }, () => {
            let timestamp = new Date().getTime()
            console.log(programData)
            let progInfo = {}
            let renderPayload = []

            if (programData.unlimited) {
                programData.unlimited.forEach(program => {
                    progInfo[program.programUID] = {
                        programUID: program.programUID,
                        isUnlimited: true,
                        deploymentDate: timestamp
                    }


                    renderPayload.push({
                        program: program.programUID.split("_")[0],
                        team: 'none',
                        timestampAssigned: timestamp,
                        dateAssigned: utsToDateString(timestamp),
                        buttons: false
                    })
                })
            }

            if (programData.sequential) {

                programData.sequential.forEach(program => {

                    let isActiveInSequence = false
                    if (programData.sequenceName === 'preDetermined') {
                        if (parseInt(program.order.split('_')[0]) === 1) {
                            isActiveInSequence = true
                        }
                    } else {
                        if (parseInt(program.order) === 1) {
                            isActiveInSequence = true
                        }
                    }

                    progInfo[program.programUID] = {
                        programUID: program.programUID,
                        isUnlimited: false,
                        deploymentDate: timestamp,
                        isActiveInSequence: isActiveInSequence,
                        order:
                            programData.sequenceName === 'preDetermined' ?
                                program.order
                                :
                                program.order
                                + '_' + programData.sequenceName
                                + '_' + 'none'
                                + '_' + this.props.firebase.auth.currentUser.uid
                                + '_' + timestamp
                    }

                    renderPayload.push({
                        program: program.programUID.split("_")[0],
                        team: 'none',
                        timestampAssigned: timestamp,
                        dateAssigned: utsToDateString(timestamp),
                        buttons: false
                    })
                })
            }

            let currentAthProgData = [...this.state.currAthlete.athProgTableData.data]

            renderPayload.forEach(prog => {
                currentAthProgData.unshift(prog)
            })

            this.props.firebase.deployAthletePrograms(
                this.props.firebase.auth.currentUser.uid,
                this.state.currAthlete.uid,
                progInfo
            ).then(updatedProgramData => {
                this.setState(prevState => ({
                    ...prevState,
                    pageBodyContentLoading: false,
                    currAthlete: {
                        ...prevState.currAthlete,
                        athProgTableData: this.initAthProgTableData(updatedProgramData),
                        view: 'managePrograms'
                    }
                }))
            })

        })
    }

    // Updated with new ratio calcs format
    handleDeleteExerciseButton = (id) => {
        var exUID = id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        var day = exUID.split('_').reverse()[1]
        this.props.firebase.deleteExerciseDB(
            false,
            this.state.currAthlete.uid,
            this.state.currAthlete.programUID,
            day,
            exUID
        )
    }

    handleSubmitButton = () => {
        this.setState(prevState => ({
            currAthlete: {
                ...prevState.currAthlete,
                submitProcessingBackend: true
            }
        }), () => {
            this.props.firebase.getProgramExData(
                false,
                this.state.currAthlete.uid,
                this.state.currAthlete.programUID,
            )
                .then(snapshot => {
                    let programClass = this.state.currAthlete.currentProgramList.getProgram(this.state.currAthlete.programUID)

                    var programObject = programClass.generateCompleteJSONObject()

                    programObject = { ...programObject, ...snapshot }

                    var dataCheck = checkNullExerciseData(
                        programObject[programObject.currentDay],
                        programObject.loadingScheme
                    )
                    if (dataCheck.allValid) {
                        var processedDayData = calculateDailyLoads(
                            programObject,
                            programObject.currentDay,
                            programObject.loadingScheme,
                            programObject.acutePeriod,
                            programObject.chronicPeriod,
                            this.state.currAthlete.rawAnatomyData
                        )

                        this.props.firebase.submitDayDB(
                            false,
                            this.state.currAthlete.uid,
                            this.state.currAthlete.programUID,
                            programObject.currentDay,
                            processedDayData
                        )
                            .then(() => {
                                this.state.currAthlete.currentProgramList.getProgram(this.state.currAthlete.programUID).iterateCurrentDay(1)

                                var frontEndProgData = { ...programObject }

                                console.log(frontEndProgData)
                                console.log(programObject)

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
                                    currAthlete: {
                                        ...prevState.currAthlete,
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
                            currAthlete: {
                                ...prevState.currAthlete,
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
            var programObject = this.state.currAthlete.pendingLoadSubmissionData

            var processedDayData = calculateDailyLoads(
                programObject,
                programObject.currentDay,
                programObject.loadingScheme,
                programObject.acutePeriod,
                programObject.chronicPeriod,
                this.state.currAthlete.rawAnatomyData
            )
            this.props.firebase.submitDayDB(
                false,
                this.state.currAthlete.uid,
                this.state.currAthlete.programUID,
                programObject.currentDay,
                processedDayData
            )
                .then(() => {

                    this.state.currAthlete.currentProgramList.getProgram(this.state.currAthlete.programUID).iterateCurrentDay(1)

                    var frontEndProgData = { ...programObject }

                    frontEndProgData[programObject.currentDay]['loadingData'] = processedDayData

                    frontEndProgData.currentDay += 1
                    console.log(frontEndProgData)

                    this.setState(prevState => ({
                        ...prevState,
                        currAthlete: {
                            ...prevState.currAthlete,
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
                currAthlete: {
                    ...prevState.currAthlete,
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

    handleUpdateExercise = (updateObject) => {

        var day = updateObject.exUid.split('_').reverse()[1]
        if (this.state.currAthlete.programData.loadingScheme === 'rpe_time') {
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
            false,
            this.state.currAthlete.uid,
            this.state.currAthlete.programUID,
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

        this.props.firebase.addExerciseDB(
            false,
            this.state.currAthlete.uid,
            this.state.currAthlete.programUID,
            insertionDay,
            payload
        )
    }

    render() {
        const {
            programData,
            programGroupData,
            loading,
            pageBodyContentLoading,
            manageAthleteTableData,
            currAthlete,
        } = this.state
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingNonAthHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    <div className='pageMainHeader'>
                        Athlete Management
                    </div>
                </div>
                {
                    manageAthleteTableData &&
                    <BasicTablePagination
                        data={manageAthleteTableData.data}
                        columns={manageAthleteTableData.columns}
                    />
                }
            </NonLandingPageWrapper>

        let nonLoadingCurrAthHTML =
            <NonLandingPageWrapper>
                {
                    currAthlete &&
                    <ViewProgramErrorModal
                        showModal={currAthlete.showViewProgramErrorModal}
                        errorType={currAthlete.viewProgramErrorType}
                        handleFormProceed={this.handleViewProgramErrorModalDecision}
                        athleteName={currAthlete.username}
                    />
                }
                <div className="pageContainerLevel1">
                    {
                        currAthlete &&
                        <>
                            <div className='pageMainHeader'>
                                {(currAthlete.username)}
                            </div>
                            {
                                currAthlete.view !== 'viewProgram' &&
                                <>
                                    <div className='pageSubHeader2'>
                                        Email: {currAthlete.email}
                                    </div>
                                    <div className='pageSubHeader2'>
                                        Date Joined: {currAthlete.joinDate}
                                    </div>
                                </>
                            }
                            {
                                currAthlete.view === 'managePrograms' &&
                                <div className='rowContainer centred-info sml-margin-top'>
                                    <Button
                                        className='lightPurpleButton'
                                        onClick={() => { this.handleManageCurrAthleteViewChange('programDeployment') }}
                                    >
                                        Assign New Program
                                </Button>
                                </div>
                            }
                            {
                                currAthlete.view === 'manageTeams' &&
                                <div className='rowContainer centred-info sml-margin-top'>
                                    <Button
                                        className='lightPurpleButton'
                                        onClick={() => { this.handleManageCurrAthleteViewChange('teamAssignment') }}
                                    >
                                        Assign New Team
                                </Button>
                                </div>
                            }
                            {
                                currAthlete.view === 'viewProgram' &&
                                <ProgramViewPageSubHeader
                                    programUID={currAthlete.programUID}
                                    data={currAthlete.programData}
                                />
                            }
                        </>

                    }
                </div>
                {
                    currAthlete &&
                    <div className='rowContainer clickableDiv'>
                        <Button
                            content='Back'
                            className='backButton-inverted'
                            circular
                            icon='arrow left'
                            onClick={() => { this.handleBackClick(currAthlete.view) }}
                        />
                    </div>
                }
                {
                    currAthlete && currAthlete.view === 'home' &&
                    <ManageCurrAthleteHome
                        clickHandler={this.handleManageCurrAthleteViewChange}
                    />
                }
                {
                    currAthlete && currAthlete.view === 'managePrograms' &&
                    < div className='pageContainerLevel1'>
                        <InputLabel
                            text='Program History'
                            custID='programHistHeader'
                        />
                        {
                            currAthlete.athProgTableData &&
                            <BasicTablePagination
                                data={currAthlete.athProgTableData.data}
                                columns={currAthlete.athProgTableData.columns}
                            />
                        }
                    </div>
                }
                {
                    currAthlete && currAthlete.view === 'programDeployment' &&
                    <div className='centred-info'>
                        <div className='pageContainerLevel1 half-width'>
                            <ProgramDeployment
                                initProgTabData={programData}
                                submitHandler={this.handleDeployAthleteProgram}
                                initProgGroupTabData={programGroupData}
                            />
                        </div>
                    </div>
                }
                {
                    currAthlete && currAthlete.view === 'viewProgram' && currAthlete.programData &&
                    <ProgramView
                        developmentMode={false}
                        data={currAthlete.programData}
                        handlerFunctions={currAthlete.viewProgramFunctions}
                        availExData={currAthlete.availExData}
                        availExColumns={currAthlete.availExColumns}
                        nullExerciseData={currAthlete.nullExerciseData}
                        submitProcessingBackend={currAthlete.submitProcessingBackend}
                        rawAnatomyData={currAthlete.rawAnatomyData}
                        userType={'coach'}
                    />
                }
                {
                    currAthlete && currAthlete.view === 'manageTeams' &&
                    < div className='pageContainerLevel1'>
                        <InputLabel
                            text='Team History'
                            custID='programHistHeader'
                        />
                        {
                            currAthlete.athTeamTableData &&
                            <BasicTablePagination
                                data={currAthlete.athTeamTableData.data}
                                columns={currAthlete.athTeamTableData.columns}
                            />
                        }
                    </div>
                }
                {
                    currAthlete && currAthlete.view === 'teamAssignment' &&
                    <div>
                        <AssignNewTeam
                            teamList={currAthlete.coachTeamTableData}
                            handleSubmit={this.handleAssignAthleteNewTeam}
                        />
                    </div>
                }
            </NonLandingPageWrapper>

        let pageBodyContentLoadingHTML =
            <NonLandingPageWrapper>
                <div className='vert-aligned'>
                    <Loader active inline='centered' content='Preparing Athlete Data...' />
                </div>

            </NonLandingPageWrapper>


        return (
            <div>
                {
                    loading
                    && !pageBodyContentLoading
                    && loadingHTML
                }
                {
                    !loading
                    && !pageBodyContentLoading
                    && currAthlete === undefined
                    && nonLoadingNonAthHTML
                }
                {
                    !loading
                    && !pageBodyContentLoading
                    && currAthlete
                    && nonLoadingCurrAthHTML
                }
                {
                    !loading
                    && pageBodyContentLoading
                    && currAthlete
                    && pageBodyContentLoadingHTML
                }
            </div >
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageAthletesPage);