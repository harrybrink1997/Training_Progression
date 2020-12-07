import React, { useState, useEffect } from 'react'

import { AuthUserContext } from '../Session'
import SignOutButton from '../SignOut'
import * as ROUTES from '../../constants/routes'
import { useLocation } from 'react-router-dom'

import { Menu } from 'semantic-ui-react'


const Navigation = ({ currentPage, changePageHandler }) => (
    <AuthUserContext.Consumer>
        {authUser =>
            authUser ?
                <NavigationAuth
                    currentPage={currentPage}
                    changePageHandler={changePageHandler}
                />
                :
                <NavigationNotAuth currentPage={currentPage} />}
    </AuthUserContext.Consumer>
)


const NavigationAuth = () => {


    return (
        < Menu className="auth-nav-bar" >
            <Menu.Item
                as='a'
                href={ROUTES.LANDING}
            ></Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.PROG_DATA}
                active={useLocation().pathname == '/progression'}
            >
                Progression Data
            </Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.SAFETY_GRAPH}
                active={useLocation().pathname == '/safety-graph'}
            >
                Safety Graph
            </Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.HOME}
                active={useLocation().pathname == '/home'}
            >
                Home
            </Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.ADMIN}
                active={useLocation().pathname == '/admin'}
            >
                Admin
            </Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.ACCOUNT}
                active={useLocation().pathname == '/account'}
            >
                Account
            </Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.CURRENT_PROGRAMS}
                active={useLocation().pathname == '/current-programs'}
            >
                Current Programs
            </Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.PAST_PROGRAMS}
                active={useLocation().pathname == '/past-programs'}
            >
                Past Programs
            </Menu.Item>
            <Menu.Item>
                <SignOutButton />
            </Menu.Item>
        </Menu >
    )
}

const NavigationNotAuth = ({ currentPage }) => (
    <Menu className="not-auth-nav-bar">
        <Menu.Item as='a' href={ROUTES.SIGN_IN}>
            Safety Graph
        </Menu.Item>
    </Menu>
)

export default Navigation;




