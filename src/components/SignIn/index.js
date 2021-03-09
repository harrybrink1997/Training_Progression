import React, { Component, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import { Form, Dimmer, Loader, Input } from 'semantic-ui-react'

import LoginForm from './loginForm'
import SignUpLink from '../SignUp/signUpLink'
import ForgetPasswordLink from '../PasswordForget/passwordForgetLink'
import InputLabel from '../CustomComponents/DarkModeInput';
import Navigation from '../Navigation'

const devAccounts = [
    'athlete@gmail.com',
    'athlete1@gmail.com',
    'athlete2@gmail.com',
    'coach@gmail.com',
    'coach1@gmail.com'
]

class SignInPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginError: null,
            signInProcessing: false,
        };
    }

    handleClickSignUp = () => {
        this.props.history.push(ROUTES.SIGN_UP)
    }

    handleClickForgetPassword = () => {
        this.props.history.push(ROUTES.PASSWORD_FORGET)
    }

    handleSubmitSignIn = (email, password) => {
        this.setState({
            loginError: null,
            signInProcessing: true
        }, () => {
            this.props.firebase
                .doSignInWithEmailAndPassword(email, password)
                .then(user => {
                    if (devAccounts.includes(email)) {
                        this.props.history.push(ROUTES.HOME);
                    } else {
                        if (user.user.emailVerified) {
                            this.props.history.push(ROUTES.HOME);
                        } else {
                            throw new Error("The email you are trying to sign in with has not been verified. Please verify this email before signing in.")
                        }
                    }
                })
                .catch(error => {
                    this.setState({
                        loginError: error,
                        signInProcessing: false
                    });
                });
        })
    }

    render() {
        const {
            loginError,
            loading,
            signInProcessing,
            signInFromLink
        } = this.state;

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <div>
                <Navigation />
                <div id='signInPageMainContainer'>
                    <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                        <InputLabel
                            text='Member Sign In'
                            custID='signInPageMainLabel'
                        />
                        <LoginForm
                            submitLoginHandler={this.handleSubmitSignIn}
                            signInProcessing={signInProcessing}
                        />
                        <div id='signInEmailFooterMessagesContainer'>
                            {loginError && <p>{loginError.message}</p>}
                            <SignUpLink
                                signUpdirectHandler={this.handleClickSignUp}
                            />
                            <ForgetPasswordLink
                                passwordForgetdirectHandler={this.handleClickForgetPassword}
                            />
                        </div>
                    </div>
                </div>
            </div >

        return (
            <div>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }
}

export default withFirebase(SignInPage);