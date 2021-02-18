import React, { Component, useState } from 'react';

import { withAuthorisation } from '../Session';
import JoinTeamForm from './joinTeamForm'

import InputLabel from '../CustomComponents/DarkModeInput'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper';
import { createUserObject } from '../../objects/user'

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

    componentDidMount = () => {
        this.props.firebase.getUser(this.props.firebase.auth.currentUser.uid)
            .then(snapshot => {
                var userInfo = snapshot.data()

                var userObject = createUserObject(
                    this.props.firebase.auth.currentUser.uid,
                    userInfo
                )
                this.setState({
                    user: userObject
                })
            })
    }

    generateErrorMessage = (error) => {
        if (error === 'invalidEmail') {
            return 'Request could not be completed: The email you entered is invalid.'
        } else if (error === 'alreadyMember') {
            return "Request could not be completed: The email you entered belongs to a coach you're already working with."
        } else if (error === 'alreadyRequested') {
            return 'Request could not be completed: You currently have a pending request with this coach.'
        }
    }

    handleSubmitJoinTeam = (email, message) => {

        if (message === '') {
            message = 'No Additional Notes'
        }
        this.setState({
            submitProcessing: true,
            requestError: false,
        }, () => {
            this.props.firebase.validCoachRequest(
                email,
                this.props.firebase.auth.currentUser.uid
            )
                .then(res => {
                    console.log(res)
                    if (res.success) {
                        var payload = {
                            message: message,
                            coachUID: res.coachUID,
                            coachEmail: email,
                            coachUsername: res.coachUsername,
                            athleteUID: this.props.firebase.auth.currentUser.uid,
                            athleteEmail: this.state.user.getEmail(),
                            athleteUsername: this.state.user.getUsername()
                        }

                        this.props.firebase.createCoachRequestDB(payload).then(res => {
                            this.setState({
                                submitProcessing: false,
                                requestSent: true
                            })
                        })
                    } else {
                        this.setState({
                            submitProcessing: false,
                            requestError: true,
                            errorMsg: this.generateErrorMessage(res.error)
                        })
                    }
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
            <NonLandingPageWrapper>
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
            </NonLandingPageWrapper>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(JoinTeamPage)