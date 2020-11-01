import React, { Component } from 'react';
import { Container, Row } from 'react-bootstrap';

import { withAuthorisation } from '../Session';
import CurrentProgramDropdown from './currentProgramsDropdown'
import RollingAverageGraph from './rollingAverageGraph'


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
            rollingAverageGraphProps: {
                data: [],
                series: []
            }
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
            this.setState({
                programList: programListArray,
                activeProgram: userObject.activeProgram,
                hasPrograms: true,
                allPrograms: userObject.currentPrograms,
                currentWeekInProgram: userObject.currentPrograms[userObject.activeProgram].currentWeek,
                loadingScheme: userObject.currentPrograms[userObject.activeProgram].loading_scheme,
                rollingAverageGraphProps: this.generateRollingAverageProps(userObject),
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

    generateRollingAverageProps = (userObject) => {

        var ghostThresholds = [20]
        var bodyPart = 'Back'

        var averageLoadData = userObject.currentPrograms[userObject.activeProgram].rollingAverages

        // First generate the series
        var chartSeries = ['Actual Loading']
        var chartData = []


        ghostThresholds.forEach(threshold => {

            var lowerSeries = 'Threshold - (-' + threshold + '%)'
            var upperSeries = 'Threshold - (+' + threshold + '%)'

            for (var weeks in averageLoadData) {
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

                chartData.push(dataPointObj)
            }
            chartSeries.push(lowerSeries)
            chartSeries.push(upperSeries)
        })

        return {
            series: chartSeries,
            data: chartData
        }
    }

    handleSelectProgram = (event) => {

        this.props.firebase.setActiveProgram(
            this.props.firebase.auth.currentUser.uid,
            event.target.value
        )
    }


    render() {
        const {
            hasPrograms,
            programList,
            activeProgram,
            loading,
            currentWeekInProgram,
            loadingScheme,
            rollingAverageGraphProps
        } = this.state

        console.log(rollingAverageGraphProps)

        let loadingHTML = <h1>Loading...</h1>
        let noCurrentProgramsHTML = <h1>Create A Program Before Accessing This Page</h1>
        let hasCurrentProgramsHTML =
            <div>
                <h1>Progression Data - {activeProgram}</h1>
                <CurrentProgramDropdown
                    programList={programList}
                    activeProgram={activeProgram}
                    buttonHandler={this.handleSelectProgram}
                />
                <Container>
                    <Row>
                        <RollingAverageGraph
                            graphData={rollingAverageGraphProps.data}
                            graphSeries={rollingAverageGraphProps.series}
                        />
                    </Row>
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