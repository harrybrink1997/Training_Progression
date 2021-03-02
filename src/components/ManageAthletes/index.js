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
import { setAvailExerciseCols, listAndFormatLocalGlobalExercises, checkNullExerciseData } from '../../constants/viewProgramPagesFunctions'
import { calculateDailyLoads, dailyLoadCalcs } from '../CurrentProgram/calculateWeeklyLoads'
import AssignNewTeam from './assignNewTeam'
import PageHistory from '../CustomComponents/pageHistory'
import { createUserObject } from '../../objects/user'


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

        // var currUserUid = this.props.firebase.auth.currentUser.uid
        // this.props.firebase.getUserData(currUserUid).on('value', userData => {
        //     const userObject = userData.val();

        //     this.updateObjectState(userObject)
        // });
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

    handleViewProgramClick = (athleteUid, programName, deploymentTime, location) => {
        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.props.firebase.getUserData(
                athleteUid
            ).once('value', userData => {
                const userObject = userData.val();

                if (location === 'currentPrograms') {
                    console.log("in current programs")
                    var programData = userObject.currentPrograms[programName]

                    // Get the data for available exercises. 
                    this.props.firebase.exercises().once('value', snapshot => {
                        const globalExObject = snapshot.val()

                        this.props.firebase.localExerciseData(
                            this.props.firebase.auth.currentUser.uid
                        ).once('value', snapshot => {
                            const localExObject = snapshot.val()

                            this.state.currAthlete.pageHistory.next(this.state.currAthlete.view)

                            this.setState(prevState => ({
                                currAthlete: {
                                    ...prevState.currAthlete,
                                    currViewedProgramName: programName,
                                    currViewedProgramData: programData,
                                    combinedAvailExerciseList: listAndFormatLocalGlobalExercises(globalExObject, localExObject),
                                    availExerciseColumns: setAvailExerciseCols(),
                                    view: 'viewProgram'
                                },
                                pageBodyContentLoading: false
                            }))


                        })
                    });
                } else if (location === 'pastPrograms') {

                    console.log("inPastPrograms")
                }
            })
        })
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

        var payLoad = {}
        var coachPath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/${athleteUID}/teams/${teamName}/`
        var timestamp = new Date().getTime().toString()
        payLoad[coachPath + 'activeMember'] = false
        payLoad[coachPath + 'leavingDate'] = timestamp

        let currTeamData = [...this.state.currAthlete.athTeamTableData.data]

        for (var team in currTeamData) {
            if (currTeamData[team].team === teamName) {
                currTeamData[team].buttons = false
                currTeamData[team].leaveDate = utsToDateString(parseInt(timestamp))
            }
        }

        this.props.firebase.updateDatabaseFromRootPath(payLoad)
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
    }

    initAthTeamTableData = (teams, athleteUid) => {
        console.log(teams)
        if (Object.keys(teams).length > 0) {
            var returnData = {}
            returnData.columns = [
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
            ]

            returnData.data = []
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
            console.log(returnData)
            return returnData
        } else {
            return undefined
        }
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

        if (programs.length > 0) {

            var returnData = {}

            returnData.columns = [
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
                    accessor: 'buttons'
                }
            ]

            returnData.data = []
            programs.forEach(program => {
                returnData.data.push({
                    program: program.name,
                    team: program.team,
                    timestampAssigned: program.deploymentDate,
                    dateAssigned: utsToDateString(parseInt(program.deploymentDate)),
                    buttons:
                        <Button
                            className='lightPurpleButton-inverted'
                            onClick={() => { this.handleViewProgramClick(athleteUID, program.programUID, program.deploymentDate) }}
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

            return returnData
        } else {
            return undefined
        }
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
            // this.props.firebase.getUserData(
            //     this.props.firebase.auth.currentUser.uid
            // )
            //     .once('value', userData => {
            //         const userObject = userData.val();

            // this.props.firebase.anatomy().once('value', async snapshot => {
            //     const anatomyObject = snapshot.val();

            // this.props.firebase.getUserData(athleteUid).once('value', athData => {
            //     const athleteObject = athData.val();
            this.props.firebase.getIndividualAthleteProfileAndManagementData(
                this.props.firebase.auth.currentUser.uid,
                athlete.athleteUID
            ).then(data => {
                console.log(data)
                this.setState({
                    pageBodyContentLoading: false,
                    currAthlete: {
                        uid: athlete.athleteUID,
                        username: athlete.username,
                        email: athlete.email,
                        joinDate: utsToDateString(parseInt(athlete.joiningDate)),
                        currTeams: Object.keys(data.teams),
                        athProgTableData: this.initAthProgTableData(data.programs, athlete.athleteUID),
                        athTeamTableData: this.initAthTeamTableData(data.teams, athlete.athleteUID),
                        view: 'home',
                        pageHistory: new PageHistory(),
                        showViewProgramErrorModal: false,
                        viewProgramErrorType: undefined,
                        currViewedProgramName: undefined,
                        currViewedProgramData: undefined,
                        // coachTeamTableData: this.initCoachTeamTableData(userObject),
                        viewProgramFunctions: {
                            handleDeleteExerciseButton: this.handleDeleteExerciseButton,
                            handleUpdateExercise: this.handleUpdateExercise,
                            handleAddExerciseButton: this.handleAddExerciseButton,
                            handleSubmitButton: this.handleSubmitButton,
                            handleNullCheckProceed: this.handleNullCheckProceed,
                            handleStartProgram: this.handleStartProgram
                        },
                        nullExerciseData: {
                            hasNullData: false,
                            nullTableData: []
                        },
                        submitProcessingBackend: false,
                        rawAnatomyData: data.anatomyObject

                    }
                })
            })
        })
    }

    handleStartProgram = (timestamp, programName) => {
        console.log(this.state.currAthlete)
        var path =
            '/users/'
            + this.state.currAthlete.uid
            + '/currentPrograms/'
            + this.state.currAthlete.currViewedProgramName
            + '/startDayUTS'

        var payLoad = {}
        payLoad[path] = timestamp

        this.props.firebase.updateDatabaseFromRootPath(payLoad)
    }

    checkAthleteAssignedToTeam = (athleteObject, team) => {
        if (athleteObject[team]) {
            return {
                activeMember: athleteObject[team].activeMember
            }
        } else {
            return false
        }
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

        console.log(this.state.currAthlete)

        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.props.firebase.getUserData(this.props.firebase.auth.currentUser.uid).once('value', snapshot => {

                let currAthTeamTableData = [...this.state.currAthlete.athTeamTableData.data]

                var timestamp = new Date().getTime()
                var payLoad = {}
                var insertionData = {
                    activeMember: true,
                    joiningDate: timestamp
                }
                var athleteUID = this.state.currAthlete.uid
                var coachPath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/${athleteUID}/teams/${team}`
                const userObject = snapshot.val();

                if (!userObject.currentAthletes[athleteUID].teams) {
                    // No teams have been assigned to athlete and you can go ahead. 
                    payLoad[coachPath] = insertionData

                    currAthTeamTableData.push({
                        team: team,
                        joinDate: utsToDateString(timestamp),
                        leaveDate: undefined,
                        buttons:
                            <Button
                                className='lightRedButton-inverted'
                                onClick={() => { this.handleRemoveAthleteFromTeam(team, athleteUID) }}
                            >
                                Remove From Team
                        </Button>

                    })

                    this.updateStateOnNewTeamAssignment(currAthTeamTableData)

                    console.log(payLoad)
                    this.props.firebase.updateDatabaseFromRootPath(payLoad)
                } else {

                    var prevAthAssignment = this.checkAthleteAssignedToTeam(
                        userObject.currentAthletes[athleteUID].teams,
                        team
                    )

                    if (!prevAthAssignment) {

                        payLoad[coachPath] = insertionData
                        console.log(payLoad)

                        currAthTeamTableData.push({
                            team: team,
                            joinDate: utsToDateString(timestamp),
                            leaveDate: undefined,
                            buttons:
                                <Button
                                    className='lightRedButton-inverted'
                                    onClick={() => { this.handleRemoveAthleteFromTeam(team, athleteUID) }}
                                >
                                    Remove From Team
                            </Button>

                        })
                        console.log(payLoad)
                        console.log(currAthTeamTableData)

                        this.updateStateOnNewTeamAssignment(currAthTeamTableData)

                        this.props.firebase.updateDatabaseFromRootPath(payLoad)
                    } else {
                        if (prevAthAssignment.activeMember) {
                            //Set an error modal and not update DB.

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
                        } else {
                            // Remove the leaving date from db and set active member to true. 
                            payLoad[coachPath + '/activeMember'] = true
                            payLoad[coachPath + '/leavingDate'] = null

                            for (var prog in currAthTeamTableData) {
                                if (currAthTeamTableData[prog].team === team) {
                                    currAthTeamTableData[prog].leaveDate = undefined
                                    currAthTeamTableData[prog].buttons =
                                        <Button
                                            className='lightRedButton-inverted'
                                            onClick={() => { this.handleRemoveAthleteFromTeam(team, athleteUID) }}
                                        >
                                            Remove From Team
                                        </Button>

                                }
                            }
                            console.log(payLoad)

                            this.updateStateOnNewTeamAssignment(currAthTeamTableData)


                            this.props.firebase.updateDatabaseFromRootPath(payLoad)
                        }
                    }
                }
            })
        })
    }

    initCoachTeamTableData = (userObject) => {

        if (!userObject.teams) {
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

            Object.keys(userObject.teams).forEach(team => {
                data.push({
                    team: team,
                    description: userObject.teams[team].description
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
            var payLoad = {}
            var renderPayload = []
            var timestamp = new Date().getTime()
            var athleteUid = this.state.currAthlete.uid
            var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`

            this.props.firebase.getSharedPrograms(
                this.props.firebase.auth.currentUser.uid,
                athleteUid,
                'none'
            ).once('value', userData => {
                const sharedProgObj = userData.val();

                if (programData.unlimited) {
                    programData.unlimited.forEach(program => {

                        var insertionProgramObject = this.state.currentProgramsData[program.programUID]
                        insertionProgramObject.currentDayInProgram = 1
                        insertionProgramObject.deploymentDate = timestamp

                        // Database path to insert into the athletes pending programs.
                        payLoad['/users/' + athleteUid + '/pendingPrograms/' + program.programUID] = insertionProgramObject
                        // Database path to keep track of what prograsms have been shared with which athlete and when.

                        if (!sharedProgObj || !sharedProgObj.sharedPrograms[program.programUID]) {

                            payLoad[athletePath + athleteUid + '/teams/' + 'none' + '/sharedPrograms/' + program.programUID] = [timestamp]
                        } else {
                            let deployTimes = [...sharedProgObj.sharedPrograms[program.programUID], timestamp]

                            payLoad[athletePath + athleteUid + '/teams/' + 'none' + '/sharedPrograms/' + program.programUID] = deployTimes
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

                        var isActiveInSequence = false
                        if (programData.sequenceName === 'preDetermined') {
                            if (parseInt(program.order.split('_')[0]) === 1) {
                                isActiveInSequence = true
                            }
                        } else {
                            if (parseInt(program.order) === 1) {
                                isActiveInSequence = true
                            }
                        }

                        var insertionProgramObject = this.state.currentProgramsData[program.programUID]
                        insertionProgramObject.currentDayInProgram = 1
                        insertionProgramObject.isActiveInSequence = isActiveInSequence
                        insertionProgramObject.order =
                            programData.sequenceName === 'preDetermined' ?
                                program.order
                                :
                                program.order
                                + '_' + programData.sequenceName
                                + '_' + 'none'
                                + '_' + this.props.firebase.auth.currentUser.uid
                                + '_' + timestamp
                        insertionProgramObject.deploymentDate = timestamp
                        payLoad['/users/' + athleteUid + '/pendingPrograms/' + program.programUID] = insertionProgramObject

                        if (!sharedProgObj || !sharedProgObj.sharedPrograms[program.programUID]) {
                            payLoad[athletePath + athleteUid + '/teams/' + 'none' + '/sharedPrograms/' + program.programUID] = [timestamp]
                        } else {
                            let deployTimes = [...sharedProgObj.sharedPrograms[program.programUID], timestamp]

                            payLoad[athletePath + athleteUid + '/teams/' + 'none' + '/sharedPrograms/' + program.programUID] = deployTimes
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

                console.log(payLoad)
                console.log(this.state.currAthlete.athProgTableData.data)

                let currentAthProgData = [...this.state.currAthlete.athProgTableData.data]

                renderPayload.forEach(prog => {
                    currentAthProgData.unshift(prog)
                })

                this.props.firebase.updateDatabaseFromRootPath(payLoad)

                this.setState(prevState => ({
                    ...prevState,
                    pageBodyContentLoading: false,
                    currAthlete: {
                        ...prevState.currAthlete,
                        athProgTableData: {
                            ...prevState.currAthlete.athProgTableData,
                            data: currentAthProgData
                        },
                        view: 'managePrograms'
                    }
                }))
            })
        })
    }

    // Updated with new ratio calcs format
    handleDeleteExerciseButton = (id) => {
        var exUid = id.slice(0, -10)
        //Single db call to delete the data. Using set with uid generated by function above.
        var day = exUid.split('_').reverse()[1]
        this.props.firebase.deleteExerciseUpStream(
            this.state.currAthlete.uid,
            this.state.currAthlete.currViewedProgramName,
            day,
            exUid
        )
    }

    handleSubmitButton = () => {
        // Get the current exercise data for the given week.
        // And for the current active program.

        this.setState(prevState => ({
            currAthlete: {
                ...prevState.currAthlete,
                submitProcessingBackend: true
            }
        }), () => {
            this.props.firebase.getProgramData(
                this.state.currAthlete.uid,
                this.state.currAthlete.currViewedProgramName
            ).once('value', userData => {
                var programObject = userData.val();

                this.props.firebase.anatomy().once('value', async snapshot => {
                    const anatomyObject = snapshot.val();

                    var dataCheck = checkNullExerciseData(
                        programObject[programObject.currentDayInProgram],
                        programObject.loading_scheme
                    )

                    if (dataCheck.allValid) {
                        var processedDayData = calculateDailyLoads(
                            programObject,
                            programObject.currentDayInProgram,
                            programObject.loading_scheme,
                            programObject.acutePeriod,
                            programObject.chronicPeriod,
                            anatomyObject
                        )

                        // Submit day in one update statement.
                        var loadPath =
                            programObject.currentDayInProgram
                            + '/'
                            + 'loadingData'

                        var currDay = 'currentDayInProgram'


                        var payLoad = {}
                        payLoad[loadPath] = processedDayData
                        payLoad[currDay] = parseInt(this.state.currAthlete.currViewedProgramData.currentDayInProgram + 1)

                        this.props.firebase.handleSubmitDayUpstream(
                            this.state.currAthlete.uid,
                            this.state.currAthlete.currViewedProgramName,
                            payLoad
                        )

                        var frontEndProgData = { ...programObject }

                        frontEndProgData[programObject.currentDayInProgram]['loadingData'] = processedDayData

                        frontEndProgData.currentDayInProgram += 1

                        this.setState(prevState => ({
                            currAthlete: {
                                ...prevState.currAthlete,
                                submitProcessingBackend: false,
                                currViewedProgramData: frontEndProgData
                            }
                        }))
                    } else {
                        this.setState(prevState => ({
                            currAthlete: {
                                ...prevState.currAthlete,
                                nullExerciseData: {
                                    hasNullData: true,
                                    nullTableData: dataCheck.exercisesToCheck
                                }
                            }
                        }))
                    }
                });

            })
        })
    }

    handleNullCheckProceed = (proceed) => {
        console.log(proceed)
        if (proceed) {
            this.props.firebase.getProgramData(
                this.state.currAthlete.uid,
                this.state.currAthlete.currViewedProgramName
            ).once('value', userData => {
                var programObject = userData.val();

                this.props.firebase.anatomy().once('value', snapshot => {
                    const anatomyObject = snapshot.val();

                    var processedDayData = calculateDailyLoads(
                        programObject,
                        programObject.currentDayInProgram,
                        programObject.loading_scheme,
                        programObject.acutePeriod,
                        programObject.chronicPeriod,
                        anatomyObject
                    )

                    // Submit day in one update statement.
                    var loadPath =
                        programObject.currentDayInProgram
                        + '/'
                        + 'loadingData'

                    var currDay = 'currentDayInProgram'


                    var payLoad = {}
                    payLoad[loadPath] = processedDayData
                    payLoad[currDay] = parseInt(this.state.currAthlete.currViewedProgramData.currentDayInProgram + 1)

                    this.props.firebase.handleSubmitDayUpstream(
                        this.state.currAthlete.uid,
                        this.state.currAthlete.currViewedProgramName,
                        payLoad
                    )
                    var frontEndProgData = { ...programObject }

                    frontEndProgData[programObject.currentDayInProgram]['loadingData'] = processedDayData

                    frontEndProgData.currentDayInProgram += 1

                    this.setState(prevState => ({
                        currAthlete: {
                            ...prevState.currAthlete,
                            submitProcessingBackend: false,
                            currViewedProgramData: frontEndProgData
                        }
                    }))
                })

            })
        } else {
            this.setState(prevState => ({
                currAthlete: {
                    ...prevState.currAthlete,
                    submitProcessingBackend: false,
                    nullExerciseData: {
                        hasNullData: false,
                        nullTableData: []
                    }
                }
            }))
        }
    }

    handleUpdateExercise = (updateObject) => {

        var day = updateObject.exUid.split('_').reverse()[1]
        if (this.state.currAthlete.currViewedProgramData.loading_scheme === 'rpe_time') {
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

        this.props.firebase.pushExercisePropertiesUpstream(
            this.state.currAthlete.uid,
            this.state.currAthlete.currViewedProgramName,
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

        this.props.firebase.createExerciseUpStream(
            this.state.currAthlete.uid,
            this.state.currAthlete.currViewedProgramName,
            insertionDay,
            dataPayload,
            exUID
        )
    }

    render() {
        const {
            loading,
            coachProgramTableData,
            coachProgramGroupTableData,
            pageBodyContentLoading,
            manageAthleteTableData,
            currAthlete,
        } = this.state
        if (currAthlete) {
            console.log(currAthlete)
        }
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
                                    programUID={currAthlete.currViewedProgramName}
                                    data={currAthlete.currViewedProgramData}
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
                                initProgTabData={coachProgramTableData}
                                submitHandler={this.handleDeployAthleteProgram}
                                initProgGroupTabData={coachProgramGroupTableData}
                            />
                        </div>
                    </div>
                }
                {
                    currAthlete && currAthlete.view === 'viewProgram' && currAthlete.currViewedProgramData &&
                    <ProgramView
                        data={currAthlete.currViewedProgramData}
                        handlerFunctions={currAthlete.viewProgramFunctions}
                        availExData={currAthlete.combinedAvailExerciseList}
                        availExColumns={currAthlete.availExerciseColumns}
                        nullExerciseData={currAthlete.nullExerciseData}
                        submitProcessingBackend={currAthlete.submitProcessingBackend}
                        rawAnatomyData={currAthlete.rawAnatomyData}
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
            </div>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageAthletesPage);