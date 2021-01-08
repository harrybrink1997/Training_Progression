import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader } from 'semantic-ui-react'
import CreateTeamModal from './createTeamModal'


class ManageTeamsPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            createTeamAthleteTableData: [],
            hasCurrentTeams: false
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

        if (userObject.currentTeams !== undefined) {
            this.setState({
                loading: false,
                createTeamAthleteTableData: this.initAthleteTableData(userObject)
            })
        } else {
            this.setState({
                loading: false,
                createTeamAthleteTableData: this.initAthleteTableData(userObject)
            })
        }

    }

    initAthleteTableData = (userObject) => {

        var tableData = []

        Object.keys(userObject.currentAthletes).forEach(athleteUID => {
            var athlete = userObject.currentAthletes[athleteUID]

            tableData.push({
                athlete: athlete.username,
                email: athlete.email,
            })
        })

        return tableData
    }


    render() {
        const {
            loading,
            createTeamAthleteTableData
        } = this.state

        console.log(createTeamAthleteTableData)

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
                            athleteData={createTeamAthleteTableData}
                        />
                    </div>
                </div>

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