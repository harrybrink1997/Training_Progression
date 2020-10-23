import React, { Component } from 'react';

import { withAuthorisation } from '../Session';



class ProgressionDataPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentWeekExercises: []

        }
    }
    render() {

        const { currentWeekExercises } = this.state

        return (
            <div>
                <h1>Progression Data Page</h1>
            </div >
        );
    }
}





const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ProgressionDataPage);