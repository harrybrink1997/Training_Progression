import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List, Button, Form, Input } from 'semantic-ui-react'
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
import { generateCurrDaySafeLoadData, generateACWRGraphData, generateSafeLoadGraphProps, generateHistoricalTableData } from '../../constants/viewProgramPagesFunctions'
import TeamMemberLoadLogModal from './teamMemberLoadLogModal';
import RedGreenUnderlinePagTable from '../CustomComponents/redGreenUnderlinePagTable';
import * as programIDFunctions from '../../constants/programIDManipulation'
import { capitaliseFirstLetter } from '../../constants/stringManipulation'
import TeamMemberProgLoadInfo from './teamMemberProgLoadInfo';
import TeamLoadingDataOverview from './teamLoadingDataOverview';
import * as ROUTES from '../../constants/routes'


class ManageCoachTeamsPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: true,
        }
    }

    CONSTANTS = {
        DAY_THRESHOLD: 5
    }

    componentDidMount() {
        this.setState({
            loading: true
        }, () => {
            this.props.firebase.getCoachTeamOverviewData(
                this.props.firebase.auth.currentUser.uid
            ).then(teamData => {
                console.log(teamData)
                this.setState({
                    loading: false,
                    manageTeamsTableData: this.initTeamsTableData(teamData)
                })
            })
        });

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
            // athleteTableData: this.initAthleteTableData(userObject),
            // programTableData: initProgDeployCoachProgramTableData(userObject),
            // programGroupTableData: initProgDeployCoachProgGroupTableData(userObject),
            currentProgramsData: userObject.currentPrograms,
            selectedTeamsTable: undefined,
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

    initTeamsTableData = (teamData) => {
        var payload = {
            columns: this.initTeamsTableColumns(),
            data: []
        }

        if (teamData.length > 0) {
            teamData.forEach(team => {

                payload.data.push({
                    team: team.teamName,
                    description: team.description,
                    buttons:
                        <ManageTeamButton
                            objectUID={team.teamName}
                            buttonHandler={this.handleManageTeamClick}
                        />
                })
            })
            return payload
        } else {
            return payload
        }


    }

    handleDeployTeamProgram = (programData) => {

        this.setState(prevState => ({
            ...prevState,
            pageBodyContentLoading: true
        }), () => {

            // this.props.firebase.getUserData(
            //     this.props.firebase.auth.currentUser.uid
            // ).once('value', userData => {
            //     const userObject = userData.val();
            //     const currAthObject = userObject.currentAthletes
            //     if (currAthObject) {
            //         const athleteData = []
            // Object.keys(currAthObject).forEach(athlete => {
            //     if (currAthObject[athlete].teams) {
            //         // If the program exists in the athletes teams list.
            //         if (Object.keys(currAthObject[athlete].teams).includes(this.state.currTeam.team)) {
            //             if (currAthObject[athlete].teams[this.state.currTeam.team].activeMember) {
            //                 athleteData.push({
            //                     uid: athlete,
            //                     sharedPrograms: currAthObject[athlete].teams[this.state.currTeam.team].sharedPrograms
            //                 })
            //             }
            //         }
            //     }
            // })
            this.props.firebase.getTeamProgramData(
                this.props.firebase.auth.currentUser.uid,
                this.state.currTeam.team
            ).then(progObj => {

                console.log(programData)

                var athleteList = this.state.currTeam.currTeamMemberData.data.map(athlete => {
                    return athlete.athleteUID
                })


                var progInfo = {}
                var frontEndPayLoad = [...this.state.currTeam.currTeamProgramData.data]
                var programsObject = {}
                var timestamp = new Date().getTime()
                var teamName = this.state.currTeam.team

                if (programData.unlimited) {
                    programsObject.unlimited = {}
                    programData.unlimited.forEach(program => {

                        frontEndPayLoad.push({
                            program: program.programUID.split("_")[0],
                            deploymentDate: utsToDateString(timestamp),
                            deploymentUTS: timestamp,
                            programType: 'Unlimited',
                            seqNameAndOrder: '',
                            sequenceName: 'none'
                        })

                        progInfo[program.programUID] = {
                            programUID: program.programUID,
                            isUnlimited: true,
                            deploymentDate: timestamp
                        }


                        // If the program already has been deployed to the team as an unlimited program. Add to the array. 
                        if (progObj.unlimited && progObj.unlimited[program.programUID]) {

                            progObj.unlimited[program.programUID].dateSet.push(timestamp)

                        } else {
                            // If neither of those exists create an array to inser.
                            if (progObj.unlimited) {
                                progObj.unlimited[program.programUID] = {
                                    dateSet: [timestamp]
                                }
                            } else {
                                progObj.unlimited = {
                                    [program.programUID]: {
                                        dateSet: [timestamp]
                                    }
                                }
                            }
                        }
                    })
                }

                if (programData.sequential) {
                    programsObject.sequential = {}
                    programData.sequential.forEach(program => {

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
                                    + '_' + teamName
                                    + '_' + this.props.firebase.auth.currentUser.uid
                                    + '_' + timestamp
                        }

                        // If the program already has been deployed to the team as a sequential program. Add to the array. 
                        if (progObj.sequential && progObj.sequential[program.programUID]) {

                            progObj.sequential[program.programUID].dateSet.push({
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

                        } else {
                            var orderPayload = [{
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

                            if (progObj.sequential) {
                                progObj.sequential[program.programUID] = {
                                    dateSet: orderPayload
                                }
                            } else {
                                progObj.sequential = {
                                    [program.programUID]: {
                                        dateSet: orderPayload
                                    }
                                }
                            }
                        }
                    })
                }

                // athleteData.forEach(athlete => {
                //     if (programData.unlimited) {
                //         programData.unlimited.forEach(program => {

                //             var insertionProgramObject = this.state.currentProgramsData[program.programUID]
                //             insertionProgramObject.currentDayInProgram = 1
                //             insertionProgramObject.deploymentDate = timestamp

                //             // Database path to insert into the athletes pending programs.
                //             payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.programUID] = insertionProgramObject
                //             // Database path to keep track of what programs have been shared with which athlete and when.
                //         })
                //     }

                //     if (programData.sequential) {
                //         programData.sequential.forEach(program => {

                //             var isActiveInSequence = false
                //             if (programData.sequenceName === 'preDetermined') {
                //                 if (parseInt(program.order.split('_')[0]) === 1) {
                //                     isActiveInSequence = true
                //                 }
                //             } else {
                //                 if (parseInt(program.order) === 1) {
                //                     isActiveInSequence = true
                //                 }
                //             }

                //             var insertionProgramObject = this.state.currentProgramsData[program.programUID]
                //             insertionProgramObject.currentDayInProgram = 1
                //             insertionProgramObject.isActiveInSequence = isActiveInSequence
                //             insertionProgramObject.order =
                //                 programData.sequenceName === 'preDetermined' ?
                //                     program.order
                //                     :
                //                     program.order
                //                     + '_' + programData.sequenceName
                //                     + '_' + teamName
                //                     + '_' + this.props.firebase.auth.currentUser.uid
                //                     + '_' + timestamp
                //             insertionProgramObject.deploymentDate = timestamp

                //             payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.programUID] = insertionProgramObject
                //         })
                //     }
                // })

                frontEndPayLoad.sort((a, b) => {
                    return cmp(
                        [-cmp(a.deploymentUTS, b.deploymentUTS), cmp(a.sequenceName, b.sequenceName), cmp(a.order, b.order),],
                        [-cmp(b.deploymentUTS, a.deploymentUTS), cmp(b.sequenceName, a.sequenceName), cmp(b.order, a.order)]
                    )
                })

                console.log(progObj)
                console.log(progInfo)
                console.log(athleteList)

                this.props.firebase.deployTeamPrograms(
                    this.props.firebase.auth.currentUser.uid,
                    athleteList,
                    progInfo,
                    progObj
                )
                // this.props.firebase.createTeamUpstream(payLoad)
                // this.setState(prevState => ({
                //     ...prevState,
                //     pageBodyContentLoading: false,
                //     currTeam: {
                //         ...prevState.currTeam,
                //         view: this.state.currTeam.pageHistory.back(),
                //         currTeamProgramData: {
                //             ...prevState.currTeam.currTeamProgramData,
                //             data: frontEndPayLoad
                //         }
                //     }
                // }))
            })


            // }
        })
        // })

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
        }, async () => {

            this.props.firebase.getTeamData(this.props.firebase.auth.currentUser.uid, team).then(data => {
                // this.initTeamLoadingData(data.athleteData)
                var currTeamMemberData = this.initCurrTeamMemberData(team, data.athleteData)

                this.setState({
                    pageBodyContentLoading: false,
                    currTeam: {
                        team: team,
                        view: 'home',
                        pageHistory: new PageHistory(),
                        showViewProgramErrorModal: false,
                        viewProgramErrorType: undefined,
                        currTeamProgramData: this.initCurrTeamProgramData(data.programData),
                        currTeamMemberData: currTeamMemberData,
                        programGroupData: initProgDeployCoachProgGroupTableData(data.deployProgramGroupData),
                        programData: initProgDeployCoachProgramTableData(data.deployProgramData)
                        // nonCurrTeamMemberData: this.initNonCurrTeamMembersData(this.state.athleteTableData, currTeamMemberData),
                        // viewTeamFunctions: {},
                        // loadingData: teamLoadingData,
                        // rawAnatomyData: anatomyObject,
                        // memberProgramLoadingInfo: undefined,
                        // daysSinceOverloadThreshold: 5,
                        // overviewTableVisible: true,
                        // teamLoadOverviewData: this.initOverviewData(teamLoadingData, 5),
                    }
                })

            })

            return
            this.props.firebase.getUserData(
                this.props.firebase.auth.currentUser.uid
            )
                .once('value', async userData => {
                    const userObject = userData.val();

                    this.props.firebase.anatomy().once('value', async snapshot => {
                        const anatomyObject = snapshot.val();

                        var currTeamMemberData = this.initCurrTeamMemberData(team, userObject.currentAthletes)

                        this.initTeamLoadingData(currTeamMemberData).then(promises => {
                            Promise.all(promises).then(athleteResponses => {

                                var teamLoadingData = this.formatAthleteLoadData(athleteResponses)

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
                                        loadingData: teamLoadingData,
                                        rawAnatomyData: anatomyObject,
                                        memberProgramLoadingInfo: undefined,
                                        daysSinceOverloadThreshold: 5,
                                        overviewTableVisible: true,
                                        teamLoadOverviewData: this.initOverviewData(teamLoadingData, 5),
                                    }
                                })
                            })
                        })
                    })
                })
        })
    }

    initOverviewData = (teamData, threshold) => {
        var aboveCount = 0
        var belowCount = 0

        for (var index in teamData.data) {
            var athlete = teamData.data[index]
            if (athlete.lastDayOverloaded === "") {
                aboveCount++
            } else if (athlete.lastDayOverloaded <= threshold) {
                belowCount++
            } else {
                aboveCount++
            }
        }

        return [
            {
                field: 'Green Zone Athletes',
                value: aboveCount
            },
            {
                field: 'Red Zone Athletes',
                value: belowCount
            },
        ]
    }


    formatAthleteLoadData = (data) => {

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
                        Header: 'Days Since Overloading',
                        accessor: 'lastDayOverloaded'
                    },
                    {
                        accessor: 'modal'
                    }

                ],

        }

        var athleteData = [...data]

        athleteData.sort((a, b) => {
            if (!a.warningValue && a.warningValue) {
                return 1
            } else if (a.warningValue && !b.warningValue) {
                return -1
            } else if (!a.warningValue && !b.warningValue) {
                return 0
            } else {
                return cmp(a.warningValue, b.warningValue)
            }
        })

        payLoad.data = athleteData

        return payLoad
    }

    initTeamLoadingData = (currTeamMemberData) => {

        const dbPromises = []
        currTeamMemberData.forEach(athlete => {

            dbPromises.push(this.prepareAthleteLoadData(athlete))
        })

        return dbPromises

    }

    handleCreateTeamRedirect = () => {
        this.props.history.push(ROUTES.CREATE_COACH_TEAM)
    }

    prepareAthleteLoadData = (athlete) => {
        console.log(athlete)
        return new Promise(resolve => {
            this.props.firebase.getAthleteTeamPrograms(
                this.props.firebase.auth.currentUser.uid,
                athlete.athleteUID,
                this.state.currTeam.team
            )
                .then(programData => {
                    console.log(programData)

                    // if (athleteData.currentPrograms) {
                    //     var loadingData = this.processAthleteLoadingData(athleteData.currentPrograms, { uid: athlete.athleteUID, username: athlete.username })

                    //     resolve({
                    //         username: athleteData.username,
                    //         email: athleteData.email,
                    //         lastDayOverloaded: loadingData.lastDayOverloaded,
                    //         warningValue: loadingData.lastDayOverloaded,
                    //         modal:
                    //             <TeamMemberLoadLogModal
                    //                 logsData={loadingData.programData}
                    //                 warningThreshold={5}
                    //                 warnBelowThreshold={true}
                    //             />
                    //     })
                    // } else {
                    //     resolve({
                    //         username: athleteData.username,
                    //         email: athleteData.email,
                    //         lastDayOverloaded: '',
                    //         warningValue: undefined,
                    //         modal: 'No Loading Data'
                    //     })
                    // }
                })
        })
    }

    validProgramForLoadCheck = (programName, programData) => {
        return (
            programIDFunctions.getCreator(programName) === this.props.firebase.auth.currentUser.uid
            && programData.currentDayInProgram > 1
            && programData.isActiveInSequence !== false
        )
    }

    determineDaysSinceLastOverload = (programData) => {

        for (var day = programData.currentDayInProgram - 1; day >= 1; day--) {

            var loadingData = programData[day].loadingData

            for (var muscleGroup in loadingData) {
                if (muscleGroup !== 'Total') {
                    for (var muscle in loadingData[muscleGroup]) {
                        if ((loadingData[muscleGroup][muscle].ACWR > 1.2 || loadingData[muscleGroup][muscle].ACWR < 0.8) && loadingData[muscleGroup][muscle].ACWR !== 0) {

                            return programData.currentDayInProgram - day
                        }

                    }
                } else {
                    if ((loadingData[muscleGroup].ACWR > 1.2 || loadingData[muscleGroup].ACWR < 0.8) && loadingData[muscleGroup].ACWR !== 0) {

                        return programData.currentDayInProgram - day
                    }
                }
            }
        }
        return -1
    }

    processAthleteLoadingData = (currentPrograms, athlete) => {
        console.log(currentPrograms)
        var payLoad = {
            lastDayOverloaded: undefined,
            programData: {
                columns: [
                    {
                        Header: 'Program',
                        accessor: 'program'
                    },
                    {
                        Header: 'Days Since Overloading',
                        accessor: 'lastDayOverloaded'
                    },
                    {
                        accessor: 'buttons'
                    }
                ],
                data: []
            },
        }
        var mostRecentDay = -1
        Object.keys(currentPrograms).forEach(program => {
            console.log(program)

            if (this.validProgramForLoadCheck(program, currentPrograms[program])) {

                var lastOverload = this.determineDaysSinceLastOverload(currentPrograms[program])

                if (lastOverload !== -1) {
                    if (mostRecentDay === -1) {
                        mostRecentDay = lastOverload
                    } else {
                        if (lastOverload < mostRecentDay && lastOverload !== -1) {
                            mostRecentDay = lastOverload
                        }
                    }
                }

                payLoad.programData.data.push({
                    program: program.split('_')[0],
                    lastDayOverloaded: lastOverload === -1 ? '-' : lastOverload,
                    warningValue: lastOverload === -1 ? false : lastOverload,
                    buttons:
                        <Button
                            className='lightPurpleButton'
                            onClick={() => { this.handleViewProgramLoadingLogs(program, athlete) }}
                        >
                            View Program Logs
                        </Button>
                })
            }
        })

        payLoad.lastDayOverloaded = mostRecentDay

        return payLoad

    }

    handleDayThresholdChange = (threshold) => {

        let currTeamLoadTableData = { ...this.state.currTeam.loadingData }

        let newOverview = this.initOverviewData(currTeamLoadTableData, threshold)

        console.log(currTeamLoadTableData)

        var newLoadData = {
            columns: currTeamLoadTableData.columns,
            data: []
        }

        currTeamLoadTableData.data.forEach(athlete => {
            if (athlete.modal.props) {
                let currLogsData = { ...athlete.modal.props.logsData }

                athlete.modal =
                    <TeamMemberLoadLogModal
                        logsData={currLogsData}
                        warningThreshold={parseInt(threshold)}
                        warnBelowThreshold={true}
                    />
            }

            newLoadData.data.push(athlete)
        })

        this.setState(prevState => ({
            ...prevState,
            currTeam: {
                ...prevState.currTeam,
                teamLoadOverviewData: newOverview,
                daysSinceOverloadThreshold: threshold,
                loadingData: newLoadData
            }
        }))
    }

    handleViewProgramLoadingLogs = (program, athlete) => {

        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.props.firebase.getProgramData(
                athlete.uid,
                program
            ).once('value', userData => {

                const programData = userData.val();


                var rawAnatomyData = this.state.currTeam.rawAnatomyData
                console.log(programData)
                var loadingInfo = {
                    athleteUID: athlete.uid,
                    username: athlete.username,
                    programName: program,
                    specificDayLoadingInfo: undefined,
                    ACWRGraphProps: generateACWRGraphData(programData, rawAnatomyData),
                    rollingAverageGraphProps: generateSafeLoadGraphProps(programData, rawAnatomyData),
                    currentBodyPart: 'Overall_Total',
                    currMuscleGroupOpen: 'Arms',
                    loadingScheme: programData.loading_scheme
                }

                this.state.currTeam.pageHistory.next(this.state.currTeam.view)

                this.setState(prevState => ({
                    ...prevState,
                    currTeam: {
                        ...prevState.currTeam,
                        memberProgramLoadingInfo: loadingInfo,
                        view: 'teamMemberProgramLoadingInfo'
                    }
                }), () => {
                    this.setState(prevState => ({
                        ...prevState,
                        pageBodyContentLoading: false,
                    }))
                })

            })
        })


    }

    handleGetSpecificDayProgramData = (day) => {
        this.props.firebase.getProgramData(
            this.state.currTeam.memberProgramLoadingInfo.athleteUID,
            this.state.currTeam.memberProgramLoadingInfo.programName
        ).once('value', userData => {
            const programData = userData.val();

            this.setState(prevState => ({
                currTeam: {
                    ...prevState.currTeam,
                    memberProgramLoadingInfo: {
                        ...prevState.currTeam.memberProgramLoadingInfo,
                        specificDayLoadingInfo: generateHistoricalTableData(programData[day], this.state.currTeam.memberProgramLoadingInfo.loadingScheme)
                    }
                }
            }))

        })
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
                    accessor: 'joiningDate'
                },
                {
                    accessor: 'buttons'
                }
            ],
            data: []
        }
        if (currentAthletes) {
            currentAthletes.forEach(athlete => {
                payLoad.data.push({
                    username: athlete.username,
                    email: athlete.email,
                    athleteUID: athlete.athleteUID,
                    joiningDate: utsToDateString(parseInt(athlete.joiningDate)),
                    joiningDateUTS: parseInt(athlete.joiningDate),
                    buttons:
                        <Button
                            className='lightRedButton-inverted'
                            onClick={() => { this.handleRemoveAthleteFromTeam(team, athlete.athleteUID) }}
                        >
                            Remove From Team
                        </Button>
                })
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

    render() {
        const {
            loading,
            programTableData,
            teamsTableData,
            programGroupTableData,
            pageBodyContentLoading,
            currTeam,
            manageTeamsTableData
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
                        <Button
                            onClick={() => { this.handleCreateTeamRedirect() }}
                            className="lightPurpleButton"
                        >
                            Create Team
                        </Button>
                    </div>
                </div>
                {
                    manageTeamsTableData &&
                    <div className='pageContainerLevel1'>
                        <BasicTablePagination
                            columns={manageTeamsTableData.columns}
                            data={manageTeamsTableData.data}
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
                            {
                                currTeam.view === 'teamMemberProgramLoadingInfo' &&
                                <div className='columnContainer'>
                                    <div className='pageSubHeader1'>
                                        {capitaliseFirstLetter(currTeam.memberProgramLoadingInfo.username)}
                                    </div>
                                    <div className='pageSubHeader2'>
                                        {capitaliseFirstLetter(programIDFunctions.getName(currTeam.memberProgramLoadingInfo.programName))}
                                    </div>
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
                    <div className='columnContainer'>
                        <div className='pageContainerLevel1'>
                            <TeamLoadingDataOverview
                                dayThreshold={currTeam.daysSinceOverloadThreshold}
                                data={currTeam.teamLoadOverviewData}
                                submitHandler={this.handleDayThresholdChange}
                            />
                        </div>
                        < div className='pageContainerLevel1'>
                            <div className='tableHeader'>
                                Loading Data
                            </div>
                            {
                                currTeam.loadingData &&
                                <RedGreenUnderlinePagTable
                                    data={currTeam.loadingData.data}
                                    columns={currTeam.loadingData.columns}
                                    warnBelowThreshold={true}
                                    warningThreshold={currTeam.daysSinceOverloadThreshold}
                                />
                            }
                        </div>
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
                                initProgTabData={currTeam.programData}
                                submitHandler={this.handleDeployTeamProgram}
                                initProgGroupTabData={currTeam.programGroupData}
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
                {
                    currTeam && currTeam.view === 'teamMemberProgramLoadingInfo' &&
                    <div>
                        <TeamMemberProgLoadInfo
                            loadingInfo={currTeam.memberProgramLoadingInfo}
                            anatomyData={this.state.currTeam.rawAnatomyData}
                            clickDayHandler={this.handleGetSpecificDayProgramData}
                            specificDayExData={currTeam.memberProgramLoadingInfo.specificDayLoadingInfo}
                        />
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

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageCoachTeamsPage)