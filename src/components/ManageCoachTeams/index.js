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
    }

    homePageRedirect = () => {
        this.props.history.push(ROUTES.HOME)

    }

    initAthleteTableData = (userObject) => {

        var payload = {
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

            payload.data = tableData

            return payload
        } else {
            return payload
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

                var frontEndPayLoad = {
                    currTeamMembers: [...this.state.currTeam.currTeamMemberData.data],
                    nonCurrTeamMembers: [...this.state.currTeam.nonCurrTeamMemberData.data]
                }

                let athleteUIDArray = []
                let timestamp = new Date().getTime()
                let teamName = this.state.currTeam.team

                athletes.forEach(athlete => {
                    var athData = athlete.original
                    console.log(athData)
                    athleteUIDArray.push(athData.athleteUID)

                    frontEndPayLoad.currTeamMembers.push({
                        athleteUID: athData.athleteUID,
                        username: athData.username,
                        email: athData.email,
                        joiningDateUTS: timestamp,
                        joiningDate: utsToDateString(parseInt(timestamp)),
                        buttons:
                            <Button
                                className='lightRedButton-inverted'
                                onClick={() => { this.handleRemoveAthleteFromTeam(this.state.currTeam.team, athData.athleteUID) }}
                            >
                                Remove From Team
                                </Button>
                    })

                    for (let ath in frontEndPayLoad.nonCurrTeamMembers) {
                        if (frontEndPayLoad.nonCurrTeamMembers[ath].athleteUID === athData.athleteUID) {
                            frontEndPayLoad.nonCurrTeamMembers.splice(ath, 1)
                        }
                    }

                })
                this.props.firebase.assignNewAthletesToTeam(
                    athleteUIDArray,
                    this.props.firebase.auth.currentUser.uid,
                    teamName,
                    timestamp
                ).then(() => {
                    this.setState(prevState => ({
                        ...prevState,
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

                frontEndPayLoad.sort((a, b) => {
                    return cmp(
                        [-cmp(a.deploymentUTS, b.deploymentUTS), cmp(a.sequenceName, b.sequenceName), cmp(a.order, b.order),],
                        [-cmp(b.deploymentUTS, a.deploymentUTS), cmp(b.sequenceName, a.sequenceName), cmp(b.order, a.order)]
                    )
                })

                this.props.firebase.deployTeamPrograms(
                    this.props.firebase.auth.currentUser.uid,
                    athleteList,
                    progInfo,
                    progObj,
                    this.state.currTeam.team
                ).then(res => {
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

                })
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
        }, async () => {

            this.props.firebase.getTeamData(this.props.firebase.auth.currentUser.uid, team).then(data => {
                var currTeamMemberData = this.initCurrTeamMemberData(team, data.athleteData)

                this.initTeamLoadingData(data.athleteData).then(athleteLoadingData => {

                    let teamLoadingData = this.formatAthleteLoadData(athleteLoadingData)
                    console.log(data)

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
                            programData: initProgDeployCoachProgramTableData(data.deployProgramData),
                            nonCurrTeamMemberData: this.initNonCurrTeamMembersData(data.allAthletes, currTeamMemberData),
                            viewTeamFunctions: {},
                            loadingData: teamLoadingData,
                            rawAnatomyData: data.anatomy,
                            memberProgramLoadingInfo: undefined,
                            daysSinceOverloadThreshold: 5,
                            overviewTableVisible: true,
                            teamLoadOverviewData: this.initOverviewData(teamLoadingData, 5)
                        }
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
        console.log(data)
        var payload = {
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

        payload.data = athleteData

        return payload
    }

    initTeamLoadingData = (currTeamMemberData) => {
        return new Promise((res, rej) => {

            console.log(currTeamMemberData)
            const dbPromises = []
            currTeamMemberData.forEach(athlete => {
                dbPromises.push(this.prepareAthleteLoadData(athlete))
            })
            Promise.all(dbPromises).then(data => {
                res(data)
            })
        })
    }

    prepareAthleteLoadData = (athlete) => {
        console.log(athlete)
        return new Promise((res, rej) => {
            this.props.firebase.getAthleteTeamPrograms(
                this.props.firebase.auth.currentUser.uid,
                athlete.athleteUID,
                this.state.currTeam.team
            )
                .then(programData => {
                    if (programData.length > 0) {

                        var loadingData = this.processAthleteLoadingData(programData, { uid: athlete.athleteUID, username: athlete.username })

                        if (loadingData.lastDayOverloaded !== -1) {
                            res({
                                username: athlete.username,
                                email: athlete.email,
                                lastDayOverloaded: loadingData.lastDayOverloaded,
                                warningValue: loadingData.lastDayOverloaded,
                                modal:
                                    <TeamMemberLoadLogModal
                                        logsData={loadingData.programData}
                                        warningThreshold={5}
                                        warnBelowThreshold={true}
                                    />
                            })
                        } else {
                            res({
                                username: athlete.username,
                                email: athlete.email,
                                lastDayOverloaded: '',
                                warningValue: undefined,
                                modal: 'No Loading Data'
                            })
                        }
                    } else {
                        res({
                            username: athlete.username,
                            email: athlete.email,
                            lastDayOverloaded: '',
                            warningValue: undefined,
                            modal: 'No Loading Data'
                        })
                    }
                })
        })
    }

    validProgramForLoadCheck = (programData) => {
        return (
            programData.owner === this.props.firebase.auth.currentUser.uid
            && programData.currentDay > 1
            && programData.isActiveInSequence !== false
        )
    }

    determineDaysSinceLastOverload = (programData) => {
        console.log(programData)
        for (var day = programData.currentDay - 1; day >= 1; day--) {

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

                        return programData.currentDay - day
                    }
                }
            }
        }
        return -1
    }

    processAthleteLoadingData = (currentPrograms, athlete) => {
        console.log(currentPrograms)
        console.log(Object.keys(currentPrograms[0]))

        var payload = {
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
        currentPrograms.forEach(program => {
            console.log('scannign through programs')
            console.log(Object.keys(program))

            if (this.validProgramForLoadCheck(program)) {
                console.log('isValid program')
                console.log(program)
                var lastOverload = this.determineDaysSinceLastOverload(program)

                if (lastOverload !== -1) {
                    if (mostRecentDay === -1) {
                        mostRecentDay = lastOverload
                    } else {
                        if (lastOverload < mostRecentDay && lastOverload !== -1) {
                            mostRecentDay = lastOverload
                        }
                    }
                }

                payload.programData.data.push({
                    program: program.name,
                    lastDayOverloaded: lastOverload === -1 ? '-' : lastOverload,
                    warningValue: lastOverload === -1 ? false : lastOverload,
                    buttons:
                        <Button
                            className='lightPurpleButton'
                            onClick={() => { this.handleViewProgramLoadingLogs(program.programUID, athlete) }}
                        >
                            View Program Logs
                        </Button>
                })
            }
        })

        payload.lastDayOverloaded = mostRecentDay

        return payload

    }

    handleCreateTeamRedirect = () => {
        this.props.history.push(ROUTES.CREATE_COACH_TEAM)
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
        console.log(program)
        console.log(athlete)
        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.props.firebase.getAthleteTeamFullProgramData(
                athlete.uid,
                program,
                this.state.currTeam.team
            ).then(programData => {
                console.log(programData)
                var rawAnatomyData = this.state.currTeam.rawAnatomyData
                var loadingInfo = {
                    athleteUID: athlete.uid,
                    username: athlete.username,
                    programName: programData.name,
                    programUID: programData.programUID,
                    specificDayLoadingInfo: undefined,
                    ACWRGraphProps: generateACWRGraphData(programData, rawAnatomyData),
                    rollingAverageGraphProps: generateSafeLoadGraphProps(programData, rawAnatomyData),
                    currentBodyPart: 'Overall_Total',
                    currMuscleGroupOpen: 'Arms',
                    loadingScheme: programData.loadingScheme
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
        this.props.firebase.getAthleteTeamFullProgramData(
            this.state.currTeam.memberProgramLoadingInfo.athleteUID,
            this.state.currTeam.memberProgramLoadingInfo.programUID,
            this.state.currTeam.team
        ).then(programData => {

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

        let payload = {
            columns:
                [
                    {
                        Header: 'Athlete',
                        accessor: 'username',
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

        var teamMembers = []
        currTeamMemberData.data.forEach(athlete => {
            teamMembers.push(athlete.athleteUID)
        })
        allAthleteData.forEach(athlete => {
            if (!teamMembers.includes(athlete.athleteUID)) {
                delete athlete.permissions
                payload.data.push(athlete)
            }
        })

        return payload

    }

    initCurrTeamMemberData = (team, currentAthletes) => {
        var payload = {
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
                payload.data.push({
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

            return payload
        }

        return payload

    }

    handleRemoveAthleteFromTeam = (teamName, athleteUID) => {

        let currMembers = [...this.state.currTeam.currTeamMemberData.data]

        let nonCurrMembers = [...this.state.currTeam.nonCurrTeamMemberData.data]

        for (var athlete in currMembers) {
            if (currMembers[athlete].athleteUID === athleteUID) {
                nonCurrMembers.push(currMembers[athlete])

                currMembers.splice(athlete, 1)
            }
        }

        this.props.firebase.removeAthleteFromTeam(
            this.props.firebase.auth.currentUser.uid,
            athleteUID,
            teamName
        ).then(() => {
            this.setState(prevState => ({
                ...prevState,
                currTeam: {
                    ...prevState.currTeam,
                    currTeamMemberData: {
                        ...prevState.currTeam.currTeamMemberData,
                        data: currMembers
                    },
                    nonCurrTeamMemberData: {
                        ...prevState.currTeam.nonCurrTeamMemberData,
                        data: nonCurrMembers
                    }
                }
            }))
        })
    }

    initCurrTeamProgramData = (programsObject) => {

        var payload = {
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
                        payload.data.push({
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
                        payload.data.push({
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
        payload.data.sort((a, b) => {
            return cmp(
                [-cmp(a.deploymentUTS, b.deploymentUTS), cmp(a.sequenceName, b.sequenceName), cmp(a.order, b.order),],
                [-cmp(b.deploymentUTS, a.deploymentUTS), cmp(b.sequenceName, a.sequenceName), cmp(b.order, a.order)]
            )
        })

        return payload
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
                <div className='rowContainer clickableDiv'>
                    <Button
                        content='Back'
                        className='backButton-inverted'
                        circular
                        icon='arrow left'
                        onClick={() => {
                            this.homePageRedirect()
                        }}
                    />
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
                            onClick={() => {
                                this.handleBackClick(currTeam.view)
                            }}
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
            </div >
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageCoachTeamsPage)