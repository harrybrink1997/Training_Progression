import React, { Component } from 'react';

import { withAuthorisation } from '../Session';

import ProgramListDropdown from '../CustomComponents/programListDropdown'



import { Dimmer, Header, Loader } from 'semantic-ui-react'

// Import Custom Functions
import loadingSchemeString from '../../constants/loadingSchemeString'



class PastProgramsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            activeProgram: '',
            programList: [],
            allPrograms: [],
            durationOfProgram: '',
            loadingScheme: '',
            hasPrograms: false,
            currentBodyPart: 'Chest',
        }
    }

    async componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        // Creates a reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).on('value', userData => {
            var userObject = userData.val();
            if (!this.state.loading) {
                this.setState({
                    loading: true
                }, () => {
                    console.log(userObject)
                    // Format the user data based on whether or not user has current programs. 
                    this.updateObjectState(userObject)
                })
            } else {
                this.updateObjectState(userObject)
            }
        })
    }

    updateObjectState = (userObject) => {

        if ('pastPrograms' in userObject) {

            var programListArray = []

            Object.keys(userObject.pastPrograms).forEach(key => {
                programListArray.push(key)
            })
            // Initially Sets the state for the current day
            // and current week and other parameters. 
            var bodyPartsArray = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Total']
            console.log(programListArray)
            this.setState({
                programList: programListArray,
                hasPrograms: true,
                allPrograms: userObject.pastPrograms,
                activeProgram: programListArray[0],
                durationOfProgram: Math.ceil(userObject.pastPrograms[programListArray[0]].currentDayInProgram / 7),
                loadingScheme: userObject.pastPrograms[programListArray[0]].loading_scheme,
                bodyPartsList: bodyPartsArray,
                loading: false,
            })
        } else {
            this.setState({
                programList: ['No Past Programs'],
                activeProgram: '',
                loading: false
            })
        }
    }

    handleSelectProgram = (event, { value }) => {

        if (this.state.activeProgram != value) {
            this.setState({
                activeProgram: value
            })
        }
    }

    render() {

        const {
            loadingScheme,
            activeProgram,
            hasPrograms,
            loading,
            durationOfProgram,
            programList,
        } = this.state
        console.log(this.state)
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>
        let noCurrentProgramsHTML = <Header as='h1'>No Past Programs to Show... <br /> Close off a program before this becomes usable. </Header>
        let hasCurrentProgramsHTML =
            <div>
                <div className='pageContainerLevel1'>
                    <div id='ppProgramHeader'>
                        {activeProgram}
                    </div>
                    <div id='ppWeekHeader'>
                        Program Duration: {durationOfProgram + ((durationOfProgram == 1) ? ' Week' : ' Weeks')}
                    </div>
                    <div id='ppSchemeHeader'>
                        Loading Scheme: {loadingSchemeString(loadingScheme)}
                    </div>

                    <div id='ppCurrentProgramHeader'>
                        <ProgramListDropdown
                            programList={programList}
                            activeProgram={activeProgram}
                            buttonHandler={this.handleSelectProgram}
                            headerText='Past Programs'
                        />

                    </div>
                </div>
            </div>


        return (
            <div>
                {loading && loadingHTML}
                {!hasPrograms && !loading && noCurrentProgramsHTML}
                {hasPrograms && !loading && hasCurrentProgramsHTML}
            </div >
        );
    }
}





const condition = authUser => !!authUser;
export default withAuthorisation(condition)(PastProgramsPage);