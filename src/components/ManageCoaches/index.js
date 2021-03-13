import React, { Component, useState } from 'react';

import { withAuthorisation } from '../Session';
import JoinTeamForm from './joinTeamForm'
import { Card, Icon, Button, Loader } from 'semantic-ui-react'

import InputLabel from '../CustomComponents/DarkModeInput'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper';
import { createUserObject } from '../../objects/user'
import BasicTable from '../CustomComponents/basicTable';

class ManageCoachesPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            submitProcessing: false,
            requestSent: false,
            requestError: false,
            errorMsg: '',
            view: 'home'
        }
    }

    componentDidMount = () => {
        this.setState({
            loading: true
        }, () => {
            this.props.firebase.getUser(this.props.firebase.auth.currentUser.uid)
                .then(snapshot => {
                    var userInfo = snapshot.data()

                    var userObject = createUserObject(
                        this.props.firebase.auth.currentUser.uid,
                        userInfo
                    )
                    return userObject
                })
                .then(userObject => {

                    this.props.firebase.getCurrentAthleteCoaches(
                        this.props.firebase.auth.currentUser.uid
                    ).then(coachData => {
                        this.setState({
                            user: userObject,
                            currentCoachTableData: this.initCurrentCoachTableData(coachData),
                            loading: false
                        })
                    })

                })
        })

    }

    handleLeaveCoachButton = (coachUID) => {
        console.log(coachUID)
        this.setState({
            loading: true
        }, () => {
            this.props.firebase.removeAthleteFromCoach(
                coachUID,
                this.props.firebase.auth.currentUser.uid
            )
                .then(updatedData => {
                    this.setState({
                        currentCoachTableData: this.initCurrentCoachTableData(updatedData),
                        loading: false
                    })
                })
        })
    }

    initCurrentCoachTableData = (data) => {
        let payload = {
            columns: [
                {
                    Header: 'Username',
                    accessor: 'username'
                },
                {
                    Header: 'Email',
                    accessor: 'email'
                },
                {
                    accessor: 'buttons'
                }
            ],
            data: []
        }

        data.forEach(coach => {
            coach.buttons =
                <Button
                    className='lightRedButton-inverted'
                    onClick={() => { this.handleLeaveCoachButton(coach.coachUID) }}
                >
                    Leave Coach
            </Button>

            payload.data.push(coach)
        })
        return payload

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
        console.log(message)
        if (message === '') {
            message = 'No Additional Notes'
        }
        console.log(message)

        this.setState({
            submitProcessing: true,
            requestError: false,
        }, () => {
            this.props.firebase.validCoachRequest(
                email,
                this.props.firebase.auth.currentUser.uid
            )
                .then(res => {
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
            errorMsg,
            loading,
            view,
            currentCoachTableData
        } = this.state;
        console.log(currentCoachTableData)
        let loadingHTML =
            <Loader active inline='centered' content='Loading...' />

        let nonLoadingHTML =
            <>
                <div className="pageContainerLevel1 pageBodyContentMainHeader">
                    <div id='mainHeaderText'>
                        Manage Coaches
                    </div>
                </div>
                {
                    view !== 'home' &&
                    <div className='rowContainer clickableDiv'>
                        <Button
                            content='Back'
                            className='backButton-inverted'
                            circular
                            icon='arrow left'
                            onClick={() => {
                                this.setState({ view: 'home' })
                            }}
                        />
                    </div>
                }
                {
                    view === 'home' &&
                    < Card.Group className="two">
                        <div>
                            <Card onClick={() => { this.setState({ view: 'joinCoach' }) }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='file alternate outline' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header textAlign='center'>Join <br /> Coach</Card.Header>
                                </Card.Content>
                            </Card>
                        </div>
                        <div>
                            <Card onClick={() => { this.setState({ view: 'leaveCoach' }) }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='group' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header textAlign='center'>Leave <br /> Coach</Card.Header>
                                </Card.Content>
                            </Card>
                        </div>
                    </Card.Group>
                }
                {
                    view === 'joinCoach' &&
                    <div id='signInPageMainContainer'>
                        <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                            <InputLabel
                                text='Join A Coach'
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
                }
                {
                    view === 'leaveCoach' &&
                    <div id='signInPageMainContainer'>
                        <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                            <InputLabel
                                text='Leave A Coach'
                                custID='signInPageMainLabel'
                            />
                            <BasicTable
                                data={currentCoachTableData.data}
                                columns={currentCoachTableData.columns}
                            />
                        </div>
                    </div>
                }
            </>

        return (
            <NonLandingPageWrapper>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </NonLandingPageWrapper>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageCoachesPage)