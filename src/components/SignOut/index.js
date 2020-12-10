import React from 'react'

import { withFirebase } from '../Firebase/context'
import { Menu } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'

const SignOutButton = ({ firebase }) => (

    <Menu.Item onClick={firebase.doSignOut}>
        Sign Out
    </Menu.Item>
)

export default withFirebase(SignOutButton);