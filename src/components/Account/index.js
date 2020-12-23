import React, { Component } from 'react';

// import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';
import { withAuthorisation } from '../Session';
import { Dimmer, Loader, Card, Icon, Image } from 'semantic-ui-react'
import * as ROUTES from '../../constants/routes'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'

class AccountPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            username: '',
            email: '',
            loading: true,
            userType: ''
        }
    }
    async componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        // Creates reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).once('value', async userData => {
            var userObject = userData.val();

            // await this.props.firebase.userType(currUserUid).once('value', async userRole => {
            //     var role = userRole.val()

            if (!this.state.loading) {
                this.setState({
                    loading: true,
                }, () => {
                    // Format the user data based on whether or not user has current programs. 
                    this.updateObjectState(userObject)
                })
            } else {
                this.updateObjectState(userObject)
            }
            // })

        })
    }

    updateObjectState = (userObject, role) => {
        // Format the user data based on whether or not user has current programs. 
        this.setState({
            email: userObject.email,
            username: userObject.username,
            userType: userObject.userType,
            loading: false
        })
    }

    handleChangePasswordRedirect = () => {
        this.props.history.push(ROUTES.PASSWORD_CHANGE)
    }
    handleDeleteAccountRedirect = () => {
        this.props.history.push(ROUTES.DELETE_ACCOUNT)
    }

    handleJoinTeamRedirect = () => {
        this.props.history.push(ROUTES.JOIN_TEAM)

    }

    render() {

        const {
            username,
            email,
            loading,
            userType
        } = this.state

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className='pageContainerLevel1'>
                    <div id='accpUsernameHeader'>
                        {username}
                    </div>
                    <div id='accpUserDetailsHeader'>
                        Email: {email}
                    </div>
                </div>
                <div>
                    <div id='cardContainer'>
                        <Card.Group >
                            <div>

                                <Card onClick={() => { this.handleChangePasswordRedirect() }}>
                                    <Card.Content className='iconContent'>
                                        <Icon name='shield alternate' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>Password Change</Card.Header>
                                    </Card.Content>
                                </Card>
                            </div>
                            <div>
                                <Card onClick={() => { this.handleChangeEmailRedirect() }}>
                                    <Card.Content className='iconContent'>
                                        <Icon name='mail' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>Email <br /> Change</Card.Header>
                                    </Card.Content>
                                </Card>

                            </div>
                            <div>
                                <Card onClick={() => { this.handleDeleteAccountRedirect() }}>
                                    <Card.Content className='iconContent'>
                                        <Icon name='user delete' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>Delete <br /> Account</Card.Header>
                                    </Card.Content>
                                </Card>
                            </div>
                            {
                                userType === 'athlete' &&
                                <div>
                                    <Card onClick={() => { this.handleJoinTeamRedirect() }}>
                                        <Card.Content className='iconContent'>
                                            <Icon name='users' size='huge' />
                                        </Card.Content>
                                        <Card.Content>
                                            <Card.Header textAlign='center'>Join <br /> Team</Card.Header>
                                        </Card.Content>
                                    </Card>
                                </div>
                            }
                        </Card.Group>
                    </div>
                </div>
            </NonLandingPageWrapper>

        return (
            <div>
                { loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(AccountPage);