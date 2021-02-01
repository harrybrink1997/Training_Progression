import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
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
import ProgramDeployment from '../CustomComponents/programDeployment'
import ViewProgramErrorModal from './viewProgramErrorModal'
import CoachProgramView, { CoachProgramViewPageSubHeader } from '../CustomComponents/coachProgramView'
import { capitaliseFirstLetter, underscoreToSpaced } from '../../constants/stringManipulation';
import { convertUIDayToTotalDays } from '../../constants/dayCalculations';
import { setAvailExerciseCols, listAndFormatLocalGlobalExercises, checkNullExerciseData } from '../../constants/viewProgramPagesFunctions'
import { calculateDailyLoads, dailyLoadCalcs } from '../CurrentProgram/calculateWeeklyLoads'


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
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        this.props.firebase.getUserData(currUserUid).on('value', userData => {
            const userObject = userData.val();

            this.updateObjectState(userObject)
        });
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
    }


    updateObjectState = (userObject) => {

        var coachProgTableData = this.initCoachProgramTableData(userObject)

        this.setState({
            athleteManagementTableData: this.initAthleteManagementTableData(userObject, coachProgTableData),
            athleteManagementTableColumns: this.initAthleteTableColumns(),
            coachProgramTableData: coachProgTableData,
            coachProgramGroupTableData: this.initProgramGroupTableData(userObject),
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
                            console.log(listAndFormatLocalGlobalExercises(globalExObject, localExObject))



                            this.setState(prevState => ({
                                currAthlete: {
                                    ...prevState.currAthlete,
                                    currViewedProgramName: programName,
                                    currViewedProgramData: programData,
                                    combinedAvailExerciseList: listAndFormatLocalGlobalExercises(globalExObject, localExObject),
                                    availExerciseColumns: setAvailExerciseCols(),
                                    pageHistory: this.appendPageHistoryArray(),
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

    appendPageHistoryArray = () => {

        let currAthleteState = { ...this.state.currAthlete }
        const currView = currAthleteState.view
        var currPageHistory = currAthleteState.pageHistory
        currPageHistory.push(currView)

        return currPageHistory
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

    initAthTeamTableData = (data) => {

        if (data.teams) {
            var returnData = {}
            returnData.columns = [
                {
                    Header: 'Team',
                    accessor: 'team'
                },
                {
                    Header: 'Date Joined',
                    accessor: 'joinDate'
                },
                {
                    accessor: 'btns'
                }
            ]

            returnData.data = []
            Object.keys(data.teams).forEach(team => {

                returnData.data.push({
                    team: team,
                    joinDate: utsToDateString(parseInt(data.teams[team].joiningDate))
                })
            })
            console.log(returnData)
            return returnData
        } else {
            return undefined
        }
    }

    handleManageCurrAthleteViewChange = (view) => {

        this.setState(prevState => ({
            currAthlete: {
                ...prevState.currAthlete,
                view: view,
                pageHistory: this.appendPageHistoryArray()
            }
        }))
    }

    initAthProgTableData = (data, athleteUid, userObject) => {
        console.log(data)
        if (data.teams) {

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
            Object.keys(data.teams).forEach(team => {

                if (data.teams[team].sharedPrograms) {
                    Object.keys(data.teams[team].sharedPrograms).forEach(prog => {

                        data.teams[team].sharedPrograms[prog].forEach(deployTime => {

                            var existenceData = this.checkProgramExistenceInCurrPast(userObject, prog, deployTime)
                            console.log(existenceData)

                            if (existenceData) {

                                var location =
                                    existenceData.currentPrograms ?
                                        'currentPrograms'
                                        :
                                        'pastPrograms'
                            }

                            returnData.data.push({
                                program: prog.split('_')[0],
                                team: team,
                                timestampAssigned: deployTime,
                                dateAssigned: utsToDateString(parseInt(deployTime)),
                                buttons:
                                    existenceData &&
                                    <Button
                                        className='lightPurpleButton-inverted'
                                        onClick={() => { this.handleViewProgramClick(athleteUid, prog, deployTime, location) }}
                                    >
                                        View Program
                                        </Button>

                            })
                        })
                    })
                }
            })
            returnData.data.sort((a, b) => {
                return (
                    parseInt(b.timestampAssigned) - parseInt(a.timestampAssigned)
                )
            })

            console.log(returnData)

            return returnData
        } else {
            return undefined
        }
    }


    initAthleteTableColumns = () => {
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
                    Header: 'Team',
                    accessor: 'team',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Programs',
                    accessor: 'programs',
                    filter: 'fuzzyText'
                },
                {
                    accessor: 'manageModal',
                }
            ]
        )
    }

    handleManageAthleteClick = (athleteUid) => {
        console.log(athleteUid)
        this.setState({
            pageBodyContentLoading: true,
            currAthlete: {
                uid: athleteUid
            }
        }, () => {
            this.props.firebase.getUserData(
                this.props.firebase.auth.currentUser.uid
            )
                .once('value', userData => {
                    const userObject = userData.val();

                    this.props.firebase.anatomy().once('value', async snapshot => {
                        const anatomyObject = snapshot.val();

                        this.props.firebase.getUserData(athleteUid).once('value', athData => {
                            const athleteObject = athData.val();

                            var athlete = userObject.currentAthletes[athleteUid]

                            this.setState({
                                pageBodyContentLoading: false,
                                currAthlete: {
                                    uid: athleteUid,
                                    username: athlete.username,
                                    email: athlete.email,
                                    joinDate: utsToDateString(parseInt(athlete.joinDate)),
                                    currTeams: athlete.teams ? Object.keys(athlete.teams).length : '0',
                                    athProgTableData: this.initAthProgTableData(athlete, athleteUid, athleteObject),
                                    athTeamTableData: this.initAthTeamTableData(athlete),
                                    view: 'home',
                                    pageHistory: [],
                                    showViewProgramErrorModal: false,
                                    viewProgramErrorType: undefined,
                                    currViewedProgramName: undefined,
                                    currViewedProgramData: undefined,
                                    viewProgramFunctions: {
                                        handleDeleteExerciseButton: this.handleDeleteExerciseButton,
                                        handleUpdateExercise: this.handleUpdateExercise,
                                        handleAddExerciseButton: this.handleAddExerciseButton,
                                        handleSubmitButton: this.handleSubmitButton,
                                        handleNullCheckProceed: this.handleNullCheckProceed
                                    },
                                    nullExerciseData: {
                                        hasNullData: false,
                                        nullTableData: []
                                    },
                                    submitProcessingBackend: false,
                                    rawAnatomyData: anatomyObject

                                }
                            })
                        })
                    });
                })

        })
    }

    initAthleteManagementTableData = (userObject, coachProgramTableData) => {

        var tableData = []
        Object.keys(userObject.currentAthletes).forEach(athleteUID => {
            var athlete = userObject.currentAthletes[athleteUID]
            console.log(athlete)
            tableData.push({
                athlete: athlete.username,
                email: athlete.email,
                team: athlete.team,
                manageModal:
                    <ManageAthleteButton
                        objectUID={athleteUID}
                        buttonHandler={this.handleManageAthleteClick}
                    />
            })
        })

        return tableData
    }

    handleAthleteSelection = (athleteTableData) => {
        this.setState({
            selectedAthletesTable: athleteTableData
        })
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
                let currAthleteState = { ...this.state.currAthlete }
                var currPageHistory = currAthleteState.pageHistory
                var previousPage = currPageHistory.pop()

                this.setState(prevState => ({
                    currAthlete: {
                        ...prevState.currAthlete,
                        view: previousPage,
                        pageHistory: currPageHistory
                    },
                    pageBodyContentLoading: false,
                }))
            })
        }
    }

    handleDeployAthleteProgram = (programData) => {

        var payLoad = {}
        var timestamp = new Date().getTime()
        var athleteUid = this.state.currAthlete.uid
        var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`

        this.props.firebase.getSharedPrograms(
            this.props.firebase.auth.currentUser.uid,
            athleteUid,
            'none'
        ).once('value', userData => {
            const sharedProgObj = userData.val();
            console.log(sharedProgObj)

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
                })
            }

            console.log(payLoad)
            this.props.firebase.createTeamUpstream(payLoad)
            // .then(() => {
            //     this.setState(prevState => ({
            //         currAthlete: {
            //             ...prevState.currAthlete,
            //             view: 'managePrograms'
            //         },
            //     }))
            // })




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
            athleteManagementTableData,
            athleteManagementTableColumns,
            coachProgramTableData,
            coachProgramGroupTableData,
            pageBodyContentLoading,
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

                <RowSelectTable
                    data={athleteManagementTableData}
                    columns={athleteManagementTableColumns}
                    rowSelectChangeHandler={this.handleAthleteSelection}
                />
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
                                currAthlete.view === 'viewProgram' &&
                                <CoachProgramViewPageSubHeader
                                    name={currAthlete.currViewedProgramName}
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
                        {/* <div className='lightPurpleText vert-aligned'>
                            Back
                        </div> */}
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
                    <CoachProgramView
                        data={currAthlete.currViewedProgramData}
                        name={currAthlete.currViewedProgramName}
                        handlerFunctions={currAthlete.viewProgramFunctions}
                        combinedAvailExerciseList={currAthlete.combinedAvailExerciseList}
                        availExerciseColumns={currAthlete.availExerciseColumns}
                        nullExerciseData={currAthlete.nullExerciseData}
                        submitProcessingBackend={currAthlete.submitProcessingBackend}
                        rawAnatomyData={currAthlete.rawAnatomyData}
                    />
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

const condition = role => role === 'coach';
export default withCoachAuthorisation(condition)(ManageAthletesPage);