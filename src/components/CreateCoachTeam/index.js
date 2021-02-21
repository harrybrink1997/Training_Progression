import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Loader, Button } from 'semantic-ui-react';
import * as ROUTES from '../../constants/routes'
import ProgramDeployment, { initProgDeployCoachProgGroupTableData, initProgDeployCoachProgramTableData } from '../CustomComponents/programDeployment';
import CreateCoachTeamForm from './createCoachTeamForm'

class CreateCoachTeamPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            pageBodyContentLoading: true,
        }
    }

    componentDidMount = () => {
        this.setState({
            pageBodyContentLoading: true
        }, () => {
            this.props.firebase.getCreateTeamData(
                this.props.firebase.auth.currentUser.uid
            ).then(snap => {
                this.setState({
                    athleteData: this.initAthleteData(snap.currentAthletes),
                    programGroupData: initProgDeployCoachProgGroupTableData(snap.programGroups),
                    programData: initProgDeployCoachProgramTableData(snap.programs),
                    pageBodyContentLoading: false
                })
            })
        })
    }

    initAthleteData = (athleteData) => {

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
        if (athleteData.length > 0) {
            var tableData = athleteData.map(athlete => {
                return {
                    athlete: athlete.username,
                    email: athlete.email,
                    uid: athlete.athleteUID
                }
            })

            payload.data = tableData
            return payload
        } else {
            return payload
        }

    }


    handleCreateTeam = (teamName, teamDescription, athleteData, programData) => {

        console.log(teamName)
        console.log(teamDescription)
        console.log(athleteData)
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

        console.log(payLoad)
        // this.props.firebase.createTeamUpstream(payLoad)
    }

    handleManageTeamsRedirect = () => {
        this.props.history.push(ROUTES.MANAGE_COACH_TEAMS)
    }

    render() {
        const {
            pageBodyContentLoading,
            programData,
            programGroupData,
            athleteData
        } = this.state
        console.log(athleteData)
        console.log(programData)
        console.log(programGroupData)

        let pageBodyContentLoadingHTML =
            <NonLandingPageWrapper>
                <div className='rowContainer clickableDiv'>
                    <Button
                        content='Back'
                        className='backButton-inverted'
                        circular
                        icon='arrow left'
                        onClick={() => { this.handleManageTeamsRedirect() }}
                    />
                </div>
                <div className='vert-aligned'>
                    <Loader active inline='centered' content="Collecting Some Stuff You'll Need..." />
                </div>
            </NonLandingPageWrapper>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className='rowContainer clickableDiv'>
                    <Button
                        content='Back'
                        className='backButton-inverted'
                        circular
                        icon='arrow left'
                        onClick={() => { this.handleManageTeamsRedirect() }}
                    />
                </div>
                <div>
                    <CreateCoachTeamForm
                        currTeamListArray={['none']}
                        athleteTableData={athleteData}
                        programTableData={programData}
                        programGroupTableData={programGroupData}
                        handleFormSubmit={this.handleCreateTeam}
                    />
                </div>
            </NonLandingPageWrapper>

        return (
            <>
                {pageBodyContentLoading && pageBodyContentLoadingHTML}
                {!pageBodyContentLoading && nonLoadingHTML}
            </>
        )
    }
}


const condition = authUser => !!authUser;
export default withAuthorisation(condition)(CreateCoachTeamPage)