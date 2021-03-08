import React from 'react'
import Navigation from '../Navigation'
import Footer from './footer'

const NonLandingPageWrapper = (props) => {
    return (
        <div id="nonLandingPageWrapper">
            <Navigation />
            <div id="nonLandingPageBodyContentWrapper">
                {props.children}
            </div>
            {/* <Footer /> */}
        </div>
    )
}

export default NonLandingPageWrapper