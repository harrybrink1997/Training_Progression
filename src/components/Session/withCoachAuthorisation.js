import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const withCoachAuthorisation = condition => Component => {
    class withCoachAuthorisation extends React.Component {
        componentDidMount() {

            this.listener = this.props.firebase.auth.onAuthStateChanged(
                coachAuthUser => {
                    if (coachAuthUser) {
                        this.props.firebase.userType(coachAuthUser.uid).once('value', role => {
                            var roleVal = role.val()
                            if (!condition(roleVal)) {
                                this.props.history.push(ROUTES.LANDING)
                            }
                        })
                    } else {
                        this.props.history.push(ROUTES.LANDING)

                    }
                },
            );
        }

        componentWillUnmount() {
            this.listener();
        }

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser =>
                        condition(authUser) ? <Component {...this.props} /> : null
                    }
                </AuthUserContext.Consumer>
            );
        }
    }

    return compose(
        withRouter,
        withFirebase,
    )(withCoachAuthorisation);
};

export default withCoachAuthorisation;