import React from 'react'

import { AuthUserContext } from '../Session'
import SignOutButton from '../SignOut'
import * as ROUTES from '../../constants/routes'

import { Navbar, Nav } from 'react-bootstrap'

const Navigation = () => (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href={ROUTES.LANDING}>Harry's Hornets</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
            <AuthUserContext.Consumer>
                {authUser =>
                    authUser ? <NavigationAuth /> : <NavigationNotAuth />}
            </AuthUserContext.Consumer>
        </Navbar.Collapse>
    </Navbar>


)


const NavigationAuth = () => (

    <Nav className="auth-nav-bar">
        <Nav.Link href={ROUTES.PROG_DATA}>
            Progression Data
        </Nav.Link>
        <Nav.Link href={ROUTES.SAFETY_GRAPH}>
            Safety Graph
        </Nav.Link>
        <Nav.Link href={ROUTES.HOME}>
            Home
        </Nav.Link>
        <Nav.Link href={ROUTES.ADMIN}>
            Admin
        </Nav.Link>
        <Nav.Link href={ROUTES.ACCOUNT}>
            Account
        </Nav.Link>
        <Nav.Link href={ROUTES.CURRENT_PROGRAMS}>
            Current Programs
        </Nav.Link>
        <Nav.Link href={ROUTES.PAST_PROGRAMS}>
            Past Programs
        </Nav.Link>
        <Nav.Item>
            <SignOutButton />
        </Nav.Item>

    </Nav>

)
const NavigationNotAuth = () => (
    <Nav className="auth-nav-bar">
        <Nav.Link href={ROUTES.SIGN_IN}>
            Safety Graph
        </Nav.Link>
    </Nav>
)

export default Navigation;




