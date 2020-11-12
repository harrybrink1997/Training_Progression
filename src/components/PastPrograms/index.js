import React, { Component } from 'react';

import { withAuthorisation } from '../Session';

class PastProgramsPage extends Component {

    render() {


        return (
            <div>
                Past programs page
            </div >
        );
    }
}





const condition = authUser => !!authUser;
export default withAuthorisation(condition)(PastProgramsPage);