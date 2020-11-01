import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import CreateProgramModal from './createProgramModal'
import DeleteProgramModal from './deleteProgramModal'

class HomePage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            userInformation: {},
            currentProgramList: [],
            pastProgramList: [],
            loading: true
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid

        this.props.firebase.getUserData(currUserUid).on('value', userData => {

            const userObject = userData.val();
            console.log(userObject)
            // Make the list of current programs.

            if ('currentPrograms' in userObject) {
                var currentProgramList = []

                for (var program in userObject.currentPrograms) {
                    currentProgramList.push(program)
                }
            } else {
                var currentProgramList = false
            }

            // Make the list of past programs.
            if ('pastPrograms' in userObject) {
                var pastProgramList = []

                for (var program in userObject.pastPrograms) {
                    pastProgramList.push(program)
                }
            } else {
                var pastProgramList = false
            }


            this.setState({
                userInformation: {
                    uid: currUserUid,
                    data: userObject
                },
                currentProgramList: currentProgramList,
                pastProgramList: pastProgramList,
                loading: false
            })
        });
    }


    handleCreateProgram = (programName, scheme) => {
        this.props.firebase.createProgramUpstream(this.state.userInformation.uid, programName, scheme).then(() => {
            alert(`${programName} created.`)
        }).then(() => {
            this.props.firebase.setActiveProgram(
                this.state.userInformation.uid,
                programName
            )
            this.props.firebase.setCurrentDay(
                this.state.userInformation.uid,
                programName,
                '1'
            )
        })

    }

    handleDeleteProgram = (value) => {
        console.log("deleted")
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
        this.props.firebase.createProgramUpstream().off();
    }


    render() {

        const {
            pastProgramList,
            currentProgramList
        } = this.state

        console.log(pastProgramList)
        console.log(currentProgramList)

        return (

            < div >
                <CreateProgramModal handleFormSubmit={this.handleCreateProgram} />
                <DeleteProgramModal
                    handleFormSubmit={this.handleDeleteProgram}
                    currentProgramList={currentProgramList}
                    pastProgramList={pastProgramList}
                />
            </div >
        )
    }

}




const condition = authUser => !!authUser;
export default withAuthorisation(condition)(HomePage);