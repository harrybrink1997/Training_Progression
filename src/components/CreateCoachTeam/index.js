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
                    pageBodyContentLoading: false,
                    createTeamProcessing: true
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

        this.setState({
            createTeamProcessing: true
        }, () => {

        })
        var timestamp = new Date().getTime()


        var coachPayload = {
            teamName: teamName,
            description: teamDescription,
            creationDate: timestamp
        }

        var athletePayload = {
            owner: this.props.firebase.auth.currentUser.uid,
            teamName: teamName,
            joiningDate: timestamp
        }

        var athleteList = athleteData.map(athlete => {
            return athlete.uid
        })

        var progInfo = []

        if (programData.unlimited) {

            coachPayload.programs = {
                unlimited: {}
            }

            programData.unlimited.forEach(program => {
                coachPayload.programs.unlimited[program.programUID] = {
                    dateSet: [timestamp]
                }

                progInfo.push({
                    name: program.programUID,
                    isUnlimited: true,
                    deploymentDate: timestamp
                })
            })

        }

        if (programData.sequential) {

            if (coachPayload.programs) {
                coachPayload.programs.sequential = {}

            } else {
                coachPayload.programs = {
                    sequential: {}
                }
            }

            programData.sequential.forEach(program => {
                coachPayload.programs.sequential[program.programUID] = {
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

                progInfo.push({
                    name: program.programUID,
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
                })
            })
        }

        this.props.firebase.createTeamDB(
            this.props.firebase.auth.currentUser.uid,
            coachPayload,
            athletePayload,
            athleteList,
            progInfo
        )
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