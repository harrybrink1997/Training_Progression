import React from 'react'

import { withFirebase } from '../Firebase'
import { Menu } from 'semantic-ui-react'

const SignOutButton = ({ firebase }) => (
    <Menu.Item onClick={firebase.doSignOut}>
        Sign Out
    </Menu.Item>
);

export default withFirebase(SignOutButton);