import React, { Component, useState, useEffect } from 'react';

import { withAuthorisation } from '../Session';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip, Legend } from 'recharts'
import randomColour from '../../constants/colours'

import { Form, Button } from 'semantic-ui-react'

class SafetyGraphPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <h1>Safety Graph Page</h1>
                <SafetyGraphChart />
            </div>
        );
    }
}

const reChartSeriesHtml = (seriesNames) => {
    return (seriesNames.map(series => {
        return (
            <Line key={series} type="monotone" dataKey={series} stroke={randomColour()} />
        )
    }))
}


const SafetyGraphChart = () => {


    const [safetyChartThreshold, setSafetyChartThreshold] = useState(
        localStorage.getItem('targetLoad') || ''
    )

    const [safetyChartData, setSafetyChartData] = useState(
        [{ name: "", Load: 0 }]
    )

    // Sets an Initial variable (state) for target load and a setter function (setTargetLoad) to update state. 
    // The initial value is retrieved from local storage. If that is null returns empty string.  
    const [targetLoad, setTargetLoad] = useState(
        localStorage.getItem('targetLoad') || ''
    )

    // Sets an Initial variable for start load, same as above. 
    const [startLoad, setStartLoad] = useState(
        localStorage.getItem('startLoad') || ''
    )

    const [percentages, setPercentages] = useState(
        localStorage.getItem('percentages') || ''
    )

    const [graphSeries, setgraphSeries] = useState([])

    // Creates a trigger for targetLoad variable, whenever its changed, it will trigger this function. 
    useEffect(() => {
        localStorage.setItem('targetLoad', targetLoad)
    }, [targetLoad])

    // Creates a trigger for startLoad variable, whenever its changed, it will trigger this function. 
    useEffect(() => {
        localStorage.setItem('startLoad', startLoad)
    }, [startLoad])

    useEffect(() => {
        localStorage.setItem('percentages', percentages)
    }, [percentages])

    // Handles validation of the submit data button under the graph.
    const isInvalid = targetLoad === ''
        || startLoad === ''
        || percentages === ''
        || startLoad <= 0
        || targetLoad <= startLoad

    // Handles the on change event with typing into targetLoad, startLoad and percentages. 
    const onChange = event => {
        if (event.target.name === "targetLoad") {
            setTargetLoad(event.target.value)
        } else if (event.target.name === 'startLoad') {
            setStartLoad(event.target.value)
        } else if (event.target.name === 'percentages') {
            setPercentages(event.target.value)
        }
    }

    // Splits the comma separated list into individual percentages and removes
    // white space before and after the percentages.
    const processPercentString = () => {
        var return_arr = []

        if (percentages != []) {
            var percentages_arr = percentages.split(',').sort((a, b) => a - b)

            percentages_arr.forEach(percVal => {
                if (percVal > 0 && percVal < 100) {
                    return_arr.push(
                        percVal.trim()
                    )
                }
            })
        }

        return return_arr

    }

    const validateInputData = () => {
        // Check empty inputs
        if (targetLoad === '' || startLoad === '' || percentages === '') {
            return false;
        }

        // Check numerical Stability. 
        if (parseFloat(startLoad) <= 0 || parseFloat(startLoad) >= parseFloat(targetLoad)) {
            return false;
        }

        return true
    }


    const processData = (event) => {

        if (!validateInputData()) {
            return
        }

        // console.log(validatePercentString())
        var weekNum = 0;
        var currWeekLoad = {}
        var returnData = []
        var percentages_arr = processPercentString()
        var graphSeries = []

        var data_obj = { name: 'Week 0' }

        // Sets the initial state point on graph and fills in the series names. 
        percentages_arr.forEach(percVal => {
            graphSeries.push('Hypothetical - ' + percVal + '%')
            data_obj['Hypothetical - ' + percVal + '%'] = parseFloat(startLoad)
            currWeekLoad[percVal] = startLoad
        })

        returnData.push(data_obj)

        // Creates the data points and places them in return object. 
        while (currWeekLoad[percentages_arr[0]] < targetLoad) {
            weekNum++;

            data_obj = { name: 'Week ' + weekNum }

            percentages_arr.forEach(percVal => {
                if (currWeekLoad[percVal] > targetLoad) {
                    data_obj['Hypothetical - ' + percVal + '%'] = null
                } else {
                    currWeekLoad[percVal] = currWeekLoad[percVal] * ((percVal / 100) + 1)
                    data_obj['Hypothetical - ' + percVal + '%'] = currWeekLoad[percVal]
                }
            })

            returnData.push(data_obj)

        }

        // Set the state for all the chart parameters. 
        setSafetyChartThreshold(targetLoad)
        setSafetyChartData(returnData)
        setgraphSeries(graphSeries)
        event.preventDefault()

    }

    return (
        <div>
            <LineChart width={800} height={500} data={safetyChartData}
                margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <ReferenceLine y={safetyChartThreshold} label="Target Load" stroke="red" />
                {reChartSeriesHtml(graphSeries)}
            </LineChart>
            <Form onSubmit={processData}>
                <div>
                    <div>
                        <h5>Start Load</h5>
                        <input
                            name="startLoad"
                            value={startLoad}
                            onChange={onChange}
                            type="number"
                            placeholder="Input Starting Load"
                        />
                    </div>
                    <div>
                        <h5>Target Load</h5>
                        <input
                            name="targetLoad"
                            value={targetLoad}
                            onChange={onChange}
                            type="number"
                            placeholder="Input Target Load"
                        />
                    </div>
                    <div>
                        <h5>Percentages</h5>
                        <input
                            name="percentages"
                            value={percentages}
                            onChange={onChange}
                            type="text"
                            placeholder="Input Percentages"
                        />
                    </div>
                </div>
                <Button variant="dark" type="submit">
                    Calculate Loads
                </Button>
            </Form>

        </div>
    )
};


const condition = authUser => !!authUser;
export default withAuthorisation(condition)(SafetyGraphPage);
