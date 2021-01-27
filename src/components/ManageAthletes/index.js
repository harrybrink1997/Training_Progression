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
import { capitaliseFirstLetter } from '../../constants/stringManipulation';
import { setAvailExerciseCols, listAndFormatLocalGlobalExercises } from '../../constants/viewProgramPagesFunctions'


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

        var payLoad = []

        if (!locationData) {
            return false
        } else {
            for (var prog in locationData) {

                if (prog === name) {
                    if (locationData[prog].deploymentDate === time) {
                        return true
                    } else {
                        payLoad.push({
                            deploymentDate: locationData[prog].deploymentDate,
                            order: locationData[prog].order,
                            isActiveInSequence: locationData[prog].isActiveInSequence
                        })
                    }
                }
            }

            return payLoad
        }


    }

    checkProgramExistence = (userObject, programName, time) => {
        var payLoad = {
            pendingPrograms: this.checkProgramLocation(userObject.pendingPrograms, programName, time),
            currentPrograms: this.checkProgramLocation(userObject.currentPrograms, programName, time),
            pastPrograms: this.checkProgramLocation(userObject.pastPrograms, programName, time)
        }

        if (!payLoad.pendingPrograms && !payLoad.currentPrograms && !payLoad.pastPrograms) {
            return false
        }

        return payLoad
    }

    handleViewProgramClick = (athleteUid, programName, deploymentTime) => {
        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.props.firebase.getUserData(
                athleteUid
            ).once('value', userData => {
                const userObject = userData.val();

                var existenceData = this.checkProgramExistence(userObject, programName, deploymentTime)

                // If existenceData is false then the program name does not exist anyway in the athletes program data.
                if (!existenceData) {
                    //Represent this in the modal.
                    this.setState(prevState => ({
                        currAthlete: {
                            ...prevState.currAthlete,
                            showViewProgramErrorModal: true,
                            viewProgramErrorType: 'nonExistent'
                        },
                        pageBodyContentLoading: false
                    }))
                } else {
                    // If the program exists, however, is in pending programs. Show this state in the modal. 
                    if (existenceData.pendingPrograms === true) {

                        this.setState(prevState => ({
                            currAthlete: {
                                ...prevState.currAthlete,
                                showViewProgramErrorModal: true,
                                viewProgramErrorType: 'inPending'
                            },
                            pageBodyContentLoading: false
                        }))

                    } else if (existenceData.currentPrograms === true) {
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
                                        view: 'viewProgram'
                                    },
                                    pageBodyContentLoading: false
                                }))


                            })
                        });
                    } else if (existenceData.pastPrograms === true) {

                        console.log("inPastPrograms")
                    }
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
        console.log(view)
        this.setState(prevState => ({
            currAthlete: {
                ...prevState.currAthlete,
                view: view
            }
        }))
    }

    initAthProgTableData = (data, athleteUid) => {
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

                            returnData.data.push({
                                program: prog.split('_')[0],
                                team: team,
                                timestampAssigned: deployTime,
                                dateAssigned: utsToDateString(parseInt(deployTime)),
                                buttons:
                                    <Button
                                        className='lightPurpleButton-inverted'
                                        onClick={() => { this.handleViewProgramClick(athleteUid, prog, deployTime) }}
                                    >
                                        View Program
                                </Button>


                            })
                        })
                    })
                }
            })
            console.log(returnData)
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

                    var athlete = userObject.currentAthletes[athleteUid]

                    this.setState({
                        pageBodyContentLoading: false,
                        currAthlete: {
                            uid: athleteUid,
                            username: athlete.username,
                            email: athlete.email,
                            joinDate: utsToDateString(parseInt(athlete.joinDate)),
                            currTeams: athlete.teams ? Object.keys(athlete.teams).length : '0',
                            athProgTableData: this.initAthProgTableData(athlete, athleteUid),
                            athTeamTableData: this.initAthTeamTableData(athlete),
                            view: 'home',
                            showViewProgramErrorModal: false,
                            viewProgramErrorType: undefined,
                            currViewedProgramName: undefined,
                            currViewedProgramData: undefined,
                            viewProgramFunctions: {
                                handleDeleteExerciseButton: this.handleDeleteExerciseButton,
                                handleUpdateExercise: this.handleUpdateExercise,
                                handleAddExerciseButton: this.handleAddExerciseButton
                            }

                        }
                    })
                });
        })
    }

    initAthleteManagementTableData = (userObject, coachProgramTableData) => {

        var tableData = []
        var progGroupTableData = this.initProgramGroupTableData(userObject)
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
                                        <List.Item>
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
                                            <List.Item>
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
                this.setState(prevState => ({
                    currAthlete: {
                        ...prevState.currAthlete,
                        view: 'home'
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

    handleAddExerciseButton = (exerciseObject) => {

        var exUID = this.generateExerciseUID(exerciseObject.name, exerciseObject.day)

        if (this.state.loadingScheme == 'rpe_time') {
            var dataPayload = {
                exercise: this.underscoreToSpaced(exerciseObject.name),
                sets: exerciseObject.sets,
                rpe: exerciseObject.rpe,
                time: exerciseObject.time,
                reps: exerciseObject.reps,
                primMusc: exerciseObject.primMusc
            }
        } else {
            dataPayload = {
                exercise: this.underscoreToSpaced(exerciseObject.name),
                sets: exerciseObject.sets,
                time: exerciseObject.time,
                reps: exerciseObject.reps,
                rpe: exerciseObject.rpe,
                weight: exerciseObject.weight,
                primMusc: exerciseObject.primMusc
            }
        }
        this.props.firebase.createExerciseUpStream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            this.convertUIDayToTotalDays(exerciseObject.day),
            dataPayload,
            exUID
        )

        this.setState({
            currentDayUI: exerciseObject.day
        })


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
                    <div className='rowContainer clickableDiv' onClick={() => { this.handleBackClick(currAthlete.view) }}>
                        <Button className='backButton-inverted' circular icon='arrow left' />
                        <div className='lightPurpleText vert-aligned'>
                            {
                                currAthlete.view === 'home' &&
                                <>Athlete Management</>
                            }
                            {
                                currAthlete.view !== 'home' &&
                                <>Athlete Home</>
                            }
                        </div>
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