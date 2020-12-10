import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'

import SignUpForm from './signUpForm'
import InputLabel from '../CustomComponents/DarkModeInput'

class SignUpPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            signUpError: null
        };
    }

    handleClickSignUp = () => {
        this.props.history.push(ROUTES.SIGN_UP)
    }

    handleSubmitSignUp = (username, email, password) => {
        console.log(username)
        console.log(password)
        console.log(email)
        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, password)
            .then(authUser => {
                // Create a user in your Firebase realtime database
                return this.props.firebase.createUserUpstream(
                    authUser.user.uid,
                    {
                        username: username,
                        email: email,
                    })
            })
            .then(() => {
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                this.setState({
                    signUpError: error
                });
            });


    }

    render() {
        const {
            signUpError
        } = this.state;


        return (
            <div id='signInPageMainContainer'>
                <div id='signInEmailMainContainer' className='pageContainerLevel1'>
                    <InputLabel
                        text='Corvus Sign Up'
                        custID='signInPageMainLabel'
                    />
                    <SignUpForm
                        submitSignUpHandler={this.handleSubmitSignUp}
                    />
                    <div id='signInEmailFooterMessagesContainer'>
                        {signUpError && <p>{signUpError.message}</p>}
                    </div>
                </div>
            </div>
        )
    }
}

// class SignUpFormBase extends Component {
//     constructor(props) {
//         super(props);

//         this.state = { ...INITIAL_STATE };
//     }

//     onSubmit = (event) => {
//         const { username, email, passwordOne } = this.state;

// this.props.firebase
//     .doCreateUserWithEmailAndPassword(email, passwordOne)
//     .then(authUser => {
//         // Create a user in your Firebase realtime database
//         return this.props.firebase.createUserUpstream(
//             authUser.user.uid,
//             {
//                 username: username,
//                 email: email,
//             })
//     })
//     .then(() => {
//         this.setState({ ...INITIAL_STATE });
//         this.props.history.push(ROUTES.HOME);
//     })
//     .catch(error => {
//         this.setState({ error });
//     });

//         event.preventDefault();
//     }

//     onChange = (event) => {
//         this.setState({ [event.target.name]: event.target.value })
//     }

//     render() {

//         const {
//             username,
//             email,
//             passwordOne,
//             passwordTwo,
//             error
//         } = this.state;

//         const isInvalid = passwordOne !== passwordTwo || passwordOne === '' || email === '' || username === '';

//         return (
//             <form onSubmit={this.onSubmit}>
//                 <input
//                     name="username"
//                     value={username}
//                     onChange={this.onChange}
//                     type="text"
//                     placeholder="Full Name"
//                 />
//                 <input
//                     name="email"
//                     value={email}
//                     onChange={this.onChange}
//                     type="text"
//                     placeholder="Email Address"
//                 />
//                 <input
//                     name="passwordOne"
//                     value={passwordOne}
//                     onChange={this.onChange}
//                     type="password"
//                     placeholder="Password"
//                 />
//                 <input
//                     name="passwordTwo"
//                     value={passwordTwo}
//                     onChange={this.onChange}
//                     type="password"
//                     placeholder="Confirm Password"
//                 />
//                 <button disabled={isInvalid} type="submit">Sign Up</button>

//                 {error && <p>{error.message}</p>}
//             </form>
//         );
//     }
// }

// const SignUpForm = compose(
//     withRouter,
//     withFirebase
// )(SignUpFormBase);

export default withFirebase(SignUpPage);