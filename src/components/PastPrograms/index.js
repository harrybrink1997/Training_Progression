import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { withAuthorisation } from '../Session';

class PastProgramsPage extends Component {
    constructor(props) {
        super(props);
    }


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