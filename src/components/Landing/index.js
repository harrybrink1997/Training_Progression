import React, { Component } from 'react'
import { Button, Header } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import Navigation from '../Navigation';
import { withFirebase } from '../Firebase';
import { withAuthentication } from '../Session';

class LandingPage extends Component {

    constructor(props) {
        super(props)
    }

    handleSignInButton = () => {

        if (this.props.firebase.isAuthenticatedUser == undefined) {
            this.props.history.push(ROUTES.SIGN_IN)
        } else {
            this.props.history.push(ROUTES.HOME)
        }

    }

    handleLearnMoreButton = () => {
        this.props.history.push(ROUTES.LEARN_MORE)
    }

    render() {

        return (
            <LandingPageCTAContainer
                handleSignInButton={this.handleSignInButton}
                handleLearnMoreButton={this.handleLearnMoreButton}
            />
        )
    }
}

const LandingPageCTAContainer = ({ handleSignInButton, handleLearnMoreButton }) => {

    return (
        <div id='mountainPicture'>
            <Navigation custClass='landingPageNav' />
            <div id='landingPageHeaderContainer'>
                <div id='CTAContainerHeaderDiv'>
                    <div id='corvusStrengthHeader'>
                        Corvus Strength
                    </div>
                    <div id='CTA4THeader'>
                        Train, Track, Triumph, Together
                    </div>
                    <div id='CTAImpactStatement'>
                        Scientifically Based Cloud Platform to Manage Training Load and Help Reduce Injury.
                    </div>
                </div>

                <div id='CTAContainerButtonDiv'>
                    <div id='lpSignUpBtn'>
                        <Button
                            className='purpleButton'
                            onClick={handleSignInButton}
                        >
                            Sign In
                    </Button>
                    </div>
                    <div id='lpLearnMoreBtn'>
                        <Button
                            className='lightPurpleButton-inverted'
                            onClick={handleLearnMoreButton}
                        >
                            Learn More
                    </Button>
                    </div>
                </div>
            </div>
        </div >

    )
}

export default withFirebase(LandingPage);