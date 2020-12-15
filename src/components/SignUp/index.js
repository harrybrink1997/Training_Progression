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

    handleSubmitSignUp = (username, email, password) => {
        console.log(username)
        console.log(password)
        console.log(email)
        this.setState({
            signUpProcessing: true
        }, () => {
            this.props.firebase
                .doCreateUserWithEmailAndPassword(email, password)
                .then(authUser => {
                    // Create a user in your Firebase realtime database
                    return this.props.firebase.createUserUpstream(
                        authUser.user.uid,
                        {
                            username: username,
                            email: email,
                        })
                })
                .then(() => {
                    this.props.history.push(ROUTES.HOME);
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