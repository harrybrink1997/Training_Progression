import React, { Component, useState } from 'react';

import { withAuthorisation } from '../Session';
import PasswordChangeForm from './passwordChangeForm'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import FullPageForm from '../PageStructure/fullPageForm'

import InputLabel from '../CustomComponents/DarkModeInput'

class PasswordChangePage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            passwordChangeError: null,
            submitProcessing: false,
            passwordChanged: false
        }
    }

    handleSubmitPasswordChange = (password) => {
        console.log(password)

        this.setState({
            submitProcessing: true
        })
        this.props.firebase
            .doPasswordUpdate(password)
            .then(() => {
                this.setState({
                    passwordChanged: true,
                    submitProcessing: false
                });
            })
            .catch(error => {
                this.setState({
                    passwordChangeError: error,
                    submitProcessing: false
                });
            });


    }

    render() {
        const {
            passwordChangeError,
            submitProcessing,
            passwordChanged
        } = this.state;


        return (
            <NonLandingPageWrapper>
                <FullPageForm>
                    <FullPageForm.Header>
                        Password Change
                    </FullPageForm.Header>
                    <PasswordChangeForm
                        submitPasswordChangeHandler={this.handleSubmitPasswordChange}
                        submitProcessing={submitProcessing}
                    />
                    <div id='signInEmailFooterMessagesContainer'>
                        {passwordChangeError && <p>{passwordChangeError.message}</p>}
                        {passwordChanged && <div>Password Changed!</div>}
                    </div>
                </FullPageForm>
            </NonLandingPageWrapper>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(PasswordChangePage)