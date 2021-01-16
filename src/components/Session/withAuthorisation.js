import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const withAuthorisation = condition => Component => {
    class withAuthorisation extends React.Component {

        constructor(props) {
            super(props)
        }

        componentDidMount() {
            this.setState({ isMounted: true }, () => {
                this.listener = this.props.firebase.auth.onAuthStateChanged(
                    authUser => {
                        if (this.state.isMounted) {
                            if (!condition(authUser)) {
                                this.props.history.push(ROUTES.SIGN_IN);
                            }
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
    )(withAuthorisation);
};

export default withAuthorisation;