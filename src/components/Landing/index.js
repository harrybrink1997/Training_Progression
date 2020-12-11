import React, { Component } from 'react'
import { Button, Header } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'

class LandingPage extends Component {

    handleSignInButton = () => {
        this.props.history.push(ROUTES.SIGN_IN)

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
        <div className="pageContainerLevel1">
            <div id='CTAContainerHeaderDiv'>
                <div id='CTA4THeader'>
                    Train, Track, Triumph, Together
                </div>
                <div id='CTAImpactStatement'>
                    Scientifically Based, Cloud Platform to Manage Training Load and Help Reduce Injury.
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
    )
}

export default withRouter(LandingPage);