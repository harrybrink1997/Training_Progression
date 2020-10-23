import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import CreateProgramModal from './createProgramModal'

class HomePage extends Component {

    constructor(props) {
        super(props)

        this.state = {

            userInformation: {},
            loading: true
        }
    }


    handleCreateProgram = (programName) => {
        this.props.firebase.createProgramUpstream(programName, this.state.userInformation.uid).then(() => {
            alert(`${programName} created.`)
        })

    }

    componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid

        this.props.firebase.getUserData(currUserUid).on('value', userData => {

            const userObject = userData.val();
            this.setState({
                userInformation: {
                    uid: currUserUid,
                    data: userObject
                },
                loading: false
            })
        });
    }



    componentWillUnmount() {
        this.props.firebase.getUserData().off();
        this.props.firebase.createProgramUpstream().off();
    }


    render() {
        return (

            < div >
                <CreateProgramModal handleFormSubmit={this.handleCreateProgram} />

            </div >
        )
    }

}




const condition = authUser => !!authUser;
export default withAuthorisation(condition)(HomePage);