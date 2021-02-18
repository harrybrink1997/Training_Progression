import React, { Component } from 'react'

import { withAuthorisation } from '../Session';

import CreateExerciseModal from './createExerciseModal'

import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import CoachTeamAthleteDataContainer from './coachTeamAthleteDataContainer'
import { AcceptRequestButton, DeclineRequestButton } from '../CustomComponents/customButtons'

import OnBoarding from './onBoarding'

import { Dimmer, Loader, Card, Icon } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput';
import * as ROUTES from '../../constants/routes'
import { createUserObject } from '../../objects/user'


class HomePage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            userInformation: {},
            // currentProgramList: [],
            // pastProgramList: [],
            greeting: '',
            anatomyObject: {},
            loading: true,
            userType: '',
            firstTimeUser: false,
            coachTeamAthleteData: {
                hasTeamData: false,
                teamData: undefined,
                athleteData: undefined,
                requestData: undefined
            }
        }
    }

    componentDidMount() {
        this.setState({ loading: true }, () => {
            this.props.firebase.getUser(this.props.firebase.auth.currentUser.uid)
                .then(snapshot => {
                    var userInfo = snapshot.data()

                    var user = createUserObject(
                        this.props.firebase.auth.currentUser.uid,
                        userInfo
                    )

                    this.setState({
                        user: user,
                        greeting: this.getCurrentGreeting(user.getUsername()),
                        firstTimeUser: this.determineFirstTimeLogin(this.props.firebase.auth.currentUser.metadata), //TODO FIX THIS lol
                        loading: false,
                    })

                    console.log(user)
                })
                .catch(error => {
                    console.log(error)
                })
        });
    }

    handlePendingTeamRequestAcceptence = (athleteUID, accepted) => {
        console.log(athleteUID)
        console.log(accepted)
        var payLoad = {}

        var coachPendingPath = `users/${this.props.firebase.auth.currentUser.uid}/teamRequests/${athleteUID}`

        if (accepted) {
            var coachPath = `users/${this.props.firebase.auth.currentUser.uid}/currentAthletes/${athleteUID}`
            var athletePath = `users/${athleteUID}/teams/${this.props.firebase.auth.currentUser.uid}`
            this.props.firebase.getUserData(athleteUID).once('value', snapshot => {
                var athleteData = snapshot.val()

                var joinDate = new Date().getTime()

                payLoad[coachPath] = {
                    email: athleteData.email,
                    username: athleteData.username,
                    joinDate: joinDate
                }

                payLoad[athletePath] = {
                    email: this.state.userInformation.data.email,
                    username: this.state.userInformation.data.username,
                    joinDate: joinDate
                }

                payLoad[coachPendingPath] = null

                this.props.firebase.acceptTeamRequestUpstream(payLoad)
                console.log(payLoad)
            })
        } else {
            payLoad[coachPendingPath] = null

            this.props.firebase.acceptTeamRequestUpstream(payLoad)
        }
    }

    initTeamData = (userObject) => {
        var payLoad = {
            hasTeamData: false
        }
        // This might need to change.
        if (userObject.teamRequests !== undefined || userObject.teams !== undefined || userObject.currentAthletes !== undefined) {
            payLoad.hasTeamData = true
        } else {
            return payLoad
        }

        if (userObject.userType === 'coach') {
            // Get the current requests for the coach.
            if (userObject.teamRequests !== undefined) {

                var requestData = []
                Object.keys(userObject.teamRequests).forEach(request => {
                    requestData.push({
                        username: userObject.teamRequests[request].username,
                        notes: userObject.teamRequests[request].message,
                        athleteUID: request,
                        email: userObject.teamRequests[request].email,
                        buttons:
                            <div>
                                <AcceptRequestButton buttonHandler={this.handlePendingTeamRequestAcceptence} objectUID={request} />
                                <DeclineRequestButton buttonHandler={this.handlePendingTeamRequestAcceptence} objectUID={request} />
                            </div>

                    })
                })
                payLoad.requestData = requestData
            } else {
                payLoad.requestData = undefined
            }

            // Get the current athletes for the coach.
            if (userObject.currentAthletes !== undefined) {

                var athleteData = []
                Object.keys(userObject.currentAthletes).forEach(athlete => {
                    athleteData.push({
                        username: userObject.currentAthletes[athlete].username,
                        notes: userObject.currentAthletes[athlete].message,
                        athleteUID: athlete,
                        email: userObject.currentAthletes[athlete].email,
                        buttons:
                            <div>
                                <AcceptRequestButton buttonHandler={this.handlePendingTeamRequestAcceptence} athleteUID={athlete} />
                                <DeclineRequestButton buttonHandler={this.handlePendingTeamRequestAcceptence} athleteUID={athlete} />
                            </div>

                    })
                })
                payLoad.athleteData = athleteData
            } else {
                payLoad.athleteData = undefined
            }
        }
        console.log(payLoad)
        return payLoad
    }

    determineFirstTimeLogin = (metadata) => {
        var creationTime = metadata.creationTime
        var loginTime = metadata.lastSignInTime

        if (loginTime === creationTime) {
            return true
        } else {
            return false
        }
    }

    handleManageAthletesRedirect = () => {
        this.props.history.push(ROUTES.MANAGE_ATHLETES)
    }

    handleManageTeamsRedirect = () => {
        if (this.state.user.getUserType() === 'athlete') {
            this.props.history.push(ROUTES.MANAGE_ATHLETE_TEAMS)
        } else {
            this.props.history.push(ROUTES.MANAGE_COACH_TEAMS)
        }
    }

    handleManageProgramsRedirect = () => {
        this.props.history.push(ROUTES.MANAGE_PROGRAMS)
    }

    handleCreateExercise = async (exName, primMusc, secMusc, exDiff) => {
        var exData = {
            experience: exDiff,
            primary: primMusc,
            secondary: secMusc
        }

        // trim white space first. 
        exName = exName.trim()

        if (exName.split(' ').length > 0) {
            var nameArr = exName.split(' ')
            exName = []
            nameArr.forEach(word => {
                exName.push(word.charAt(0).toUpperCase() + word.slice(1))
            })

            console.log(exName)
            exName = exName.join('_')
        } else {
            exName = exName.charAt(0).toUpperCase() + exName.slice(1);
        }

        await this.props.firebase.localExerciseData(
            this.state.userInformation.uid
        ).once('value', snapshot => {

            const localExerciseObject = snapshot.val();

            this.props.firebase.exercises().once('value', snapshot => {
                const exerciseObject = snapshot.val();

                if (Object.keys(exerciseObject).includes(exName)) {
                    alert("Exercise Already Exists In The Main Exercise Storage")
                } else {
                    if (localExerciseObject != undefined) {
                        if (Object.keys(localExerciseObject).length > 5) {
                            alert("You have reached your limit of custom exercises, you cannot create anymore.")
                        } else if (Object.keys(localExerciseObject).includes(exName)) {
                            alert("Exercise Already Exists In Your Local Storage")
                        } else {
                            this.props.firebase.createNewExerciseReferenceUpstream(
                                this.state.userInformation.uid,
                                exName,
                                exData
                            )
                        }
                    } else {
                        this.props.firebase.createNewExerciseReferenceUpstream(
                            this.state.userInformation.uid,
                            exName,
                            exData
                        )
                    }
                }
            })
        })
    }

    getCurrentGreeting = (username) => {
        var currTime = new Date().toLocaleTimeString()
        var name = username.split(" ")[0]
        if (parseInt(currTime.split(":")[0]) < 12) {
            return "Good Morning" + " " + name
        } else {
            console.log(currTime)
            if (parseInt(currTime.split(":")[0]) < 17) {
                return "Good Afternoon" + " " + name
            } else {
                return "Good Evening" + " " + name
            }
        }

    }

    render() {

        const {
            // pastProgramList,
            // currentProgramList,
            loading,
            greeting,
            firstTimeUser,
        } = this.state
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    <OnBoarding
                        run={firstTimeUser}
                    />
                    <div id='mainContainerHeaderDiv'>
                        <div id='mainHeaderText'>
                            {
                                greeting
                            }
                        </div>
                        {/* <div id='hpBtnContainer' >
                            <div id='hpRightBtnContainer'>
                                <CreateExerciseModal
                                    handleFormSubmit={this.handleCreateExercise}
                                    anatomyObject={anatomyObject}
                                />
                            </div>

                        </div> */}
                    </div>
                </div>
                <div id='programAssignmentCardGroupContainer'>
                    <Card.Group>
                        <div>
                            <Card onClick={() => { this.handleManageProgramsRedirect() }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='file alternate outline' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header textAlign='center'>My <br /> Programs</Card.Header>
                                </Card.Content>
                            </Card>
                        </div>
                        <div>
                            <Card onClick={() => { this.handleManageTeamsRedirect() }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='group' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header textAlign='center'>My <br /> Teams</Card.Header>
                                </Card.Content>
                            </Card>
                        </div>
                    </Card.Group>
                </div>

            </NonLandingPageWrapper>

        return (
            <div>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }

}




const condition = authUser => !!authUser;
export default withAuthorisation(condition)(HomePage);