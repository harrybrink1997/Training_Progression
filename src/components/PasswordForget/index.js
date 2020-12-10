import React, { Component } from 'react';
import { withFirebase } from '../Firebase';

import PasswordForgetForm from './passwordForgetForm'
import InputLabel from '../CustomComponents/DarkModeInput'
import { Button } from 'semantic-ui-react'


class PasswordForgetPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            emailAddressInputError: null,
            emailSent: false,
            emailSending: false
        };
    }

    handlePasswordForgetSubmit = (email) => {
        this.setState({
            emailAddressInputError: null,
            emailSending: true
        }, async () => {

            this.props.firebase
                .doPasswordReset(email)
                .then(() => {
                    this.setState({
                        emailSending: false,
                        emailSent: true
                    })
                })
                .catch(error => {
                    this.setState({
                        emailAddressInputError: error,
                        emailSending: false
                    });
                });
        })
    }

    render() {
        const {
            emailAddressInputError,
            emailSent,
            emailSending
        } = this.state

        return (
            <div id='signInPageMainContainer'>
                <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                    <InputLabel
                        text='Password Reset'
                        custID='signInPageMainLabel'
                    />
                    <PasswordForgetForm
                        buttonIcon={
                            emailSending ?
                                <Button
                                    loading
                                    className='lightPurpleButton'
                                >
                                    Loading
                                </Button>
                                :
                                < Button
                                    className='lightPurpleButton'
                                    type="submit">
                                    Reset Password
                                </Button>

                        }
                        submitPasswordForgetHandler={this.handlePasswordForgetSubmit}
                    />
                    <div id='signInEmailFooterMessagesContainer'>
                        {emailAddressInputError && <p>{emailAddressInputError.message}</p>}
                        {emailSent &&
                            <div>Email has been sent!</div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}



export default withFirebase(PasswordForgetPage)