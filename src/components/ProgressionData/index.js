import React, { Component } from 'react';
import { Popup, Icon, Header, Dimmer, Loader, Progress, Statistic } from 'semantic-ui-react'

import { withAuthorisation } from '../Session';
import CurrentProgramDropdown from './currentProgramsDropdown'
import ProgressionPredictiveGraph from './progressionPredictiveGraph'
import { ACWEGraph, RollChronicACWRGraph } from './ACWRGraph'
import BodyPartListGroup from '../CustomComponents/bodyPartListGroup'
import InputLabel from '../CustomComponents/DarkModeInput'
import GoalProgressionPieChart from './goalProgressionPieChart'
import GoalProgressionBarChart from './goalProgressionBarChart'
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'

// Custom Function Importing
import loadingSchemeString from '../../constants/loadingSchemeString'

class ProgressionDataPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            activeProgram: '',
            programList: [],
            allPrograms: [],
            currentWeekInProgram: '',
            loadingScheme: '',
            hasPrograms: false,
            currentBodyPart: 'Overall_Total',
            currMuscleGroupOpen: 'Arms',
            currentBodyPartAverageLoad: '',
            rollingAverageGraphProps: {
                totalData: [],
                series: []
            },
            ACWRGraphProps: {},
            goalTableData: [],
            goalStatsData: {}
        }
    }

    async componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        // Creates a reference to the current user object in the database. Function will be run each time the user
        // object updates in the database. 
        await this.props.firebase.getUserData(currUserUid).on('value', userData => {
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

        if ('currentPrograms' in userObject) {

            var programListArray = []

            Object.keys(userObject.currentPrograms).forEach(key => {
                programListArray.push(key)
            })
            // Initially Sets the state for the current day
            // and current week and other parameters. 

            var processedGoalData = this.generateGoalTableData(userObject.currentPrograms[userObject.activeProgram])

            this.setState({
                programList: programListArray,
                activeProgram: userObject.activeProgram,
                hasPrograms: true,
                allPrograms: userObject.currentPrograms,
                currentWeekInProgram: Math.ceil(userObject.currentPrograms[userObject.activeProgram].currentDayInProgram / 7),
                loadingScheme: userObject.currentPrograms[userObject.activeProgram].loading_scheme,
                // bodyPartsList: bodyPartsArray,
                ACWRGraphProps: this.generateACWRGraphData(
                    userObject.currentPrograms[userObject.activeProgram],
                    anatomyObject
                ),
                rollingAverageGraphProps: this.generateSafeLoadGraphProps(
                    userObject.currentPrograms[userObject.activeProgram],
                    anatomyObject
                ),
                loading: false,
                anatomyObject: anatomyObject,
                goalTableData: processedGoalData.tableData,
                goalStatsData: processedGoalData.statsData,
                goalProgPieChartData: processedGoalData.pieChartData,
                goalProgBarChartData: processedGoalData.barChartData
            })
        } else {
            this.setState({
                programList: ['No Current Programs'],
                activeProgram: '',
                loading: false
            })
        }
    }

    stripDateFromTSString = (inputDay) => {

        var day = String(inputDay.getDate()).padStart(2, '0');
        var month = String(inputDay.getMonth() + 1).padStart(2, '0'); //January is 0!
        var year = inputDay.getFullYear();

        var date = day + '-' + month + '-' + year;

        return date
    }

    generateACWRGraphData = (programData, muscleGroups) => {


        var dataToGraph = {}

        for (var day = 1; day < programData.currentDayInProgram; day++) {

            var dateString = this.stripDateFromTSString(new Date((programData.startDayUTS + 86400000 * (day - 1))))

            if (day == 1) {
                dataToGraph['Overall_Total'] = []

                var insertObj = {
                    name: dateString
                }
                insertObj['Acute Load'] = programData[day]['loadingData']['Total'].acuteEWMA
                insertObj['Chronic Load'] = programData[day]['loadingData']['Total'].chronicEWMA
                insertObj['ACWR'] = programData[day]['loadingData']['Total'].ACWR

                dataToGraph['Overall_Total'].push(insertObj)

            } else {
                insertObj = {
                    name: dateString
                }

                insertObj['Acute Load'] = programData[day]['loadingData']['Total'].acuteEWMA
                insertObj['Chronic Load'] = programData[day]['loadingData']['Total'].chronicEWMA
                insertObj['ACWR'] = programData[day]['loadingData']['Total'].ACWR

                dataToGraph['Overall_Total'].push(insertObj)
            }


            Object.keys(muscleGroups).forEach(muscleGroup => {

                if (day == 1) {
                    dataToGraph[muscleGroup + '_Total'] = []

                    var insertObj = {
                        name: dateString
                    }
                    insertObj['Acute Load'] = programData[day]['loadingData'][muscleGroup]['Total'].acuteEWMA
                    insertObj['Chronic Load'] = programData[day]['loadingData'][muscleGroup]['Total'].chronicEWMA
                    insertObj['ACWR'] = programData[day]['loadingData'][muscleGroup]['Total'].ACWR

                    dataToGraph[muscleGroup + '_Total'].push(insertObj)

                } else {
                    insertObj = {
                        name: dateString
                    }

                    insertObj['Acute Load'] = programData[day]['loadingData'][muscleGroup]['Total'].acuteEWMA
                    insertObj['Chronic Load'] = programData[day]['loadingData'][muscleGroup]['Total'].chronicEWMA
                    insertObj['ACWR'] = programData[day]['loadingData']['Total'].ACWR

                    dataToGraph[muscleGroup + '_Total'].push(insertObj)
                }


                muscleGroups[muscleGroup].forEach(muscle => {
                    if (day == 1) {
                        dataToGraph[muscle] = []

                        var insertObj = {
                            name: dateString
                        }

                        console.log(programData[day]['loadingData'])
                        console.log(muscleGroup)
                        console.log(muscle)
                        insertObj['Acute Load'] = programData[day]['loadingData'][muscleGroup][muscle].acuteEWMA
                        insertObj['Chronic Load'] = programData[day]['loadingData'][muscleGroup][muscle].chronicEWMA
                        insertObj['ACWR'] = programData[day]['loadingData'][muscleGroup][muscle].ACWR

                        dataToGraph[muscle].push(insertObj)

                    } else {
                        insertObj = {
                            name: dateString
                        }

                        insertObj['Acute Load'] = programData[day]['loadingData'][muscleGroup][muscle].acuteEWMA
                        insertObj['Chronic Load'] = programData[day]['loadingData'][muscleGroup][muscle].chronicEWMA
                        insertObj['ACWR'] = programData[day]['loadingData'][muscleGroup][muscle].ACWR

                        dataToGraph[muscle].push(insertObj)
                    }


                })

            })
        }
        return dataToGraph

    }

    generateSafeLoadGraphProps = (programData, muscleGroups) => {

        var ghostThresholds = [20]

        // First generate the series
        var chartSeries = ['Actual Loading']
        var dataToGraph = {}

        // muscles.map(muscle => {
        //     totalLoadingData[muscle] = []
        // })

        ghostThresholds.forEach(threshold => {

            var lowerSeries = 'Threshold - (-' + threshold + '%)'
            var upperSeries = 'Threshold - (+' + threshold + '%)'


            for (var day = 1; day < programData.currentDayInProgram; day++) {



                var dateString = this.stripDateFromTSString(new Date((programData.startDayUTS + 86400000 * (day - 1))))

                var loadingVal = parseFloat(programData[day]['loadingData']['Total'].chronicEWMA)

                if (day == 1) {
                    dataToGraph['Overall_Total'] = []

                    var insertObj = {
                        name: dateString
                    }
                    insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                    insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                    insertObj['Actual Loading'] = loadingVal

                    dataToGraph['Overall_Total'].push(insertObj)

                } else {
                    insertObj = {
                        name: dateString
                    }

                    insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                    insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                    insertObj['Actual Loading'] = loadingVal

                    dataToGraph['Overall_Total'].push(insertObj)
                }

                Object.keys(muscleGroups).forEach(muscleGroup => {

                    var loadingVal = parseFloat(programData[day]['loadingData'][muscleGroup]['Total'].chronicEWMA)

                    if (day == 1) {
                        dataToGraph[muscleGroup + '_Total'] = []

                        var insertObj = {
                            name: dateString
                        }
                        insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                        insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                        insertObj['Actual Loading'] = loadingVal

                        dataToGraph[muscleGroup + '_Total'].push(insertObj)

                    } else {
                        insertObj = {
                            name: dateString
                        }

                        insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                        insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                        insertObj['Actual Loading'] = loadingVal

                        dataToGraph[muscleGroup + '_Total'].push(insertObj)
                    }



                    muscleGroups[muscleGroup].forEach(muscle => {
                        var loadingVal = parseFloat(programData[day]['loadingData'][muscleGroup][muscle].chronicEWMA)

                        if (day == 1) {
                            dataToGraph[muscle] = []

                            var insertObj = {
                                name: dateString
                            }
                            insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                            insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                            insertObj['Actual Loading'] = loadingVal

                            dataToGraph[muscle].push(insertObj)

                        } else {
                            insertObj = {
                                name: dateString
                            }

                            insertObj[lowerSeries] = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))
                            insertObj[upperSeries] = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                            insertObj['Actual Loading'] = loadingVal

                            dataToGraph[muscle].push(insertObj)
                        }
                    })
                })
            }
            chartSeries.push(lowerSeries)
            chartSeries.push(upperSeries)
        })

        console.log(dataToGraph)
        console.log(chartSeries)

        return {
            series: chartSeries,
            totalData: dataToGraph
        }
    }

    handleSelectProgram = (event, { value }) => {
        if (this.state.activeProgram != value) {
            this.props.firebase.setActiveProgram(
                this.props.firebase.auth.currentUser.uid,
                value
            )
        }
    }

    handleSelectBodyPart = (value) => {
        this.setState({
            currentBodyPart: value
        })
    }

    generateCurrentAverageLoad = (data) => {
        if (data != null) {
            if (data.length > 0) {
                return data.slice(-1)[0]['Actual Loading']
            } else {
                return ''
            }
        } else {
            return ''
        }
    }


    generateGoalTableData = (programObject) => {
        console.log(programObject)

        if (programObject.goals != undefined) {
            if (Object.keys(programObject.goals).length > 0) {

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

                Object.keys(programObject.goals).forEach(goalKey => {
                    var goal = programObject.goals[goalKey]
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

    handleOpenMuscleGroup = (value) => {
        this.setState({
            currMuscleGroupOpen: value
        })
    }

    render() {
        const {
            hasPrograms,
            programList,
            activeProgram,
            loading,
            currentWeekInProgram,
            loadingScheme,
            currMuscleGroupOpen,
            currentBodyPart,
            ACWRGraphProps,
            rollingAverageGraphProps,
            goalTableData,
            goalStatsData,
            goalProgPieChartData,
            goalProgBarChartData,
            anatomyObject
        } = this.state

        console.log(this.state)

        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>
        let noCurrentProgramsHTML = <Header as='h1'>Create A Program Before Accessing This Page</Header>
        let hasCurrentProgramsHTML =
            <NonLandingPageWrapper>
                <div className='pageContainerLevel1'>
                    <div id='pdProgramHeader'>
                        Progression Data - {activeProgram}
                    </div>
                    <div id='pdWeekHeader'>
                        Current Week: {currentWeekInProgram}
                    </div>
                    <div id='pdSchemeHeader'>
                        Loading Scheme: {loadingSchemeString(loadingScheme)}
                    </div>

                    <div id='pdCurrentProgramHeader'>
                        <CurrentProgramDropdown
                            className='lpCurrentProgramDropDown'
                            programList={programList}
                            activeProgram={activeProgram}
                            buttonHandler={this.handleSelectProgram}
                        />
                    </div>
                </div>
                <div
                    className='pageContainerLevel1'
                    id='pdBodyContainer1'
                >
                    <div
                        className='pageContainerLevel2' id='pdSideBarContainer'
                    >
                        <BodyPartListGroup
                            activeMuscle={currentBodyPart}
                            muscleGroups={anatomyObject}
                            changeMuscleHandler={this.handleSelectBodyPart}
                            activeMuscleGroup={currMuscleGroupOpen}
                            openMuscleGroupHandler={this.handleOpenMuscleGroup}
                        />
                    </div>

                    <div
                        className='pageContainerLevel2' id='pdGraphContainer'
                    >

                        <div id='rollChronicGraphContainer'>
                            <InputLabel
                                custID='rollChronicGraphLabel'
                                text='Rolling Safe Loading Threshold &nbsp;'
                                toolTip={<Popup
                                    basic
                                    trigger={<Icon name='question circle outline' />}
                                    content='Historical representation of your actual loading with upper and lower safe training thresholds based on ACWR.'
                                    position='right center'
                                />}
                            />
                            <RollChronicACWRGraph
                                graphData={rollingAverageGraphProps.totalData[currentBodyPart]}
                                graphSeries={rollingAverageGraphProps.series}
                            />
                        </div>
                        <div id='ACWRGraphContainer'>
                            <InputLabel
                                custID='ACWRGraphLabel'
                                text='Rolling Acute Chronic Workload Ratio & Subcomponents &nbsp;'
                                toolTip={<Popup
                                    basic
                                    trigger={<Icon name='question circle outline' />}
                                    content='Historical representation of your Acute Load, Chronic Load and ACWR.'
                                    position='bottom center'
                                />}
                            />
                            <ACWEGraph ACWRData={ACWRGraphProps[currentBodyPart]} />
                        </div>


                    </div>
                </div>
                <div id='plPageSecondRowContainer'>
                    <div className='pageContainerLevel1' id='pdBodyContainer2'>
                        <ProgressionPredictiveGraph startLoad={this.generateCurrentAverageLoad(rollingAverageGraphProps.totalData[currentBodyPart])} />
                    </div>
                    <div className='pageContainerLevel1' id='pdBodyContainer3'>
                        {
                            goalTableData.length > 0 &&
                            <div>
                                <InputLabel text='Current Goal Progression' custID='ppGoalsPromptLabel' />
                                <div id='ppGoalStatGrouping'>
                                    <Statistic
                                        inverted
                                        size='tiny'
                                        className='ppStatisticLevel1ImpLeft'
                                    >
                                        <Statistic.Value>
                                            {goalStatsData.numSubGoalsComplete}
                                        </Statistic.Value>
                                        <Statistic.Label>
                                            Sub Goals Completed
                                        </Statistic.Label>
                                    </Statistic>

                                    <Statistic
                                        inverted
                                        className='statisticLevel0Imp'
                                        size='small'
                                    >
                                        <Statistic.Value>
                                            {goalStatsData.numSubGoalsComplete + goalStatsData.numMainGoalsComplete}
                                        </Statistic.Value>
                                        <Statistic.Label>
                                            Total Goals Completed
                                        </Statistic.Label>
                                    </Statistic>

                                    <Statistic
                                        inverted
                                        size='tiny'
                                        className='ppStatisticLevel1ImpRight'
                                    >
                                        <Statistic.Value>
                                            {goalStatsData.numMainGoalsComplete}
                                        </Statistic.Value>
                                        <Statistic.Label>
                                            Main Goals Completed
                                        </Statistic.Label>
                                    </Statistic>
                                </div>
                                <div id='ppGoalChartsRow'>
                                    <div id='ppGoalPieChartContainer'>

                                        <InputLabel
                                            custID='ppGoalPieChartLabel'
                                            text='Goal Difficulty Spread'
                                        />

                                        <GoalProgressionPieChart
                                            data={goalProgPieChartData.data}
                                            chartColours={goalProgPieChartData.colours}
                                        />
                                    </div>
                                    <div id='ppGoalBarChartContainer'>
                                        <InputLabel
                                            custID='ppGoalBarChartLabel'
                                            text='Completion Statistics'
                                        />

                                        <GoalProgressionBarChart
                                            data={goalProgBarChartData.data}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            goalTableData.length == 0 &&
                            <div id='noGoalsPromptContainer'>
                                <div id='ppNoGoalsPromptLabelContainer'>
                                    <InputLabel text='No Current Goal Data' custID='ppNoGoalsPromptLabel' />
                                </div>
                            </div>
                        }
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
export default withAuthorisation(condition)(ProgressionDataPage);