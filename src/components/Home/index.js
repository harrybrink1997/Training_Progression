import React from 'react'

import { withAuthorisation } from '../Session';

const HomePage = () => (
    <div> this is the home page </div>
)

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(HomePage);