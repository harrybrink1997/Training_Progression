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
                currentProgramList = false
            }

            // Make the list of past programs.
            if ('pastPrograms' in userObject) {
                var pastProgramList = []

                for (program in userObject.pastPrograms) {
                    pastProgramList.push(program)
                }
            } else {
                pastProgramList = false
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

    checkIfProgramAlreadyExists(newProgram) {

        if (this.state.currentProgramList.length > 0) {
            for (var program in this.state.currentProgramList) {
                if (this.state.currentProgramList[program] == newProgram) {
                    return true
                }
            }
        }

        if (this.state.pastProgramList.length > 0) {
            for (program in this.state.pastProgramList) {
                if (this.state.pastProgramList[program] == newProgram) {
                    return true
                }
            }
        }

        return false

    }

    handleCreateProgram = async (programName, acutePeriod, chronicPeriod, loadingScheme, date) => {

        programName = programName.trim()

        if (this.checkIfProgramAlreadyExists(programName)) {
            alert('Program with name "' + programName + '" already exists in either your current or past programs.')
        } else {
            var dateConversion = date.split('-')

            dateConversion = dateConversion[2] + '-' + dateConversion[1] + '-' + dateConversion[0]

            var startTimestamp = Math.floor(new Date(dateConversion).getTime())

            await this.props.firebase.createProgramUpstream(
                this.state.userInformation.uid,
                programName,
                acutePeriod,
                chronicPeriod,
                loadingScheme,
                startTimestamp,
            )

            this.props.firebase.setActiveProgram(
                this.state.userInformation.uid,
                programName
            )
        }
    }


    deleteCurrentProgramsUpstream = async (list) => {
        if (list.length == 0) {
            return
        } else {
            if (!(list.includes(this.state.userInformation.data.activeProgram))) {

                list.forEach(program => {
                    this.props.firebase.deleteCurrentProgramUpstream(
                        this.props.firebase.auth.currentUser.uid,
                        program
                    )
                })
            } else {
                var activeProgram = ''
                var currProgList = this.state.currentProgramList

                for (var program in currProgList) {
                    if (!(list.includes(currProgList[program]))) {
                        activeProgram = currProgList[program]
                        break
                    }
                }

                await this.props.firebase.setActiveProgram(
                    this.props.firebase.auth.currentUser.uid,
                    activeProgram
                )

                list.forEach(program => {
                    this.props.firebase.deleteCurrentProgramUpstream(
                        this.props.firebase.auth.currentUser.uid,
                        program
                    )
                })
            }
        }
    }

    deletePastProgramsUpstream = async (list) => {
        if (list.length == 0) {
            return
        } else {
            list.forEach(program => {
                this.props.firebase.deletePastProgramUpstream(
                    this.props.firebase.auth.currentUser.uid,
                    program
                )
            })
        }
    }

    handleDeleteProgram = (currentPrograms, pastPrograms) => {
        console.log("deleted")
        this.setState({
            loading: true
        }, async () => {
            await this.deletePastProgramsUpstream(pastPrograms)
            await this.deleteCurrentProgramsUpstream(currentPrograms)
        })

    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
        this.props.firebase.createProgramUpstream().off();
    }


    render() {

        const {
            pastProgramList,
            currentProgramList,
            userInformation
        } = this.state

        console.log(userInformation)
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