import React, { Component, useState } from 'react';

import { Button } from 'semantic-ui-react'
import { withAuthorisation } from '../Session';
import * as ROUTES from '../../constants/routes'
import InputLabel from '../CustomComponents/DarkModeInput'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper';

class DeleteAccountPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            deleteAccountError: null,
            processing: false
        }
    }

    handleSubmitDeleteAccount = () => {
        this.setState({ processing: true, deleteAccountError: undefined }, () => {
            this.props.firebase.doDeleteAuthentication()
                .catch(error => {
                    this.setState({
                        deleteAccountError: error,
                        processing: false
                    })
                })
        })
    }

    handleKeepAccount = () => {
        this.props.history.push(ROUTES.ACCOUNT)
    }

    render() {

        const {
            deleteAccountError,
            processing
        } = this.state

        return (
            <NonLandingPageWrapper>
                <div id='signInPageMainContainer'>
                    <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                        <InputLabel
                            text='Delete Account'
                            custID='signInPageMainLabel'
                        />
                        <div id='deleteAccountAreYouSureMessage'>
                            Are you sure you want to delete your account? All historical data will be lost and cannot be recovered.
                    </div>

                        <div id='deleteAccountButtonRow' className='rowContainer'>
                            <Button
                                className='lightPurpleButton'
                                onClick={() => { this.handleKeepAccount() }}
                            >
                                Keep Account
                        </Button>
                            <Button
                                className='lightPurpleButton-inverted'
                                loading={processing}
                                onClick={() => { this.handleSubmitDeleteAccount() }}
                            >
                                Delete Account
                        </Button>
                        </div>
                        <div id='signInEmailFooterMessagesContainer'>
                            {deleteAccountError && <p>{deleteAccountError.message}</p>}
                        </div>
                    </div>
                </div >
            </NonLandingPageWrapper>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(DeleteAccountPage)