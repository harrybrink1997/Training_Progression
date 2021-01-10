import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader } from 'semantic-ui-react'
import CreateTeamModal from './createTeamModal'

import RowSelectTable from '../CustomComponents/rowSelectTable'

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


    updateObjectState = (userObject) => {

        this.setState({
            loading: false,
            athleteTableData: this.initAthleteTableData(userObject),
            programTableData: this.initProgramTableData(userObject),
            teamsTableData: this.initTeamsTableData(userObject),
            selectedTeamsTable: undefined
        })

    }

    initAthleteTableData = (userObject) => {

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
            return tableData
        } else {
            return undefined
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
                    Header: 'Assigned Programs',
                    accessor: 'programs',
                    filter: 'fuzzyText'
                },
            ]
        )
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
                    teamCount: this.countAthletesOnTeam(teamName, userObject.currentAthletes)
                })
            })
            return tableData
        } else {
            return undefined
        }


    }

    teamNameExists = (teamName) => {

    }

    countAthletesOnTeam = (team, currentAthletes) => {
        var count = 0
        if (currentAthletes !== undefined) {
            Object.values(currentAthletes).forEach(athlete => {
                if (athlete.team === team) {
                    count++
                }
            })
        }

        return count
    }

    initProgramTableData = (userObject) => {
        var tableData = []

        if (userObject.currentPrograms !== undefined) {
            Object.keys(userObject.currentPrograms).forEach(programName => {
                var program = userObject.currentPrograms[programName]

                tableData.push({
                    program: programName,
                    acutePeriod: program.acutePeriod,
                    chronicPeriod: program.chronicPeriod,
                    programLength: program.currentDayInProgram % 7
                })
            })
            return tableData
        } else {
            return undefined
        }


    }


    handleTeamSelection = (teamTableData) => {
        this.setState({
            selectedTeamsTable: teamTableData
        })
    }

    handleCreateTeam = (teamName, teamDescription, athleteData, programData) => {
        console.log(teamName)
        console.log(teamDescription)
        console.log(athleteData)
        console.log(programData)

        var payLoad = {}
        var programsObject = {}

        var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`
        var teamPath = `/users/${this.props.firebase.auth.currentUser.uid}/teams/${teamName}`

        athleteData.forEach(athlete => {
            payLoad[athletePath + athlete.uid + '/team'] = teamName
        })

        if (programData.unlimited) {
            programsObject.unlimited = {}
            programData.unlimited.forEach(program => {
                programsObject.unlimited[program.program] = {
                    dateSet: Math.floor(new Date().getTime())
                }
            })
        }

        if (programData.sequential) {
            programsObject.sequential = {}
            programData.sequential.forEach(program => {
                programsObject.sequential[program.program] = {
                    dateSet: Math.floor(new Date().getTime()),
                    order: program.order
                }
            })
        }

        console.log(programsObject)
        payLoad[teamPath + '/description'] = teamDescription
        payLoad[teamPath + '/programs'] = programsObject

        this.props.firebase.createTeamUpstream(payLoad)
    }


    render() {
        const {
            loading,
            athleteTableData,
            programTableData,
            teamsTableData
        } = this.state

        console.log(this.initTeamsTableColumns())
        console.log(teamsTableData)
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    <div id='mainHeaderText'>
                        Your Teams
                    </div>
                    <div id='createTeamBtnContainer'>
                        <CreateTeamModal
                            athleteTableData={athleteTableData}
                            programTableData={programTableData}
                            handleFormSubmit={this.handleCreateTeam}
                        />
                    </div>
                </div>

                <RowSelectTable
                    columns={this.initTeamsTableColumns()}
                    data={teamsTableData}
                    rowSelectChangeHanlder={this.handleTeamSelection}
                />
            </NonLandingPageWrapper>



        return (
            <div>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }
}

const condition = role => role === 'coach';
export default withCoachAuthorisation(condition)(ManageTeamsPage);