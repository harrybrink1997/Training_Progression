import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List } from 'semantic-ui-react'

import RowSelectTable from '../CustomComponents/rowSelectTable'
import ManageAthleteModal from './manageAthleteModal'
import loadingSchemeString from '../../constants/loadingSchemeString'

class ManageAthletesPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            athleteManagementTableData: [],
            athleteManagementTableColumns: [],
            selectedAthletesTable: [],
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
            athleteManagementTableData: this.initAthleteTableData(userObject, coachProgTableData),
            athleteManagementTableColumns: this.initAthleteTableColumns(),
            coachProgramTableData: coachProgTableData,
            currentProgramsData: userObject.currentPrograms,
            loading: false
        })
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


    initAthleteTableData = (userObject, coachProgramTableData) => {

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
                    <ManageAthleteModal
                        athleteUID={athleteUID}
                        athleteData={athlete}
                        coachProgramTableData={coachProgramTableData}
                        assignProgHandler={this.handleDeployAthleteProgram}
                        initProgGroupTabData={progGroupTableData}
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
            console.log(tableData)
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


    handleDeployAthleteProgram = (programData, athleteUid) => {

        var payLoad = {}
        var timestamp = new Date().getTime()

        var athletePath = `/users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/`

        if (programData.unlimited) {
            programData.unlimited.forEach(program => {

                var insertionProgramObject = this.state.currentProgramsData[program.programUID]
                insertionProgramObject.currentDayInProgram = 1
                insertionProgramObject.deploymentDate = timestamp

                // Database path to insert into the athletes pending programs.
                payLoad['/users/' + athleteUid + '/pendingPrograms/' + program.programUID] = insertionProgramObject
                // Database path to keep track of what programs have been shared with which athlete and when.
                payLoad[athletePath + athleteUid + '/teams/' + 'none' + '/sharedPrograms/' + program.programUID] = timestamp
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

                payLoad[athletePath + athleteUid + '/teams/' + 'none' + '/sharedPrograms/' + program.programUID] = timestamp
            })
        }

        console.log(payLoad)
        // this.props.firebase.createTeamUpstream(payLoad)
    }


    render() {
        const {
            loading,
            athleteManagementTableData,
            athleteManagementTableColumns
        } = this.state
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    hello
                </div>

                <RowSelectTable
                    data={athleteManagementTableData}
                    columns={athleteManagementTableColumns}
                    rowSelectChangeHandler={this.handleAthleteSelection}
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
export default withCoachAuthorisation(condition)(ManageAthletesPage);