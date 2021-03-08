import React, { Component } from 'react'

import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'

import SignUpForm from './signUpForm'
import InputLabel from '../CustomComponents/DarkModeInput'

class SignUpPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            signUpError: null,
            signUpProcessing: false
        };
    }

    handleClickSignUp = () => {
        this.props.history.push(ROUTES.SIGN_UP)
    }

    handleSubmitSignUp = (username, email, password, userType) => {

        this.setState({
            signUpProcessing: true
        }, () => {
            let actionCodeSettings = {
                url: '/home',
                handleCodeInApp: true,
            }
            this.props.firebase
                .doCreateUserWithEmailAndPassword(email, password)
                .then(async authUser => {
                    window.localStorage.setItem('corvusEmailForSignIn', email)
                    // Create a user in your Firebase realtime database
                    var userPath = `users/${authUser.user.uid}`
                    console.log(userPath)
                    var typePath = `userTypes/${authUser.user.uid}`

                    var payLoad = {
                        username: username,
                        email: email,
                        userType: userType,
                        permissions: {
                            admin: false,
                        }
                    }
                    await this.props.firebase.createUserDB(authUser.user.uid, payLoad)

                    await authUser.user.sendEmailVerification()

                })
                .then(() => {
                    this.props.history.push(ROUTES.VERIFY_EMAIL);
                })
                .catch(error => {
                    this.setState({
                        signUpError: error,
                        signUpProcessing: false
                    });
                });
        })


    }

    render() {
        const {
            signUpError,
            signUpProcessing
        } = this.state;


        return (
            <div id='signInPageMainContainer'>
                <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                    <InputLabel
                        text='Corvus Sign Up'
                        custID='signInPageMainLabel'
                    />
                    <SignUpForm
                        submitSignUpHandler={this.handleSubmitSignUp}
                        signUpProcessing={signUpProcessing}
                    />
                    <div id='signInEmailFooterMessagesContainer'>
                        {signUpError && <p>{signUpError.message}</p>}
                    </div>
                </div>
            </div>
        )
    }
}

export default withFirebase(SignUpPage);