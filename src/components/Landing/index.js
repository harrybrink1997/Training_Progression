import React, { Component } from 'react'
import { Button, Header } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'

class LandingPage extends Component {

    handleSignInButton = () => {
        this.props.history.push('/signin')

    }

    render() {

        return (
            <LandingPageCTAContainer
                handleSignInButton={this.handleSignInButton} />
        )
    }
}

const LandingPageCTAContainer = ({ handleSignInButton }) => {

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
                        className='lightPurpleButton-inverted'>
                        Learn More
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default withRouter(LandingPage);