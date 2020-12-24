import React, { Component, useState } from 'react';

import { withAuthorisation } from '../Session';
import JoinTeamForm from './joinTeamForm'

import InputLabel from '../CustomComponents/DarkModeInput'

class JoinTeamPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            submitProcessing: false,
            requestSent: false,
            requestError: false,
            errorMsg: ''

        }
    }

    isValidTeamRequest = (userObject, coachUID, coachUsername) => {
        if (userObject.teams === undefined) {
            return {
                isValid: true,
            }
        } else {
            if (Object.keys(userObject.teams).length > 0) {
                return {
                    isValid: false,
                    errorMsg: 'Cannot join more then one team.'
                }
            } else if (userObject.teams[coachUID] != undefined) {
                return {
                    isValid: false,
                    errorMsg: `You are already apart of ${coachUsername}'s team.`
                }
            }
        }
    }

    handleSubmitJoinTeam = (email, message) => {

        if (message === '') {
            message = 'No Additional Notes'
        }
        this.setState({
            submitProcessing: true,
            requestError: false,
        }, async () => {
            await this.props.firebase.users().once('value', async typeData => {
                var users = typeData.val();

                for (var user in users) {
                    if (users[user].email === email && users[user].userType === 'coach') {

                        var validateRequest = this.isValidTeamRequest(
                            users[this.props.firebase.auth.currentUser.uid],
                            user
                        )

                        if (validateRequest.isValid) {
                            var payLoad = {
                                message: message,
                                username: users[this.props.firebase.auth.currentUser.uid].username,
                                email: users[this.props.firebase.auth.currentUser.uid].email
                            }
                            await this.props.firebase.sendTeamRequestUpstream(
                                this.props.firebase.auth.currentUser.uid,
                                user,
                                payLoad
                            )

                            this.setState({
                                submitProcessing: false,
                                requestSent: true
                            })
                        } else {
                            this.setState({
                                submitProcessing: false,
                                requestError: true,
                                errorMsg: validateRequest.errorMsg
                            })
                        }
                        return
                    }
                }

                this.setState({
                    submitProcessing: false,
                    requestError: true,
                    errorMsg: 'Could not process request, the email you input is invalid.'
                })

            })
        })
    }

    render() {
        const {
            requestError,
            submitProcessing,
            requestSent,
            errorMsg
        } = this.state;


        return (
            <div id='signInPageMainContainer'>
                <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                    <InputLabel
                        text='Join A Team'
                        custID='signInPageMainLabel'
                    />
                    <JoinTeamForm
                        submitRequestHandler={this.handleSubmitJoinTeam}
                        submitProcessing={submitProcessing}
                    />
                    <div id='signInEmailFooterMessagesContainer'>
                        {requestError && <p>{errorMsg}</p>}
                        {requestSent && <div>Request Sent!</div>}
                    </div>
                </div>
            </div>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(JoinTeamPage)