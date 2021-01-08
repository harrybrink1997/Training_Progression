import React, { useState, useEffect } from 'react'

import { AuthUserContext } from '../Session'
import SignOutButton from '../SignOut'
import * as ROUTES from '../../constants/routes'
import { useLocation } from 'react-router-dom'

import { Button, Menu, Image } from 'semantic-ui-react'

const Navigation = ({ custClass }) => {

    return (
        <AuthUserContext.Consumer>
            {authUser =>
                authUser ?
                    <NavigationAuth
                        custClass={
                            custClass != undefined ?
                                custClass
                                :
                                ''
                        }

                    />
                    :
                    <NavigationNotAuth custClass={
                        custClass != undefined ?
                            custClass
                            :
                            ''
                    }
                    />
            }
        </AuthUserContext.Consumer>
    )
}


const NavigationAuth = ({ custClass }) => {


    return (
        < Menu className={"auth-nav-bar" + " " + custClass} >
            <Menu.Item
                as='a'
                href={ROUTES.LANDING}
            >
                <Image src={require('./Images/corvusStrengthLogoTransparent.png')} size='tiny' centered />
            </Menu.Item>
            {/* <Menu.Item
                as='a'
                href={ROUTES.SAFETY_GRAPH}
                active={useLocation().pathname == '/safety-graph'}
            >
                Safety Graph
            </Menu.Item> */}
            <Menu.Item
                as='a'
                href={ROUTES.HOME}
                active={useLocation().pathname == '/home'}
            >
                Home
            </Menu.Item>
            {/* <Menu.Item
                as='a'
                href={ROUTES.ADMIN}
                active={useLocation().pathname == '/admin'}
            >
                Admin
            </Menu.Item> */}
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
                href={ROUTES.PROG_DATA}
                active={useLocation().pathname == '/progression'}
            >
                Progression Data
            </Menu.Item>
            <Menu.Item
                as='a'
                href={ROUTES.PAST_PROGRAMS}
                active={useLocation().pathname == '/past-programs'}
            >
                Past Programs
            </Menu.Item>
            <Menu.Item className='signOutButton' position='right'>
                {/* <Button>hello</Button> */}
                <SignOutButton />
            </Menu.Item>
        </Menu >
    )
}

const NavigationNotAuth = ({ custClass }) => {
    return (
        <Menu className={"not-auth-nav-bar" + " " + custClass}>
            <Menu.Item
                as='a'
                href={ROUTES.LANDING}
            >
            </Menu.Item>
        </Menu>
    )
}

export default Navigation;




