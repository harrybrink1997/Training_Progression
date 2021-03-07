import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { AcceptRequestButton, DeclineRequestButton } from '../CustomComponents/customButtons'

import OnBoarding from './onBoarding'

import { Dimmer, Loader, Card, Icon } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput';
import * as ROUTES from '../../constants/routes'
import { createUserObject } from '../../objects/user'
import CoachRequestModal from './coachRequestModal';


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
                    if (user.getUserType() !== 'coach') {
                        this.setState({
                            user: user,
                            greeting: this.getCurrentGreeting(user.getUsername()),
                            firstTimeUser: this.determineFirstTimeLogin(this.props.firebase.auth.currentUser.metadata), //TODO FIX THIS lol
                            loading: false,
                        })
                    } else {
                        this.props.firebase.getCoachRequestData(
                            this.props.firebase.auth.currentUser.uid,
                            'coachUID'
                        )
                            .then(requests => {
                                console.log(requests)
                                if (requests.length === 0) {
                                    this.setState({
                                        user: user,
                                        greeting: this.getCurrentGreeting(user.getUsername()),
                                        firstTimeUser: this.determineFirstTimeLogin(this.props.firebase.auth.currentUser.metadata), //TODO FIX THIS lol
                                        loading: false,
                                    })
                                } else {
                                    this.setState({
                                        user: user,
                                        greeting: this.getCurrentGreeting(user.getUsername()),
                                        firstTimeUser: this.determineFirstTimeLogin(this.props.firebase.auth.currentUser.metadata), //TODO FIX THIS lol
                                        coachRequestTableData: this.initCoachRequestTableData(requests),
                                        loading: false,
                                    })
                                }
                            })
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        });
    }


    initCoachRequestTableData = (requestDocs) => {
        var payload = []
        console.log("gonig in right function")
        console.log(requestDocs)
        requestDocs.forEach(requestData => {
            const athleteData = {
                username: requestData.athleteUsername,
                athleteUID: requestData.athleteUID,
                email: requestData.athleteEmail
            }
            payload.push({
                username: requestData.athleteUsername,
                notes: requestData.message,
                athleteUID: requestData.athleteUID,
                email: requestData.athleteEmail,
                buttons:
                    <div>
                        <AcceptRequestButton buttonHandler={this.handlePendingTeamRequestAcceptence} objectUID={athleteData} />
                        <DeclineRequestButton buttonHandler={this.handlePendingTeamRequestAcceptence} objectUID={athleteData} />
                    </div>

            })
        })

        return payload
    }

    handlePendingTeamRequestAcceptence = (athlete, accepted) => {
        console.log(athlete)
        console.log(accepted)
        var payload = {
            coachUID: this.state.user.getID(),
            athleteUID: athlete.athleteUID,
            joiningDate: new Date().getTime()
        }

        this.props.firebase.createCurrentCoachAthlete(
            this.state.user.getID(),
            athlete.athleteUID,
            payload
        )
            .then(res => {
                let newCoachRequests = [...this.state.coachRequestTableData]

                if (newCoachRequests.length === 1) {
                    this.setState({
                        coachRequestTableData: undefined
                    })
                } else {
                    for (var i in newCoachRequests) {
                        if (newCoachRequests[i].athleteUID === athlete.athleteUID) {
                            newCoachRequests.splice(i, 1)
                            break
                        }
                    }

                    this.setState({
                        coachRequestTableData: newCoachRequests
                    })
                }

            })
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

    handleExercisesRedirect = () => {
        this.props.history.push(ROUTES.MANAGE_EXERCISES)

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
            user,
            loading,
            greeting,
            firstTimeUser,
            coachRequestTableData
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
                        {
                            coachRequestTableData &&
                            <div className="centred-info">
                                <CoachRequestModal
                                    requestTableData={coachRequestTableData}
                                />
                            </div>
                        }
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
                        {
                            user && user.getUserType() === 'coach' &&
                            <div>
                                <Card onClick={() => { this.handleManageAthletesRedirect() }}>
                                    <Card.Content className='iconContent'>
                                        <Icon name='group' size='huge' />
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Header textAlign='center'>My <br /> Athletes</Card.Header>
                                    </Card.Content>
                                </Card>
                            </div>
                        }
                        <div>
                            <Card onClick={() => { this.handleExercisesRedirect() }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='group' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header textAlign='center'>My <br /> Exercises</Card.Header>
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