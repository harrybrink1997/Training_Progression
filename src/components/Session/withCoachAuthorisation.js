import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const withCoachAuthorisation = condition => Component => {
    class withCoachAuthorisation extends React.Component {

        constructor(props) {
            super(props)

            this.state = {
                isCoach: false
            }
        }

        componentDidMount() {
            this.setState({ isMounted: true }, () => {
                this.listener = this.props.firebase.auth.onAuthStateChanged(
                    coachAuthUser => {
                        if (coachAuthUser) {
                            this.props.firebase.auth.currentUser.getIdTokenResult()
                                .then(adminToken => {
                                    if (this.state.isMounted) {
                                        if (!condition(adminToken.claims.userType)) {
                                            this.props.history.push(ROUTES.LANDING)
                                        } else {
                                            this.setState({
                                                isCoach: true
                                            })
                                        }
                                    }
                                })
                        } else {
                            this.props.history.push(ROUTES.LANDING)
                        }
                    },
                );
            })
        }

        componentWillUnmount() {
            this.setState({ isMounted: false })
            this.listener();
        }

        render() {

            return (
                <AuthUserContext.Consumer>
                    {
                        isCoach => {
                            return (
                                isCoach ? <Component {...this.props} /> : null
                            )
                        }
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