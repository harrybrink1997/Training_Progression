import React, { Component } from 'react'

import { withAuthorisation } from '../Session';
import CreateProgramModal from './createProgramModal'
import DeleteProgramModal from './deleteProgramModal'
import CreateExerciseModal from './createExerciseModal'

import { Dimmer, Loader, Statistic } from 'semantic-ui-react'

class HomePage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            userInformation: {},
            currentProgramList: [],
            pastProgramList: [],
            greeting: '',
            anatomyObject: {},
            loading: true
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        this.props.firebase.getUserData(currUserUid).on('value', userData => {
            console.log("GOING IN ")
            const userObject = userData.val();

            this.props.firebase.anatomy().once('value', async snapshot => {

                const anatomyObject = snapshot.val();

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
                    greeting: this.getCurrentGreeting(userObject),
                    currentProgramList: currentProgramList,
                    pastProgramList: pastProgramList,
                    anatomyObject: anatomyObject,
                    loading: false
                })
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

    handleCreateProgram = async (programName, acutePeriod, chronicPeriod, loadingScheme, date, goalList) => {

        programName = programName.trim()

        if (this.checkIfProgramAlreadyExists(programName)) {
            alert('Program with name "' + programName + '" already exists in either your current or past programs.')
        } else {

            var goalListObject = {}
            var index = 1
            Object.values(goalList).forEach(goal => {
                goalListObject['Goal_' + index] = goal.getFormattedGoalObject()
                index++
            })

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
                goalListObject
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
        this.setState({
            loading: true
        }, async () => {
            await this.deletePastProgramsUpstream(pastPrograms)
            await this.deleteCurrentProgramsUpstream(currentPrograms)
        })

    }

    handleCreateExercise = async (exName, primMusc, secMusc, exDiff) => {
        var exData = {
            experience: exDiff,
            primary: primMusc,
            secondary: secMusc
        }

        // trim white space first. 
        exName = exName.trim()

        if (exName.split(' ').length > 0) {
            var nameArr = exName.split(' ')
            exName = []
            nameArr.forEach(word => {
                exName.push(word.charAt(0).toUpperCase() + word.slice(1))
            })

            console.log(exName)
            exName = exName.join('_')
        } else {
            exName = exName.charAt(0).toUpperCase() + exName.slice(1);
        }

        await this.props.firebase.localExerciseData(
            this.state.userInformation.uid
        ).once('value', snapshot => {

            const localExerciseObject = snapshot.val();

            this.props.firebase.exercises().once('value', snapshot => {
                const exerciseObject = snapshot.val();

                if (Object.keys(exerciseObject).includes(exName)) {
                    alert("Exercise Already Exists In The Main Exercise Storage")
                } else {
                    if (localExerciseObject != undefined) {
                        if (Object.keys(localExerciseObject).length > 5) {
                            alert("You have reached your limit of custom exercises, you cannot create anymore.")
                        } else if (Object.keys(localExerciseObject).includes(exName)) {
                            alert("Exercise Already Exists In Your Local Storage")
                        } else {
                            this.props.firebase.createNewExerciseReferenceUpstream(
                                this.state.userInformation.uid,
                                exName,
                                exData
                            )
                        }
                    } else {
                        this.props.firebase.createNewExerciseReferenceUpstream(
                            this.state.userInformation.uid,
                            exName,
                            exData
                        )
                    }
                }
            })
        })
    }

    componentWillUnmount() {
        this.props.firebase.getUserData().off();
    }

    getCurrentGreeting = (userInformation) => {
        var currTime = new Date().toLocaleTimeString()
        var name = userInformation.username.split(" ")[0]
        if (parseInt(currTime.split(":")[0]) < 12) {
            return "Good Morning" + " " + name
        } else {
            console.log(currTime)
            if (parseInt(currTime.split(":")[0]) < 17) {
                return "Good Afternoon" + " " + name
            } else {
                return "Good Evening" + " " + name
            }
        }

    }

    render() {

        const {
            pastProgramList,
            currentProgramList,
            userInformation,
            loading,
            greeting,
            anatomyObject
        } = this.state

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <div>
                <div className="pageContainerLevel1">
                    <div id='mainContainerHeaderDiv'>
                        <div id='mainHeaderText'>
                            {
                                greeting
                            }
                        </div>
                        <div id='hpBtnContainer' >
                            <div id='hpLeftBtnContainer'>
                                <DeleteProgramModal
                                    handleFormSubmit={this.handleDeleteProgram}
                                    currentProgramList={currentProgramList}
                                    pastProgramList={pastProgramList}
                                />
                            </div>
                            <div id='hpMidBtnContainer'>
                                <CreateProgramModal handleFormSubmit={this.handleCreateProgram} />

                            </div>
                            <div id='hpRightBtnContainer'>
                                <CreateExerciseModal
                                    handleFormSubmit={this.handleCreateExercise}
                                    anatomyObject={anatomyObject}
                                />
                            </div>

                        </div>
                    </div>
                    {/* <div id='hpStatHeaderContainer'>
                        <Statistic className='hpStatHeaderSC1' inverted size='tiny'>
                            <Statistic.Value>22</Statistic.Value>
                            <Statistic.Label>Faves</Statistic.Label>
                        </Statistic>
                        <Statistic className='hpStatHeaderSC2' inverted size='tiny'>
                            <Statistic.Value>22</Statistic.Value>
                            <Statistic.Label>Number of Programs</Statistic.Label>
                        </Statistic>
                        <Statistic className='hpStatHeaderSC3' inverted size='tiny'>
                            <Statistic.Value>22</Statistic.Value>
                            <Statistic.Label>Faves</Statistic.Label>
                        </Statistic>
                    </div> */}
                </div>
            </div>



        console.log(userInformation)
        return (
            <div>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }

}




const condition = authUser => !!authUser;
export default withAuthorisation(condition)(HomePage);