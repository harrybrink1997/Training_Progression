import React, { Component } from 'react'
import { Button, Header } from 'semantic-ui-react'

class LandingPage extends Component {

    render() {

        return (
            <LandingPageCTAContainer />
        )
    }
}

const LandingPageCTAContainer = () => {
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
                        className='purpleButton'>
                        Sign Up
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

export default LandingPage;