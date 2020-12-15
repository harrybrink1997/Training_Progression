import React, { Component, useState } from 'react';

import { Button } from 'semantic-ui-react'
import { withAuthorisation } from '../Session';
import * as ROUTES from '../../constants/routes'
import InputLabel from '../CustomComponents/DarkModeInput'

class DeleteAccountPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            deleteAccountError: null
        }
    }

    handleSubmitDeleteAccount = () => {
        console.log("submitted")
        var userID = this.props.firebase.auth.currentUser.uid
        this.props.firebase.doDeleteAuthentication()
            .then(() => {
                this.props.firebase.deleteUserInDatabase(
                    userID
                )
            })
            .catch(error => {
                this.setState({
                    deleteAccountError: error
                })
            })

    }

    handleKeepAccount = () => {
        this.props.history.push(ROUTES.ACCOUNT)
    }

    render() {

        const {
            deleteAccountError
        } = this.state

        return (
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
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(DeleteAccountPage)