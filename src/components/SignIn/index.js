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

class SignInPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginError: null
        };
    }

    handleClickSignUp = () => {
        this.props.history.push(ROUTES.SIGN_UP)
    }

    handleClickForgetPassword = () => {
        this.props.history.push(ROUTES.PASSWORD_FORGET)
    }

    handleSubmitSignIn = (email, password) => {
        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                this.setState({
                    loginError: error
                });
            });

    }

    render() {
        const {
            loginError,
            loading
        } = this.state;

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <div id='signInPageMainContainer'>
                <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                    <InputLabel
                        text='Member Sign In'
                        custID='signInPageMainLabel'
                    />
                    <LoginForm
                        submitLoginHandler={this.handleSubmitSignIn}
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

        return (
            <div>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }
}

export default withFirebase(SignInPage);