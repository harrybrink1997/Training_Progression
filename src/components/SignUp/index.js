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
            this.props.firebase
                .doCreateUserWithEmailAndPassword(email, password)
                .then(async authUser => {

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
                    // await this.props.firebase.grantModeratorRole(authUser.user.uid, userType)
                    // await this.props.firebase.auth.currentUser.getIdTokenResult(true)

                    // TODO DELETE AFTER DB MIGRATION
                    var rtPL = {}
                    rtPL[userPath] = payLoad
                    await this.props.firebase.createUserUpstream(rtPL)
                    // END OF DELETE

                    await this.props.firebase.createUserDB(authUser.user.uid, payLoad)
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