import React, { Component } from 'react';
import { Container, Grid, Header, Dimmer, Loader } from 'semantic-ui-react'

import { withAuthorisation } from '../Session';
import CurrentProgramDropdown from './currentProgramsDropdown'
import RollingAverageGraph from './rollingAverageGraph'
import ProgressionPredictiveGraph from './progressionPredictiveGraph'
import ACWEGraph from './ACWRGraph'
import { BodyPartListGroup } from './bodyPartListGroup'

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
            currentBodyPart: 'Chest',
            currentBodyPartAverageLoad: '',
            rollingAverageGraphProps: {
                totalData: [],
                series: []
            },
            ACWRGraphProps: {}
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

        if ('currentPrograms' in userObject) {

            var programListArray = []

            Object.keys(userObject.currentPrograms).forEach(key => {
                programListArray.push(key)
            })
            // Initially Sets the state for the current day
            // and current week and other parameters. 
            var bodyPartsArray = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Total']

            this.setState({
                programList: programListArray,
                activeProgram: userObject.activeProgram,
                hasPrograms: true,
                allPrograms: userObject.currentPrograms,
                currentWeekInProgram: userObject.currentPrograms[userObject.activeProgram].currentWeek,
                loadingScheme: userObject.currentPrograms[userObject.activeProgram].loading_scheme,
                bodyPartsList: bodyPartsArray,
                ACWRGraphProps: this.generateACWRGraphData(
                    userObject.currentPrograms[userObject.activeProgram],
                    bodyPartsArray
                ),
                // rollingAverageGraphProps: this.generateRollingAverageProps(
                //     userObject.currentPrograms[userObject.activeProgram].rollingAverages,
                //     bodyPartsArray
                // ),
                loading: false,
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

    generateACWRGraphData = (programData, muscles) => {


        var dataToGraph = {}

        for (var day = 1; day < programData.currentDayInProgram; day++) {

            var dateString = this.stripDateFromTSString(new Date((programData.startDayUTS + 86400000 * (day - 1))))

            muscles.forEach(muscle => {
                if (day == 1) {
                    dataToGraph[muscle] = []

                    var insertObj = {
                        name: dateString
                    }
                    insertObj['Acute Load'] = programData[day]['loadingData'][muscle].acuteEWMA
                    insertObj['Chronic Load'] = programData[day]['loadingData'][muscle].chronicEWMA
                    insertObj['ACWR'] = programData[day]['loadingData'][muscle].ACWR

                    dataToGraph[muscle].push(insertObj)

                } else {
                    var insertObj = {
                        name: dateString
                    }

                    insertObj['Acute Load'] = programData[day]['loadingData'][muscle].acuteEWMA
                    insertObj['Chronic Load'] = programData[day]['loadingData'][muscle].chronicEWMA
                    insertObj['ACWR'] = programData[day]['loadingData'][muscle].ACWR

                    dataToGraph[muscle].push(insertObj)
                }
            })



        }
        return dataToGraph

    }

    generateRollingAverageProps = (averageLoadData, bodyParts,) => {

        var ghostThresholds = [20]

        // First generate the series
        var chartSeries = ['Actual Loading']
        var totalLoadingData = {}

        bodyParts.map(bodyPart => {
            totalLoadingData[bodyPart] = []
        })

        ghostThresholds.forEach(threshold => {

            var lowerSeries = 'Threshold - (-' + threshold + '%)'
            var upperSeries = 'Threshold - (+' + threshold + '%)'

            for (var weeks in averageLoadData) {

                for (var bodyPart in averageLoadData[weeks]) {

                    var loadingVal = parseFloat(averageLoadData[weeks][bodyPart])

                    var upperThreshold = parseFloat(((1 + threshold / 100) * loadingVal).toFixed(2))
                    var lowerThreshold = parseFloat(((1 - threshold / 100) * loadingVal).toFixed(2))

                    var weeksString = 'Weeks (' + weeks.split('_')[0] + '-' + weeks.split('_')[1] + ')'

                    var dataPointObj = {
                        name: weeksString
                    }

                    dataPointObj[upperSeries] = upperThreshold
                    dataPointObj[lowerSeries] = lowerThreshold
                    dataPointObj['Actual Loading'] = loadingVal

                    totalLoadingData[bodyPart].push(dataPointObj)
                }
            }
            chartSeries.push(lowerSeries)
            chartSeries.push(upperSeries)
        })

        console.log(totalLoadingData)

        return {
            series: chartSeries,
            totalData: totalLoadingData
        }
    }

    handleSelectProgram = (event, { value }) => {

        if (this.state.activeProgram != value) {
            this.props.firebase.setActiveProgram(
                this.props.firebase.auth.currentUser.uid,
                event.target.value
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

    render() {
        const {
            hasPrograms,
            programList,
            activeProgram,
            loading,
            currentWeekInProgram,
            loadingScheme,
            bodyPartsList,
            currentBodyPart,
            ACWRGraphProps
        } = this.state

        console.log(currentBodyPart)


        let loadingHTML =
            <Dimmer inverted active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>
        let noCurrentProgramsHTML = <Header as='h1'>Create A Program Before Accessing This Page</Header>
        let hasCurrentProgramsHTML =
            <div>
                <Header as='h1'>Progression Data - {activeProgram}</Header>
                <Header as='h3'>Current Week: {currentWeekInProgram}, Loading Scheme: {loadingScheme}</Header>
                <CurrentProgramDropdown
                    programList={programList}
                    activeProgram={activeProgram}
                    buttonHandler={this.handleSelectProgram}
                />
                <Container>
                    <Grid divided='vertically'>
                        <Grid.Row columns={2}>
                            <Grid.Column>
                                <BodyPartListGroup
                                    currBodyPart={currentBodyPart}
                                    bodyPartsList={bodyPartsList}
                                    changeBodyPartHandler={this.handleSelectBodyPart}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <ACWEGraph ACWRData={ACWRGraphProps[currentBodyPart]} />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            {/* <ProgressionPredictiveGraph startLoad={this.generateCurrentAverageLoad(rollingAverageGraphProps.totalData[currentBodyPart])} /> */}
                        </Grid.Row>
                    </Grid>
                </Container>
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
export default withAuthorisation(condition)(ProgressionDataPage);