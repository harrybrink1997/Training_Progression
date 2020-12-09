import React, { Component } from 'react';

import { withAuthorisation } from '../Session';

import ProgramListDropdown from '../CustomComponents/programListDropdown'



import { Dimmer, Header, Loader } from 'semantic-ui-react'

// Import Internal Components
import { GeneralInfoTable } from './generalInfoTable'
import LoadInfoTable from './loadInfoTable'
import InputLabel from '../CustomComponents/DarkModeInput'
import BodyPartListGroup from '../CustomComponents/bodyPartListGroup'
import FinalProgramNotes from './finalProgramNotes'

// Import Custom Functions
import loadingSchemeString from '../../constants/loadingSchemeString'
import utsToDateString from '../../constants/utsToDateString'
import { compositionDependencies } from 'mathjs';



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
            currentBodyPart: 'Overall_Total',
            currMuscleGroupOpen: 'Arms',
            programNotes: ''
        }
    }

    async componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        // Creates a reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).once('value', userData => {
            var userObject = userData.val();
            this.props.firebase.anatomy().once('value', async snapshot => {

                const anatomyObject = snapshot.val();
                if (!this.state.loading) {
                    this.setState({
                        loading: true
                    }, () => {
                        console.log(userObject)
                        // Format the user data based on whether or not user has current programs. 
                        this.updateObjectState(userObject, anatomyObject)
                    })
                } else {
                    this.updateObjectState(userObject, anatomyObject)
                }
            })
        })
    }

    updateObjectState = (userObject, anatomyObject) => {

        if ('pastPrograms' in userObject) {

            var programListArray = []

            Object.keys(userObject.pastPrograms).forEach(key => {
                programListArray.push(key)
            })
            // Initially Sets the state for the current day
            // and current week and other parameters. 

            console.log(programListArray)
            this.setState({
                programList: programListArray,
                hasPrograms: true,
                activeProgram: programListArray[0],
                allPrograms: userObject.pastPrograms,
                durationOfProgram: Math.ceil((userObject.pastPrograms[programListArray[0]].currentDayInProgram - 1) / 7),
                loadingScheme: userObject.pastPrograms[programListArray[0]].loading_scheme,
                startDate: utsToDateString(userObject.pastPrograms[programListArray[0]].startDayUTS),
                endDate: utsToDateString(userObject.pastPrograms[programListArray[0]].endDayUTS),
                anatomyObject: anatomyObject,
                programNotes: userObject.pastPrograms[programListArray[0]].notes,
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

        console.log(this.state.allPrograms[value].notes)

        if (this.state.activeProgram != value) {
            this.setState({
                activeProgram: value,
                startDate: utsToDateString(this.state.allPrograms[value].startDayUTS),
                endDate: utsToDateString(this.state.allPrograms[value].endDayUTS),
                durationOfProgram: Math.ceil((this.state.allPrograms[value].currentDayInProgram - 1) / 7),
                programNotes: (this.state.allPrograms[value].notes != undefined) ? this.state.allPrograms[value].notes : ''

            })
        }
    }

    handleSelectBodyPart = (value) => {
        this.setState({
            currentBodyPart: value
        })
    }

    getMuscleGroupFromSpecificMuscle = (muscle) => {
        console.log(this.state.anatomyObject)
        console.log(muscle)
        for (var muscleGroup in this.state.anatomyObject) {
            if (this.state.anatomyObject[muscleGroup].includes(muscle)) {
                console.log(muscleGroup)
                return muscleGroup
            }
        }
    }

    generateLoadInfoTableData = (muscle) => {
        var endDay = this.state.allPrograms[this.state.activeProgram].currentDayInProgram

        // If for some reason the per ended the program on Day One Just return empty array.
        if (endDay == 1) return []

        var startChronicLoad = 0

        console.log(muscleGroup)
        console.log(muscle)

        if (muscle == 'Overall_Total') {
            for (var day = 1; day < endDay; day++) {

                var dayChronicLoad = this.state.allPrograms[this.state.activeProgram][day]['loadingData']['Total']['chronicEWMA']
                if (startChronicLoad == 0 && dayChronicLoad != 0) {
                    startChronicLoad = dayChronicLoad
                    break
                }
            }

            var endChronicLoad = this.state.allPrograms[this.state.activeProgram][endDay - 1]['loadingData']['Total']['chronicEWMA']
        } else if (muscle.split('_').length == 2) {
            var muscleGroup = muscle.split('_')[0]

            for (var day = 1; day < endDay; day++) {

                var dayChronicLoad = this.state.allPrograms[this.state.activeProgram][day]['loadingData'][muscleGroup]['Total']['chronicEWMA']
                if (startChronicLoad == 0 && dayChronicLoad != 0) {
                    startChronicLoad = dayChronicLoad
                    break
                }
            }

            var endChronicLoad = this.state.allPrograms[this.state.activeProgram][endDay - 1]['loadingData'][muscleGroup]['Total']['chronicEWMA']
        } else {

            var muscleGroup = this.getMuscleGroupFromSpecificMuscle(muscle)

            for (var day = 1; day < endDay; day++) {

                var dayChronicLoad = this.state.allPrograms[this.state.activeProgram][day]['loadingData'][muscleGroup][muscle]['chronicEWMA']
                if (startChronicLoad == 0 && dayChronicLoad != 0) {
                    startChronicLoad = dayChronicLoad
                    break
                }
            }

            var endChronicLoad = this.state.allPrograms[this.state.activeProgram][endDay - 1]['loadingData'][muscleGroup][muscle]['chronicEWMA']
        }


        return [
            {
                col1: 'Initial Chronic Load',
                col2: startChronicLoad.toFixed(2)
            },
            {
                col1: 'Final Chronic Load',
                col2: endChronicLoad.toFixed(2)
            },
            {
                col1: 'Net Increase',
                col2: ((endChronicLoad - startChronicLoad).toFixed(2)).toString()
            },
            {
                col1: 'Percentage Increase',
                col2:
                    (startChronicLoad == 0) ? '0.00' :
                        (((endChronicLoad - startChronicLoad)
                            / startChronicLoad * 100))
                            .toFixed(2).toString()
                        +
                        '%'
            },
            {
                col1: 'Average Increase Per Week',
                col2:
                    ((endChronicLoad - startChronicLoad) / (endDay - 1) * 7).toFixed(2).toString()
            }
        ]
    }

    generateGeneralStatsTableData = () => {
        var returnData = [
            {
                col1: 'Time Period',
                col2: this.state.startDate + ' - ' + this.state.endDate
            },
            {
                col1: 'Program Duration',
                col2: this.state.durationOfProgram + ((this.state.durationOfProgram == 1) ? ' Week' : ' Weeks')

            },
            {
                col1: 'Loading Scheme',
                col2: loadingSchemeString(this.state.loadingScheme)
            }
        ]

        return returnData
    }

    handleOpenMuscleGroup = (value) => {
        this.setState({
            currMuscleGroupOpen: value
        })
    }

    handleSaveProgramNotes = (value) => {

        var allPrograms = this.state.allPrograms
        allPrograms[this.state.activeProgram].notes = value

        this.setState({
            allPrograms: allPrograms
        })
        this.props.firebase.pushPastProgramNotesUpstream(
            this.props.firebase.auth.currentUser.uid,
            this.state.activeProgram,
            value
        )
    }

    render() {

        const {
            activeProgram,
            hasPrograms,
            loading,
            programList,
            currentBodyPart,
            anatomyObject,
            currMuscleGroupOpen,
            programNotes

        } = this.state

        let loadInfoData = (!loading) ? this.generateLoadInfoTableData(currentBodyPart) : []

        console.log(programNotes)

        let generalStatsData = (!loading) ? this.generateGeneralStatsTableData() : []

        console.log(loadInfoData)
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
                    <div id='ppCurrentProgramHeader'>
                        <ProgramListDropdown
                            programList={programList}
                            activeProgram={activeProgram}
                            buttonHandler={this.handleSelectProgram}
                            headerText='Past Programs'
                        />

                    </div>
                </div>
                <div className='rowContainer'>
                    <div className='pageContainerLevel1 half-width' id='ppPageGeneralStatsTable'>
                        <div className='centeredPageContainerLabel'>
                            <InputLabel
                                text='General Information'
                                custID='ppGenInfoTableLabel'
                            />
                        </div>
                        <GeneralInfoTable data={generalStatsData} />
                    </div>
                    <div className='pageContainerLevel1 half-width' id='ppPageLoadingStatsTable'>
                        <div className='rowContainer'>
                            <div id='ppPageBodyPartListContainer'>
                                <BodyPartListGroup
                                    activeMuscle={currentBodyPart}
                                    muscleGroups={anatomyObject}
                                    changeMuscleHandler={this.handleSelectBodyPart}
                                    activeMuscleGroup={currMuscleGroupOpen}
                                    openMuscleGroupHandler={this.handleOpenMuscleGroup}
                                />
                            </div>
                            <div id='ppPageLoadInfoContainer'>
                                {
                                    (loadInfoData.length == 0) ?
                                        <div id='ppNoLoadInfoString'>
                                            No Load Information Was Found
                                        </div>
                                        :
                                        <div>
                                            <div className='centeredPageContainerLabel'>
                                                <InputLabel
                                                    text='Key Load Information'
                                                    custID='ppLoadInfoTableLabel'
                                                />
                                            </div>
                                            <LoadInfoTable data={loadInfoData} />
                                        </div>
                                }
                            </div>
                        </div>

                    </div>
                </div>
                <div className='rowContainer'>
                    <div className='pageContainerLevel1 half-width' id='ppPageGeneralStatsTable'>
                        <div className='centeredPageContainerLabel'>
                            <InputLabel
                                text='Program Notes'
                                custID='ppProgNotesLabel'
                            />
                        </div>
                        <FinalProgramNotes
                            initialText={programNotes}
                            submitHandler={this.handleSaveProgramNotes}
                        />


                    </div>





                    <div className='pageContainerLevel1 half-width' id='ppPageGeneralStatsTable'></div>
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