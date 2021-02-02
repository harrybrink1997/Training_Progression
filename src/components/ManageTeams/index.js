import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List } from 'semantic-ui-react'
import CreateTeamModal from './createTeamModal'
import { ManageTeamButton } from '../CustomComponents/customButtons'

import BasicTablePagination from '../CustomComponents/basicTablePagination'
import loadingSchemeString from '../../constants/loadingSchemeString'


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
            programTableData: this.initProgramTableData(userObject),
            programGroupTableData: this.initProgramGroupTableData(userObject),
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
                    accessor: 'buttons',
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

    countAthletesOnTeam = (team, currentAthletes) => {
        var count = 0
        console.log(currentAthletes)
        if (currentAthletes !== undefined) {
            Object.values(currentAthletes).forEach(athlete => {
                if (athlete.teams) {
                    var teamNames = Object.keys(athlete.teams)

                    if (teamNames.includes(team)) {
                        count++
                    }
                }
            })
        }

        return count
    }

    handleManageTeamClick = (teamName) => {
        console.log(teamName)
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
                    sequential: sequentialTableVal,
                    unlimitedRawData: programGroup.unlimited,
                    sequentialRawData: programGroup.sequential

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

        console.log(programData)

        var payLoad = {}
        var programsObject = {}
        var timestamp = new Date().getTime()

        var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`
        var teamPath = `/users/${this.props.firebase.auth.currentUser.uid}/teams/${teamName}`


        if (programData.unlimited) {
            programsObject.unlimited = {}
            programData.unlimited.forEach(program => {
                programsObject.unlimited[program.programUID] = {
                    dateSet: timestamp
                }
            })
        }

        if (programData.sequential) {
            programsObject.sequential = {}
            programData.sequential.forEach(program => {
                programsObject.sequential[program.programUID] = {
                    dateSet: timestamp,
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
            currTeamListArray
        } = this.state

        console.log(currTeamListArray)
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