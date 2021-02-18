import React, { Component, useState } from 'react';

import { withAuthorisation } from '../Session';
import EmailChangeForm from './emailChangeForm'

import InputLabel from '../CustomComponents/DarkModeInput'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper';

class EmailChangePage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            emailChangeError: null,
            submitProcessing: false,
            emailChanged: false
        }
    }

    handleSubmitEmailChange = (email) => {
        console.log(email)

        this.setState({
            submitProcessing: true
        })
        this.props.firebase
            .doEmailUpdate(email)
            .then(() => {
                this.props.firebase.updateEmailInDatabase(
                    this.props.firebase.auth.currentUser.uid,
                    email
                )
            })
            .then(() => {
                this.setState({
                    emailChanged: true,
                    emailChangeError: null,
                    submitProcessing: false
                });
            })
            .catch(error => {
                this.setState({
                    emailChangeError: error,
                    submitProcessing: false
                });
            });


    }

    render() {
        const {
            emailChangeError,
            submitProcessing,
            emailChanged
        } = this.state;


        return (
            <NonLandingPageWrapper>
                <div id='signInPageMainContainer'>
                    <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                        <InputLabel
                            text='Email Change'
                            custID='signInPageMainLabel'
                        />
                        <EmailChangeForm
                            submitEmailChangeHandler={this.handleSubmitEmailChange}
                            submitProcessing={submitProcessing}
                        />
                        <div id='signInEmailFooterMessagesContainer'>
                            {emailChangeError && <p>{emailChangeError.message}</p>}
                            {emailChanged && <div>Email Changed!</div>}
                        </div>
                    </div>
                </div>
            </NonLandingPageWrapper >
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(EmailChangePage)