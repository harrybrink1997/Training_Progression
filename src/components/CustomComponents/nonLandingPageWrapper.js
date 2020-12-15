import React from 'react'
import Navigation from '../Navigation'

const NonLandingPageWrapper = (props) => {
    return (
        <div>
            <Navigation />
            {props.children}
        </div>
    )
}

export default NonLandingPageWrapper