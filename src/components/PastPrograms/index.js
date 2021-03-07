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
import ExerciseHistoryModal from './viewPrevWeeksDataModal'
import GoalHistoryModal from './goalHistoryModal'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'



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
            programNotes: '',
            prevWeeksData: {},
            currentWeekInProgram: 1,
            goalStatsData: {},
            goalTableData: []
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

            var processedGoalData = this.generateGoalTableData(userObject.pastPrograms[programListArray[0]])

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
                prevWeeksData: this.generatePrevWeeksData(userObject.pastPrograms[programListArray[0]]),
                currentDayInProgram: userObject.pastPrograms[programListArray[0]].currentWeekInProgram,
                goalTableData: processedGoalData.tableData,
                goalStatsData: processedGoalData.statsData,
                goalProgPieChartData: processedGoalData.pieChartData
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

            var processedGoalData = this.generateGoalTableData(this.state.allPrograms[value])

            this.setState({
                activeProgram: value,
                startDate: utsToDateString(this.state.allPrograms[value].startDayUTS),
                endDate: utsToDateString(this.state.allPrograms[value].endDayUTS),
                durationOfProgram: Math.ceil((this.state.allPrograms[value].currentDayInProgram - 1) / 7),
                programNotes: (this.state.allPrograms[value].notes != undefined) ? this.state.allPrograms[value].notes : '',
                prevWeeksData: this.generatePrevWeeksData(this.state.allPrograms[value]),
                goalTableData: processedGoalData.tableData,
                goalStatsData: processedGoalData.statsData,
                goalProgPieChartData: processedGoalData.pieChartData
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

    generatePrevWeeksData = (programData) => {
        var currWeek = Math.ceil(programData.currentDayInProgram / 7)
        console.log(programData)

        var dataObject = {}
        console.log(currWeek)
        for (var prevWeekNum = 1; prevWeekNum <= currWeek; prevWeekNum++) {
            dataObject[prevWeekNum] = {}

            for (var day = 1; day < 8; day++) {

                var dayInProgram = (prevWeekNum - 1) * 7 + day
                var dayObject = {}
                if (programData[dayInProgram] != undefined) {
                    Object.keys(programData[dayInProgram]).forEach(exercise => {
                        if (exercise != 'loadingData') {
                            dayObject[exercise] = programData[dayInProgram][exercise]
                        }
                    })
                }

                dataObject[prevWeekNum][day] = dayObject
            }
        }

        // Check if the object is actually empty and there is no data.
        var hasData = false

        for (var weeks in dataObject) {
            var week = dataObject[weeks]
            for (var day in week) {
                if (Object.keys(week[day]).length > 0) {
                    hasData = true
                    break
                }
            }
        }

        if (hasData) {
            return dataObject
        } else {
            return {}
        }
    }

    generateGoalTableData = (goals) => {

        if (goals) {
            if (Object.keys(goals).length > 0) {

                var tableData = []
                var goalStatsData = {
                    numSubGoals: 0,
                    numSubGoalsComplete: 0,
                    numMainGoals: 0,
                    numMainGoalsComplete: 0,
                    numEasyGoalsComplete: 0,
                    numMediumGoalsComplete: 0,
                    numHardGoalsComplete: 0,
                    numHardGoals: 0,
                    numMediumGoals: 0,
                    numEasyGoals: 0
                }

                Object.keys(goals).forEach(goalKey => {
                    var goal = goals[goalKey]
                    if (goal.subGoals != undefined) {

                        var processedSubGoalData = this.generateSubGoalData(goal.subGoals)

                        tableData.push({
                            description: goal.mainGoal.description,
                            progressString: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                            completed: goal.mainGoal.completed,
                            subRows: processedSubGoalData.tableData,
                            goalUID: goalKey,
                            targetCloseDate: goal.mainGoal.closeOffDate,
                            difficulty: goal.mainGoal.difficulty,
                        })

                        goalStatsData.numSubGoals += processedSubGoalData.statsData.numSubGoals

                        goalStatsData.numSubGoalsComplete += processedSubGoalData.statsData.numSubGoalsComplete

                        goalStatsData.numEasyGoalsComplete += processedSubGoalData.statsData.numEasyGoalsComplete

                        goalStatsData.numMediumGoalsComplete += processedSubGoalData.statsData.numMediumGoalsComplete

                        goalStatsData.numHardGoalsComplete += processedSubGoalData.statsData.numHardGoalsComplete

                    } else {
                        tableData.push({
                            description: goal.mainGoal.description,
                            progressString: (goal.mainGoal.completed) ? 'Complete' : 'In Progress',
                            targetCloseDate: goal.mainGoal.closeOffDate,
                            completed: goal.mainGoal.completed,
                            goalUID: goalKey,
                            difficulty: goal.mainGoal.difficulty,
                        })


                    }
                    goalStatsData.numMainGoals++
                    goalStatsData['num' + goal.mainGoal.difficulty + 'Goals']++

                    if (goal.mainGoal.completed) {
                        goalStatsData.numMainGoalsComplete++
                        goalStatsData['num' + goal.mainGoal.difficulty + 'GoalsComplete']++
                    }
                })

                var formattedGoalChartData = this.generateGoalProgChartData(goalStatsData)
                return {
                    tableData: tableData,
                    statsData: goalStatsData,
                    pieChartData: formattedGoalChartData.pieChartData,
                    barChartData: formattedGoalChartData.barChartData

                }
            } else {
                return {
                    tabledata: [],
                    statsData: {},
                    pieChartData: {
                        data: [],
                        colours: []
                    },
                    barChartData: []
                }
            }
        }
        return {
            tableData: [],
            statsData: {},
            pieChartData: {
                data: [],
                colours: []
            },
            barChartData: []
        }
    }

    generateSubGoalData = (subGoalList) => {
        var returnArray = []
        var subGoalStatsData = {
            numSubGoals: 0,
            numSubGoalsComplete: 0,
            numEasyGoalsComplete: 0,
            numMediumGoalsComplete: 0,
            numHardGoalsComplete: 0,
            numHardGoals: 0,
            numMediumGoals: 0,
            numEasyGoals: 0,
        }

        Object.keys(subGoalList).forEach(subGoalKey => {
            var subGoal = subGoalList[subGoalKey]
            console.log(subGoal)
            returnArray.push({
                description: subGoal.description,
                progressString: (subGoal.completed) ? 'Complete' : 'In Progress',
                completed: subGoal.completed,
                targetCloseDate: subGoal.closeOffDate,
                goalUID: subGoalKey,
                difficulty: subGoal.difficulty,
            })

            subGoalStatsData.numSubGoals++
            subGoalStatsData['num' + subGoal.difficulty + 'Goals']++

            if (subGoal.completed) {
                subGoalStatsData.numSubGoalsComplete++
                console.log('num' + subGoal.difficulty + 'GoalsComplete')
                subGoalStatsData['num' + subGoal.difficulty + 'GoalsComplete']++
            }
        })

        console.log(subGoalStatsData)
        return {
            tableData: returnArray,
            statsData: subGoalStatsData
        }
    }

    generateGoalProgChartData = (goalStatsData) => {

        return {
            pieChartData: {
                colours: ['#8cfc86', '#fcf686', '#fc868c'],
                data: [
                    {
                        name: 'Easy',
                        value: goalStatsData.numEasyGoalsComplete
                    },
                    {
                        name: 'Medium',
                        value: goalStatsData.numMediumGoalsComplete
                    },
                    {
                        name: 'Hard',
                        value: goalStatsData.numHardGoalsComplete
                    }
                ]
            },
            barChartData: {
                data: [
                    {
                        name: 'All Goals',
                        Completed: goalStatsData.numSubGoalsComplete + goalStatsData.numMainGoalsComplete,
                        Total: goalStatsData.numSubGoals + goalStatsData.numMainGoals
                    },
                    {
                        name: 'Main Goals',
                        Completed: goalStatsData.numSubGoalsComplete,
                        Total: goalStatsData.numMainGoals
                    },
                    {
                        name: 'Sub Goals',
                        Completed: goalStatsData.numSubGoalsComplete,
                        Total: goalStatsData.numSubGoals
                    }
                ]
            }
        }

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
            programNotes,
            prevWeeksData,
            currentWeekInProgram,
            loadingScheme,
            goalTableData,
            goalStatsData,
            goalProgPieChartData

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
        let noCurrentProgramsHTML = <NonLandingPageWrapper><Header as='h1'>No Past Programs to Show... <br /> Close off a program before this becomes usable. </Header></NonLandingPageWrapper>
        let hasCurrentProgramsHTML =
            <NonLandingPageWrapper>
                <div className='pageContainerLevel1'>
                    <div id='ppProgramHeader'>
                        {activeProgram.split('_')[0]}
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
                    <div className='pageContainerLevel1 half-width' id='ppPageExHistTable'>
                        <div className='centeredPageContainerLabel'>
                            <InputLabel
                                text='Historical Data'
                                custID='ppExHistoryLabel'
                            />
                        </div>
                        <div id='ppPageExGoalHistBtnContainer' className='rowContainer'>
                            <div className='half-width centred-info'>
                                <GoalHistoryModal
                                    goalTableData={goalTableData}
                                    goalStatsData={goalStatsData}
                                    goalProgPieChartData={goalProgPieChartData}
                                />
                            </div>
                            <div className='half-width centred-info'>
                                < ExerciseHistoryModal
                                    data={prevWeeksData}
                                    defaultWeek={currentWeekInProgram}
                                    progScheme={loadingScheme}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </NonLandingPageWrapper>


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