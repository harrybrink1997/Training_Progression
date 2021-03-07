import React, { useState, useEffect } from 'react'

import { AuthUserContext } from '../Session'
import SignOutButton from '../SignOut'
import * as ROUTES from '../../constants/routes'
import { useLocation } from 'react-router-dom'

import { Button, Menu, Image, Dropdown, Icon } from 'semantic-ui-react'

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


const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}


const NavigationAuth = ({ custClass }) => {

    const { height, width } = useWindowDimensions()
    let location = useLocation().pathname
    const [sideMenu, setSideMenu] = useState(false)

    const generateSmlScreenMenuClassName = (linkTo, currentPosition) => {
        return (linkTo === currentPosition) ? "smlScreenMenuItem active" : "smlScreenMenuItem"
    }

    return (
        <>
            {
                width >= 400 &&
                < Menu className={"auth-nav-bar" + " " + custClass} >
                    <Menu.Item
                        as='a'
                        href={ROUTES.LANDING}
                    >
                        <Image src={require('./Images/corvusStrengthLogoTransparent.png')} size='tiny' centered />
                    </Menu.Item>
                    <Menu.Item
                        as='a'
                        href={ROUTES.HOME}
                        active={location == '/home'}
                    >
                        Home
                     </Menu.Item>
                    <Menu.Item
                        as='a'
                        href={ROUTES.ACCOUNT}
                        active={location == '/account'}
                    >
                        Account
                    </Menu.Item>
                    <Menu.Item className='signOutButton' position='right'>
                        <SignOutButton />
                    </Menu.Item>
                </Menu >
            }
            {
                width < 400 &&
                <div id="smlScreenLandingMenu">
                    <div id="smlScreenMenuCorvusIcon">
                        <a href={ROUTES.LANDING}>
                            <Image src={require('./Images/corvusStrengthLogoTransparent.png')} size='tiny' centered />
                        </a>
                    </div>
                    <div
                        id="smlScreenMenuToggle"
                        onClick={() => { setSideMenu(!sideMenu) }}
                    >
                        <Icon
                            name="align justify"
                            size="large"
                        />
                    </div>
                    {
                        sideMenu &&
                        <div id="smlScreenMenuContainer">
                            <span
                                className={generateSmlScreenMenuClassName("/home", location)}>
                                <a
                                    href={ROUTES.HOME}
                                >
                                    Home
                                </a>
                            </span>
                            <span className={generateSmlScreenMenuClassName("/account", location)}>
                                <a
                                    href={ROUTES.ACCOUNT}
                                >
                                    Account
                                </a>
                            </span>
                            <span className="smlScreenMenuItem signOutButton">
                                <SignOutButton />
                            </span>
                        </div>
                    }
                </div>
            }

        </>
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




