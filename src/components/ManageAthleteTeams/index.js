import React, { Component } from 'react'
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader } from 'semantic-ui-react';

class ManageCoachTeamsPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: true,
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

    }


    render() {

        const { loading } = this.state

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        return (
            <>
                { loading && loadingHTML}
            </>
        )
    }


}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageCoachTeamsPage)