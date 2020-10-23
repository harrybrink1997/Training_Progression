import React, { Component } from 'react'

import { withAuthorisation } from '../Session';

import CurrentProgramDropdown from './currentProgramsDropdown'


class CurrentProgramPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            programList: [],
            loading: true
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid

        this.props.firebase.getUserData(currUserUid).on('value', userData => {

            const userObject = userData.val();
            if ('currentPrograms' in userObject) {
                Object.keys(userObject.currentPrograms).forEach(key => {
                    this.setState({
                        programList: [...this.state.programList, key]
                    })
                })
            } else {
                this.setState({
                    programList: ['No Current Programs']
                })
            }
        });

        this.render()
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
    }


    render() {
        return (
            <CurrentProgramDropdown programList={this.state.programList} />
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(CurrentProgramPage)