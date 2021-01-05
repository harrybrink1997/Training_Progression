import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'

class ManageAthletesPage extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <NonLandingPageWrapper>
                the boiswfewefe
            </NonLandingPageWrapper>
        )
    }
}

// export default ManageAthletesPage
const condition = role => role === 'coach';
export default withCoachAuthorisation(condition)(ManageAthletesPage);