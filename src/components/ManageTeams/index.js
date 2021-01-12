import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List } from 'semantic-ui-react'
import CreateTeamModal from './createTeamModal'

import RowSelectTable from '../CustomComponents/rowSelectTable'
import loadingSchemeString from '../../constants/loadingSchemeString'
import { loadingSchemeStringInverse } from '../../constants/loadingSchemeString'


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
            programGroupTableData: this.initProgramGroupTableData(userObject),
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
                    sequential: sequentialTableVal
                })

            })
            console.log(tableData)
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

        var payLoad = {}
        var programsObject = {}

        var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`
        var teamPath = `/users/${this.props.firebase.auth.currentUser.uid}/teams/${teamName}`


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


        athleteData.forEach(athlete => {
            payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/joiningDate'] = Math.floor(new Date().getTime())

            if (programData.unlimited) {
                programData.unlimited.forEach(program => {

                    var insertionProgramObject = {
                        acutePeriod: program.acutePeriod,
                        chronicPeriod: program.chronicPeriod,
                        currentDayInProgram: 1,
                        loading_scheme: loadingSchemeStringInverse(program.loadingScheme)
                    }

                    // Database path to insert into the athletes pending programs.
                    payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.program] = insertionProgramObject
                    // Database path to keep track of what programs have been shared with which athlete and when.
                    payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.program] = Math.floor(new Date().getTime())
                })
            }

            if (programData.sequential) {
                programData.sequential.forEach(program => {

                    var insertionProgramObject = {
                        acutePeriod: program.acutePeriod,
                        chronicPeriod: program.chronicPeriod,
                        currentDayInProgram: 1,
                        loading_scheme: loadingSchemeStringInverse(program.loadingScheme),
                        order: program.order + '_' + teamName + '_' + this.props.firebase.auth.currentUser.uid
                    }

                    payLoad['/users/' + athlete.uid + '/pendingPrograms/' + program.program] = insertionProgramObject

                    payLoad[athletePath + athlete.uid + '/teams/' + teamName + '/sharedPrograms/' + program.program] = Math.floor(new Date().getTime())
                })
            }
        })

        console.log(payLoad)
        payLoad[teamPath + '/description'] = teamDescription
        payLoad[teamPath + '/programs'] = programsObject

        // this.props.firebase.createTeamUpstream(payLoad)
    }


    render() {
        const {
            loading,
            athleteTableData,
            programTableData,
            teamsTableData,
            programGroupTableData
        } = this.state

        console.log(programTableData)
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
                            programGroupTableData={programGroupTableData}
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