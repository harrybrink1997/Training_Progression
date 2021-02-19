import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Loader, Button } from 'semantic-ui-react';
import * as ROUTES from '../../constants/routes'

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
            })
        })
    }

    handleManageTeamsRedirect = () => {
        this.props.history.push(ROUTES.MANAGE_COACH_TEAMS)
    }

    render() {
        const {
            pageBodyContentLoading
        } = this.state


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