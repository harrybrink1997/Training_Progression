import React from 'react'

import { AuthUserContext } from '../Session'
import SignOutButton from '../SignOut'
import * as ROUTES from '../../constants/routes'

import { Menu } from 'semantic-ui-react'


const Navigation = () => (
    <AuthUserContext.Consumer>
        {authUser =>
            authUser ? <NavigationAuth /> : <NavigationNotAuth />}
    </AuthUserContext.Consumer>
)


const NavigationAuth = () => (
    <Menu className="auth-nav-bar">
        <Menu.Item as='a' href={ROUTES.PROG_DATA}>
            Progression Data
            </Menu.Item>
        <Menu.Item as='a' href={ROUTES.SAFETY_GRAPH}>
            Safety Graph
            </Menu.Item>
        <Menu.Item as='a' href={ROUTES.HOME}>
            Home
            </Menu.Item>
        <Menu.Item as='a' href={ROUTES.ADMIN}>
            Admin
            </Menu.Item>
        <Menu.Item as='a' href={ROUTES.ACCOUNT}>
            Account
            </Menu.Item>
        <Menu.Item as='a' href={ROUTES.CURRENT_PROGRAMS}>
            Current Programs
            </Menu.Item>
        <Menu.Item as='a' href={ROUTES.PAST_PROGRAMS}>
            Past Programs
            </Menu.Item>
        <Menu.Item>
            <SignOutButton />
        </Menu.Item>
    </Menu>
)

const NavigationNotAuth = () => (
    <Menu className="auth-nav-bar">
        <Menu.Item as='a' href={ROUTES.SIGN_IN}>
            Safety Graph
        </Menu.Item>
    </Menu>
)

export default Navigation;




