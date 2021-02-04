import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List, Button } from 'semantic-ui-react'
import CreateTeamModal from './createTeamModal'
import { ManageTeamButton } from '../CustomComponents/customButtons'

import BasicTablePagination from '../CustomComponents/basicTablePagination'
import loadingSchemeString from '../../constants/loadingSchemeString'
import PageHistory from '../CustomComponents/pageHistory'
import utsToDateString from '../../constants/utsToDateString'
import ManageCurrTeamHome from './manageCurrTeamHome';
import { cmp } from '../../constants/sortingFunctions'
import InputLabel from '../CustomComponents/DarkModeInput';
import ProgramDeployment, { initProgDeployCoachProgGroupTableData, initProgDeployCoachProgramTableData } from '../CustomComponents/programDeployment';
import SelectAthletesTable from './selectAthletesTable';

class ManageTeamsPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: true,
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

        this.setState({
            loading: false,
            athleteTableData: this.initAthleteTableData(userObject),
            programTableData: initProgDeployCoachProgramTableData(userObject),
            programGroupTableData: initProgDeployCoachProgGroupTableData(userObject),
            teamsTableData: this.initTeamsTableData(userObject),
            currentProgramsData: userObject.currentPrograms,
            selectedTeamsTable: undefined,
            currTeamListArray: this.initCurrTeamListArray(userObject)
        })

    }

    initCurrTeamListArray = (userObject) => {
        if (userObject.teams) {
            let newArr = [...Object.keys(userObject.teams)]
            newArr.push('none')
            return newArr
        }
        return ['none']
    }

    initAthleteTableData = (userObject) => {

        var payLoad = {
            columns:
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
                ],
            data: []

        }

        var tableData = []
        if (userObject.currentAthletes !== undefined) {
            Object.keys(userObject.currentAthletes).forEach(athleteUID => {
                var athlete = userObject.currentAthletes[athleteUID]

                tableData.push({
                    athlete: athlete.username,
                    email: athlete.email,
                    uid: athleteUID
                })
            })

            payLoad.data = tableData

            return payLoad
        } else {
            return payLoad
        }

    }

    initTeamsTableColumns = () => {
        return (
            [
                {
                    Header: 'Team',
                    accessor: 'team',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Description',
                    accessor: 'description',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Team Count',
                    accessor: 'teamCount',
                    filter: 'fuzzyText'
                },
                {
                    accessor: 'buttons',
                },
            ]
        )
    }

    handleAssignNewTeamMembers = (athletes) => {

        if (athletes.length > 0) {
            this.setState({
                pageBodyContentLoading: true,
            }, () => {
                this.props.firebase.getCoachCurrAthData(this.props.firebase.auth.currentUser.uid).once('value', userData => {

                    const currentAthletes = userData.val();
                    var payLoad = {}
                    var frontEndPayLoad = {
                        currTeamMembers: [...this.state.currTeam.currTeamMemberData.data],
                        nonCurrTeamMembers: []
                    }
                    var athleteUIDArray = []
                    var timestamp = new Date().getTime()
                    var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`
                    var teamName = this.state.currTeam.team


                    console.log(frontEndPayLoad.currTeamMembers)
                    console.log(athletes)
                    console.log(currentAthletes)

                    athletes.forEach(athlete => {
                        var athData = athlete.original
                        athleteUIDArray.push(athData.uid)

                        if (!currentAthletes[athData.uid].teams || !currentAthletes[athData.uid].teams[teamName]) {

                            var feJoinDate = timestamp

                            payLoad[athletePath + athData.uid + '/teams/' + teamName + '/joiningDate'] = timestamp
                        } else {
                            feJoinDate = currentAthletes[athData.uid].teams[teamName].joiningDate

                            payLoad[athletePath + athData.uid + '/teams/' + teamName + '/leavingDate'] = null

                        }

                        payLoad[athletePath + athData.uid + '/teams/' + teamName + '/activeMember'] = true

                        frontEndPayLoad.currTeamMembers.push({
                            athleteUID: athData.uid,
                            username: athData.athlete,
                            email: athData.email,
                            joinDateUTS: feJoinDate,
                            joinDate: utsToDateString(parseInt(feJoinDate)),
                            buttons:
                                <Button
                                    className='lightRedButton-inverted'
                                    onClick={() => { this.handleRemoveAthleteFromTeam(this.state.currTeam.team, athData.uid) }}
                                >
                                    Remove From Team
                                </Button>
                        })

                    })


                    frontEndPayLoad.nonCurrTeamMembers = [...this.state.currTeam.nonCurrTeamMemberData.data].filter(ath => {
                        return (
                            !athleteUIDArray.includes(ath.uid)
                        )
                    })

                    let currTeamsTableData = [...this.state.teamsTableData]
                    console.log(currTeamsTableData)

                    for (var team in currTeamsTableData) {
                        if (currTeamsTableData[team].team === teamName) {
                            currTeamsTableData[team].teamCount += athleteUIDArray.length
                        }
                    }

                    console.log(payLoad)
                    this.props.firebase.updateDatabaseFromRootPath(payLoad)
                    this.setState(prevState => ({
                        ...prevState,
                        teamsTableData: currTeamsTableData,
                        pageBodyContentLoading: false,
                        currTeam: {
                            ...prevState.currTeam,
                            view: this.state.currTeam.pageHistory.back(),
                            nonCurrTeamMemberData: {
                                ...prevState.currTeam.nonCurrTeamMemberData,
                                data: frontEndPayLoad.nonCurrTeamMembers
                            },
                            currTeamMemberData: {
                                ...prevState.currTeam.currTeamMemberData,
                                data: frontEndPayLoad.currTeamMembers
                            },

                        }
                    }))
                })
            })
        }
    }

    handleManageCurrTeamViewChange = (view) => {

        this.state.currTeam.pageHistory.next(this.state.currTeam.view)

        this.setState(prevState => ({
            ...prevState,
            currTeam: {
                ...prevState.currTeam,
                view: view,
            }
        }))
    }

    handleBackClick = (pageView) => {
        if (pageView === 'home') {
            this.setState({
                pageBodyContentLoading: true
            }, () => {
                this.setState({
                    currTeam: undefined,
                    pageBodyContentLoading: false,
                })
            })
        } else {
            this.setState({
                pageBodyContentLoading: true
            }, () => {

                var previousPage = this.state.currTeam.pageHistory.back()
                console.log(previousPage)
                this.setState(prevState => ({
                    currTeam: {
                        ...prevState.currTeam,
                        view: previousPage,
                    },
                    pageBodyContentLoading: false,
                }))
            })
        }
    }

    initTeamsTableData = (userObject) => {
        var tableData = []
        if (userObject.teams !== undefined) {
            Object.keys(userObject.teams).forEach(teamName => {
                var team = userObject.teams[teamName]
                var programsString = ''
                if (team.programs !== undefined) {
                    Object.keys(team.programs).forEach(program => {
                        programsString += program + ','
                    })
                    programsString = programsString.substring(0, programsString.length - 1)
                }

                tableData.push({
                    team: teamName,
                    description: team.description,
                    programs: programsString,
                    teamCount: this.countAthletesOnTeam(teamName, userObject.currentAthletes),
                    buttons:
                        <ManageTeamButton
                            objectUID={teamName}
                            buttonHandler={this.handleManageTeamClick}
                        />
                })
            })
            return tableData
        } else {
            return undefined
        }


    }

    handleDeployTeamProgram = (programData) => {
        console.log(programData)

        console.log(programData)
        this.setState(prevState => ({
            ...prevState,
            pageBodyContentLoading: true
        }), () => {

            this.props.firebase.getUserData(
                this.props.firebase.auth.currentUser.uid
            ).once('value', userData => {
                const userObject = userData.val();
                const currAthObject = userObject.currentAthletes
                if (currAthObject) {
                    const athleteData = []
                    Object.keys(currAthObject).forEach(athlete => {
                        if (currAthObject[athlete].teams) {
                            // If the program exists in the athletes teams list.
                            if (Object.keys(currAthObject[athlete].teams).includes(this.state.currTeam.team)) {
                                if (currAthObject[athlete].teams[this.state.currTeam.team].activeMember) {
                                    athleteData.push({
                                        uid: athlete,
                                        sharedPrograms: currAthObject[athlete].teams[this.state.currTeam.team].sharedPrograms
                                    })
                                }
                            }
                        }
                    })

                    var payLoad = {}
                    var frontEndPayLoad = [...this.state.currTeam.currTeamProgramData.data]
                    var programsObject = {}
                    var timestamp = new Date().getTime()
                    var teamName = this.state.currTeam.team

                    var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`
                    var teamPath = `/users/${this.props.firebase.auth.currentUser.uid}/teams/${teamName}`

                    var progObj = userObject.teams[teamName].programs

                    if (programData.unlimited) {
                        programsObject.unlimited = {}
                        programData.unlimited.forEach(program => {

                            var unlimTeamProgPath = teamPath + '/programs/unlimited/' + program.programUID + '/dateSet'

                            frontEndPayLoad.push({
                                program: program.programUID.split("_")[0],
                                deploymentDate: utsToDateString(timestamp),
                                deploymentUTS: timestamp,
                                programType: 'Unlimited',
                                seqNameAndOrder: '',
                                sequenceName: 'none'
                            })

                            // If the program already has been deployed to the team as an unlimited program. Add to the array. 
                            if (progObj && progObj.unlimited && progObj.unlimited[program.programUID]) {

                                let deployArray = [...progObj.unlimited[program.programUID].dateSet]
                                deployArray.push(timestamp)

                                payLoad[unlimTeamProgPath] = deployArray
                            } else {
                                // If neither of those exists create an array to inser. 
                                payLoad[unlimTeamProgPath] = [timestamp]
                            }
                        })
                    }

                    if (programData.sequential) {
                        programsObject.sequential = {}
                        programData.sequential.forEach(program => {

                            var seqTeamProgPath = teamPath + '/programs/sequential/' + program.programUID + '/dateSet'


                            var seqInfo = programData.sequenceName === 'preDetermined'
                                ? [program.order.split('_')[0], program.order.split('_')[1]]
                                : [program.order, programData.sequenceName]

                            frontEndPayLoad.push({
                                program: program.programUID.split('_')[0],
                                deploymentDate: utsToDateString(timestamp),
                                deploymentUTS: timestamp,
                                programType: 'Sequential',
                                seqNameAndOrder: seqInfo[1] + ' : ' + seqInfo[0],
                                sequenceName: seqInfo[1],
                                order: program.order
                            })

                            // If the program already has been deployed to the team as a sequential program. Add to the array. 
                            if (progObj && progObj.sequential && progObj.sequential[program.programUID]) {
                                let deployArray = [...progObj.sequential[program.programUID].dateSet]

                                deployArray.push({
                                    order:
                                        programData.sequenceName === 'preDetermined' ?
                                            program.order
                                            :
                                            program.order
                                            + '_' + programData.sequenceName
                                            + '_' + teamName
                                            + '_' + this.props.firebase.auth.currentUser.uid
                                            + '_' + timestamp,
                                    date: timestamp
                                })

                                payLoad[seqTeamProgPath] = deployArray
                            } else {
                                // If neither of those exists create an array to inser. 

                                payLoad[seqTeamProgPath] = [{
                                    order:
                                        programData.sequenceName === 'preDetermined' ?
                                            program.order
                                            :
                                            program.order
                                            + '_' + programData.sequenceName
                                            + '_' + teamName
                                            + '_' + this.props.firebase.auth.currentUser.uid
                                            + '_' + timestamp,
                                    date: timestamp
                                }]
                            }
                        })
                    }


                    athleteData.forEach(athlete => {
                        if (programData.unlimited) {
                            programData.unlimited.forEach(program => {

                                var insertionProgramObject = this.state.currentProgramsData[program.programUID]
                                insertionProgramObject.currentDayInProgram = 1
                                insertionProgramObject.deploymentDate = timestamp

                                // Database path to insert into the athletes pending programs.
                                payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.programUID] = insertionProgramObject
                                // Database path to keep track of what programs have been shared with which athlete and when.
                                if (athlete.sharedPrograms) {
                                    if (Object.keys(athlete.sharedPrograms).includes(program.programUID)) {
                                        var timestampArr = [...athlete.sharedPrograms[program.programUID]]
                                        timestampArr.push(timestamp)

                                        payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = timestampArr
                                    } else {
                                        payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = [timestamp]
                                    }
                                } else {
                                    payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = [timestamp]
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
                                        + '_' + teamName
                                        + '_' + this.props.firebase.auth.currentUser.uid
                                        + '_' + timestamp
                                insertionProgramObject.deploymentDate = timestamp

                                payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.programUID] = insertionProgramObject


                                if (athlete.sharedPrograms) {
                                    if (Object.keys(athlete.sharedPrograms).includes(program.programUID)) {
                                        var timestampArr = [...athlete.sharedPrograms[program.programUID]]
                                        timestampArr.push(timestamp)

                                        payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = timestampArr
                                    } else {
                                        payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = [timestamp]
                                    }
                                } else {
                                    payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = [timestamp]
                                }
                            })
                        }
                    })

                    frontEndPayLoad.sort((a, b) => {
                        return cmp(
                            [-cmp(a.deploymentUTS, b.deploymentUTS), cmp(a.sequenceName, b.sequenceName), cmp(a.order, b.order),],
                            [-cmp(b.deploymentUTS, a.deploymentUTS), cmp(b.sequenceName, a.sequenceName), cmp(b.order, a.order)]
                        )
                    })


                    this.props.firebase.createTeamUpstream(payLoad)
                    this.setState(prevState => ({
                        ...prevState,
                        pageBodyContentLoading: false,
                        currTeam: {
                            ...prevState.currTeam,
                            view: this.state.currTeam.pageHistory.back(),
                            currTeamProgramData: {
                                ...prevState.currTeam.currTeamProgramData,
                                data: frontEndPayLoad
                            }
                        }
                    }))
                }
            })
        })

    }

    countAthletesOnTeam = (team, currentAthletes) => {
        var count = 0
        if (currentAthletes !== undefined) {
            Object.values(currentAthletes).forEach(athlete => {
                if (athlete.teams) {
                    var teamNames = Object.keys(athlete.teams)
                    if (teamNames.includes(team)) {
                        if (athlete.teams[team].activeMember) {
                            count++
                        }
                    }
                }
            })
        }

        return count
    }

    handleManageTeamClick = (team) => {
        this.setState({
            pageBodyContentLoading: true,
            currTeam: {
                team: team
            }
        }, () => {
            this.props.firebase.getUserData(
                this.props.firebase.auth.currentUser.uid
            )
                .once('value', userData => {
                    const userObject = userData.val();

                    this.props.firebase.anatomy().once('value', async snapshot => {
                        const anatomyObject = snapshot.val();

                        var currTeamMemberData = this.initCurrTeamMemberData(team, userObject.currentAthletes)

                        this.setState({
                            pageBodyContentLoading: false,
                            currTeam: {
                                team: team,
                                description: userObject.teams[team].description,
                                view: 'home',
                                pageHistory: new PageHistory(),
                                showViewProgramErrorModal: false,
                                viewProgramErrorType: undefined,
                                currTeamProgramData: this.initCurrTeamProgramData(userObject.teams[team].programs),
                                currTeamMemberData: currTeamMemberData,
                                nonCurrTeamMemberData: this.initNonCurrTeamMembersData(this.state.athleteTableData, currTeamMemberData),
                                viewTeamFunctions: {},
                                loadingData: this.initTeamLoadingData(currTeamMemberData, anatomyObject),
                                rawAnatomyData: anatomyObject

                            }
                        })
                    });
                })

        })
    }

    initTeamLoadingData = (currTeamMemberData, anatomyObject) => {

        var payLoad = {
            columns:
                [
                    {
                        Header: 'Username',
                        accessor: 'username'
                    },
                    {
                        Header: 'Email',
                        accessor: 'email'
                    },
                    {
                        accessor: 'buttons'
                    }

                ],
            data: []
        }

        currTeamMemberData.data.forEach(athlete => {
            this.props.firebase.getUserData(athlete.athleteUID).once('value', userData => {

                const athleteData = userData.val();

                var loadingData = this.processAthleteLoadingData(athleteData.currentPrograms)
            })
        })

    }

    processAthleteLoadingData = (currentPrograms) => {
        console.log(currentPrograms)
    }

    initNonCurrTeamMembersData = (allAthleteData, currTeamMemberData) => {

        var payLoad = {
            columns: [...allAthleteData.columns],
            data: []
        }

        var teamMembers = []
        currTeamMemberData.data.forEach(athlete => {
            teamMembers.push(athlete.athleteUID)
        })

        allAthleteData.data.forEach(athlete => {
            if (!teamMembers.includes(athlete.uid)) {
                payLoad.data.push(athlete)
            }
        })

        return payLoad

    }

    initCurrTeamMemberData = (team, currentAthletes) => {
        var payLoad = {
            columns: [
                {
                    Header: 'Username',
                    accessor: 'username'
                },
                {
                    Header: 'Email',
                    accessor: 'email'
                },
                {
                    Header: 'Joining Date',
                    accessor: 'joinDate'
                },
                {
                    accessor: 'buttons'
                }
            ],
            data: []
        }
        if (currentAthletes) {



            Object.keys(currentAthletes).forEach(athleteUID => {
                var athlete = currentAthletes[athleteUID]
                if (athlete.teams) {
                    var teamNames = Object.keys(athlete.teams)

                    if (teamNames.includes(team) && athlete.teams[team].activeMember) {
                        payLoad.data.push({
                            username: athlete.username,
                            email: athlete.email,
                            athleteUID: athleteUID,
                            joinDate: utsToDateString(parseInt(athlete.joinDate)),
                            joinDateUTS: parseInt(athlete.joinDate),
                            buttons:
                                <Button
                                    className='lightRedButton-inverted'
                                    onClick={() => { this.handleRemoveAthleteFromTeam(team, athleteUID) }}
                                >
                                    Remove From Team
                                </Button>
                        })
                    }
                }
            })

            return payLoad
        }

        return payLoad

    }

    handleRemoveAthleteFromTeam = (teamName, athleteUID) => {

        var payLoad = {}
        var coachPath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/${athleteUID}/teams/${teamName}/`
        var timestamp = new Date().getTime().toString()
        payLoad[coachPath + 'activeMember'] = false
        payLoad[coachPath + 'leavingDate'] = timestamp

        let currTeamData = [...this.state.currTeam.currTeamMemberData.data]

        var filteredData = currTeamData.filter(athlete => {
            return (
                athlete.athleteUID !== athleteUID
            )
        })

        this.props.firebase.updateDatabaseFromRootPath(payLoad)
        this.setState(prevState => ({
            ...prevState,
            currTeam: {
                ...prevState.currTeam,
                currTeamMemberData: {
                    ...prevState.currTeam.currTeamMemberData,
                    data: filteredData
                }
            }
        }))
    }

    initCurrTeamProgramData = (programsObject) => {

        var payLoad = {
            data: [],
            columns: [
                {
                    Header: 'Program Name',
                    accessor: 'program'
                },
                {
                    Header: 'Deployment Date',
                    accessor: 'deploymentDate'
                },
                {
                    Header: 'Program Type',
                    accessor: 'programType'
                },
                {
                    Header: 'Sequence Name : Order',
                    accessor: 'seqNameAndOrder'
                }
            ]
        }

        if (programsObject) {
            if (programsObject.unlimited) {
                Object.keys(programsObject.unlimited).forEach(prog => {
                    programsObject.unlimited[prog].dateSet.forEach(date => {
                        payLoad.data.push({
                            program: prog.split('_')[0],
                            deploymentDate: utsToDateString(parseInt(date)),
                            deploymentUTS: parseInt(date),
                            programType: 'Unlimited',
                            seqNameAndOrder: '',
                            order: 0,
                            sequenceName: 'none'
                        })
                    })
                })
            }
            if (programsObject.sequential) {
                Object.keys(programsObject.sequential).forEach(prog => {
                    programsObject.sequential[prog].dateSet.forEach(dateObj => {
                        var seqInfo = dateObj.order.split('_')
                        payLoad.data.push({
                            program: prog.split('_')[0],
                            deploymentDate: utsToDateString(parseInt(dateObj.date)),
                            deploymentUTS: parseInt(dateObj.date),
                            programType: 'Sequential',
                            seqNameAndOrder: `${seqInfo[1]} : ${seqInfo[0]}`,
                            order: parseInt(seqInfo[0]),
                            sequenceName: seqInfo[1]
                        })
                    })
                })
            }
        }
        // Order by the following.
        // - date desc
        // - order asc
        // - sequence name desc
        payLoad.data.sort((a, b) => {
            return cmp(
                [-cmp(a.deploymentUTS, b.deploymentUTS), cmp(a.sequenceName, b.sequenceName), cmp(a.order, b.order),],
                [-cmp(b.deploymentUTS, a.deploymentUTS), cmp(b.sequenceName, a.sequenceName), cmp(b.order, a.order)]
            )
        })

        return payLoad
    }

    handleTeamSelection = (teamTableData) => {
        this.setState({
            selectedTeamsTable: teamTableData
        })
    }

    handleCreateTeam = (teamName, teamDescription, athleteData, programData) => {

        var payLoad = {}
        var programsObject = {}
        var timestamp = new Date().getTime()

        var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`
        var teamPath = `/users/${this.props.firebase.auth.currentUser.uid}/teams/${teamName}`


        if (programData.unlimited) {
            programsObject.unlimited = {}
            programData.unlimited.forEach(program => {
                programsObject.unlimited[program.programUID] = {
                    dateSet: [timestamp]
                }
            })
        }

        if (programData.sequential) {
            programsObject.sequential = {}
            programData.sequential.forEach(program => {
                programsObject.sequential[program.programUID] = {
                    dateSet: [{
                        order:
                            programData.sequenceName === 'preDetermined' ?
                                program.order
                                :
                                program.order
                                + '_' + programData.sequenceName
                                + '_' + teamName
                                + '_' + this.props.firebase.auth.currentUser.uid
                                + '_' + timestamp,
                        date: timestamp
                    }]
                }
            })
        }

        athleteData.forEach(athlete => {
            payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/joiningDate'] = timestamp
            payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/activeMember'] = true


            if (programData.unlimited) {
                programData.unlimited.forEach(program => {

                    var insertionProgramObject = this.state.currentProgramsData[program.programUID]
                    insertionProgramObject.currentDayInProgram = 1
                    insertionProgramObject.deploymentDate = timestamp

                    // Database path to insert into the athletes pending programs.
                    payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.programUID] = insertionProgramObject
                    // Database path to keep track of what programs have been shared with which athlete and when.
                    payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = [timestamp]
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
                            + '_' + teamName
                            + '_' + this.props.firebase.auth.currentUser.uid
                            + '_' + timestamp
                    insertionProgramObject.deploymentDate = timestamp

                    payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.programUID] = insertionProgramObject

                    payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.programUID] = [timestamp]
                })
            }
        })

        payLoad[teamPath + '/description'] = teamDescription
        payLoad[teamPath + '/programs'] = programsObject

        // console.log(payLoad)
        this.props.firebase.createTeamUpstream(payLoad)
    }


    render() {
        const {
            loading,
            athleteTableData,
            programTableData,
            teamsTableData,
            programGroupTableData,
            currTeamListArray,
            pageBodyContentLoading,
            currTeam
        } = this.state

        console.log(currTeam)
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingNonTeamHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    <div id='mainHeaderText'>
                        Your Teams
                    </div>
                    <div id='createTeamBtnContainer'>
                        <CreateTeamModal
                            currTeamListArray={currTeamListArray}
                            athleteTableData={athleteTableData}
                            programTableData={programTableData}
                            programGroupTableData={programGroupTableData}
                            handleFormSubmit={this.handleCreateTeam}
                        />
                    </div>
                </div>
                {
                    teamsTableData &&
                    <div className='pageContainerLevel1'>
                        <BasicTablePagination
                            columns={this.initTeamsTableColumns()}
                            data={teamsTableData}
                            rowSelectChangeHandler={this.handleTeamSelection}
                        />
                    </div>

                }
            </NonLandingPageWrapper>

        let nonLoadingCurrTeamHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    {
                        currTeam &&
                        <>
                            <div className='pageMainHeader'>
                                {(currTeam.team)}
                            </div>

                            {
                                currTeam.view === 'manageTeamPrograms' &&
                                <div className='rowContainer centred-info sml-margin-top'>
                                    <Button
                                        className='lightPurpleButton'
                                        onClick={() => { this.handleManageCurrTeamViewChange('programDeploymentToTeam') }}
                                    >
                                        Assign New Program
                                </Button>
                                </div>
                            }
                            {
                                currTeam.view === 'manageTeamMembers' &&
                                <div className='rowContainer centred-info sml-margin-top'>
                                    <Button
                                        className='lightPurpleButton'
                                        onClick={() => { this.handleManageCurrTeamViewChange('assignNewTeamMembers') }}
                                    >
                                        Add New Members
                                </Button>
                                </div>
                            }
                        </>

                    }
                </div>
                {
                    currTeam &&
                    <div className='rowContainer clickableDiv'>
                        <Button
                            content='Back'
                            className='backButton-inverted'
                            circular
                            icon='arrow left'
                            onClick={() => { this.handleBackClick(currTeam.view) }}
                        />
                    </div>
                }
                {
                    currTeam && currTeam.view === 'home' &&
                    <ManageCurrTeamHome
                        clickHandler={this.handleManageCurrTeamViewChange}
                    />
                }
                {
                    currTeam && currTeam.view === 'manageTeamLoads' &&
                    <div>
                        manage team loads
                    </div>
                }
                {
                    currTeam && currTeam.view === 'manageTeamPrograms' &&
                    < div className='pageContainerLevel1'>
                        <InputLabel
                            text='Program History'
                            custID='programHistHeader'
                        />
                        {
                            currTeam.currTeamProgramData &&
                            <BasicTablePagination
                                data={currTeam.currTeamProgramData.data}
                                columns={currTeam.currTeamProgramData.columns}
                            />
                        }
                    </div>
                }
                {
                    currTeam && currTeam.view === 'programDeploymentToTeam' &&
                    <div className='centred-info'>
                        <div className='pageContainerLevel1 half-width'>
                            <ProgramDeployment
                                initProgTabData={programTableData}
                                submitHandler={this.handleDeployTeamProgram}
                                initProgGroupTabData={programGroupTableData}
                            />
                        </div>
                    </div>
                }
                {
                    currTeam && currTeam.view === 'manageTeamMembers' &&
                    < div className='pageContainerLevel1'>
                        <InputLabel
                            text='Current Members'
                            custID='programHistHeader'
                        />
                        {
                            currTeam.currTeamMemberData.data.length > 0 &&
                            <BasicTablePagination
                                data={currTeam.currTeamMemberData.data}
                                columns={currTeam.currTeamMemberData.columns}
                            />
                        }
                        {
                            currTeam.currTeamMemberData.data.length === 0 &&
                            <div className='paragraphDiv centred-info lightPurpleText'>
                                There are no current athletes in {currTeam.team}
                            </div>
                        }
                    </div>
                }
                {
                    currTeam && currTeam.view === 'assignNewTeamMembers' &&
                    < div className='pageContainerLevel1'>
                        <InputLabel
                            text='Select Athletes'
                            custID='programHistHeader'
                        />
                        {
                            currTeam.nonCurrTeamMemberData.data.length > 0 &&
                            <SelectAthletesTable
                                data={currTeam.nonCurrTeamMemberData.data}
                                columns={currTeam.nonCurrTeamMemberData.columns}
                                submitHandler={this.handleAssignNewTeamMembers}
                                buttonText={'Add Athletes'}
                            />
                        }
                        {
                            currTeam.nonCurrTeamMemberData.data.length === 0 &&
                            <div className='paragraphDiv centred-info lightPurpleText'>
                                All your athletes are already assigned to this team.
                            </div>
                        }
                    </div>
                }
            </NonLandingPageWrapper>

        let pageBodyContentLoadingHTML =
            <NonLandingPageWrapper>
                <div className='vert-aligned'>
                    <Loader active inline='centered' content='Preparing Team Data...' />
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
                    && currTeam === undefined
                    && nonLoadingNonTeamHTML
                }
                {
                    !loading
                    && !pageBodyContentLoading
                    && currTeam
                    && nonLoadingCurrTeamHTML
                }
                {
                    !loading
                    && pageBodyContentLoading
                    && currTeam
                    && pageBodyContentLoadingHTML
                }
            </div>
        )
    }
}

const condition = role => role === 'coach';
export default withCoachAuthorisation(condition)(ManageTeamsPage);