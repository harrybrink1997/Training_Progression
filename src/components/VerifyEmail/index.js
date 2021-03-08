import React, { Component } from 'react'

import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Button } from 'semantic-ui-react'
import { BPT } from '../CustomComponents/purpleText'

class VerifyEmailPage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: this.initSignUpEmail()
        }
    }

    initSignUpEmail = () => {
        if (window.localStorage.getItem('corvusEmailForSignIn')) {
            return window.localStorage.getItem('corvusEmailForSignIn')
        } else {
            return 'your email'
        }
    }

    render() {

        const {
            email
        } = this.state

        return (
            <NonLandingPageWrapper>
                <div id="fullPageForm">
                    <div id="fullPageFormMainHeader">Email Sent!</div>
                    <div id="fullPageFormContent">
                        An email has been sent to <BPT>{email}</BPT>. Please verify your email then click the sign in button to continue.
                    </div>
                    <div className="centred-info">
                        <Button
                            className="lightPurpleButton"
                            onClick={() => { this.props.history.push(ROUTES.SIGN_IN) }}
                        >
                            Continue to Sign In
                        </Button>
                    </div>
                </div>
            </NonLandingPageWrapper>
        )
    }

}

export default withFirebase(VerifyEmailPage);
