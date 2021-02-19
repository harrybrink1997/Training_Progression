import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Loader, Button } from 'semantic-ui-react';
import * as ROUTES from '../../constants/routes'
import ProgramDeployment, { initProgDeployCoachProgGroupTableData, initProgDeployCoachProgramTableData } from '../CustomComponents/programDeployment';

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
                console.log(snap)

                this.setState({
                    athleteData: this.initAthleteData(snap.currentAthletes),
                    programGroupData: initProgDeployCoachProgGroupTableData(snap.programGroups),
                    programData: initProgDeployCoachProgramTableData(snap.programs)
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

        return (
            <>
                {pageBodyContentLoading && pageBodyContentLoadingHTML}
            </>
        )
    }
}


const condition = authUser => !!authUser;
export default withAuthorisation(condition)(CreateCoachTeamPage)