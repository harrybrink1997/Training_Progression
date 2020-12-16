import React, { useState, useEffect } from 'react';

import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import randomColour from '../../constants/colours'

import { Form, Button, Popup, Icon } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

const ProgressionPredictiveGraph = ({ startLoad }) => {

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

    const [percentages, setPercentages] = useState(
        localStorage.getItem('percentages') || ''
    )

    const [graphSeries, setgraphSeries] = useState([])

    // Creates a trigger for targetLoad variable, whenever its changed, it will trigger this function. 
    useEffect(() => {
        localStorage.setItem('targetLoad', targetLoad)
    }, [targetLoad])

    useEffect(() => {
        localStorage.setItem('percentages', percentages)
    }, [percentages])

    // Handles the on change event with typing into targetLoad and percentages. 
    const onChange = event => {
        if (event.target.name === "targetLoad") {
            setTargetLoad(event.target.value)
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
        if (targetLoad === '' || percentages === '' || startLoad === '') {
            return false;
        }

        // Check numerical Stability. 
        if (parseFloat(startLoad) >= parseFloat(targetLoad)) {
            return false;
        }

        return true
    }


    const processData = (event) => {
        event.preventDefault()

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
            data_obj['Hypothetical - ' + percVal + '%'] = parseFloat(startLoad.toFixed(2))
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
                    data_obj['Hypothetical - ' + percVal + '%'] = parseFloat(currWeekLoad[percVal].toFixed(2))
                }
            })

            console.log(data_obj)
            returnData.push(data_obj)

        }
        // Set the state for all the chart parameters. 
        setSafetyChartThreshold(targetLoad)
        setSafetyChartData(returnData)
        setgraphSeries(graphSeries)

    }

    return (
        <div id='progPredictiveGraphContainer'>
            <div className='pageContainerLevel2' id='progPredictiveGraphFormContainer'>
                <form onSubmit={processData}>
                    <div>
                        <div id='targetLoadInputContainer'>
                            <InputLabel
                                text='Target Load &nbsp;'
                                toolTip={<Popup
                                    basic
                                    trigger={<Icon name='question circle outline' />}
                                    content='Choose a load that you want to achieve. This should be higher then your most recent training session.'
                                    position='right center'
                                />}
                            />
                            <input
                                name="targetLoad"
                                className='darkModeInput'
                                value={targetLoad}
                                onChange={onChange}
                                type="text"
                                placeholder="Input Target Load"
                            />
                        </div>
                        <div id='percentagesInputContainer'>
                            <InputLabel
                                text='Percentages &nbsp;'
                                toolTip={<Popup
                                    basic
                                    trigger={<Icon name='question circle outline' />}
                                    content='Choose weekly percentage increases of load. This will determine how fast you reach your goal.'
                                    position='right center'
                                />}
                            />
                            <input
                                className='darkModeInput'
                                name="percentages"
                                value={percentages}
                                onChange={onChange}
                                type="text"
                                placeholder="Input Percentages"
                            />
                        </div>
                    </div>
                    <div id='calcLoadsBtnContainer'>
                        <Button className='lightPurpleButton-inverted' type="submit">
                            Calculate Loads
                        </Button>
                    </div>
                </form>
            </div>
            <div id='progPredictiveGraph'>
                <InputLabel
                    custID='progPredictiveGraphLabel'
                    text='Theoretical Load Projection &nbsp;'
                    toolTip={<Popup
                        basic
                        trigger={<Icon name='question circle outline' />}
                        content='Shows a theoretical weekly loading progression of your most recent training session based on percentage increases.'
                        position='right center'
                    />}
                />
                <ResponsiveContainer width="100%" height={315} >
                    <LineChart data={safetyChartData}
                        margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                        <CartesianGrid />
                        <XAxis dataKey="name"
                            tick={{ fill: 'white' }}
                        />
                        <YAxis label={{ dx: -30, value: "Load", angle: -90 }} tick={{ fill: 'white' }} />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine y={safetyChartThreshold} label="Target Load" stroke="#fc868c" />
                        {reChartSeriesHtml(graphSeries)}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
};


const reChartSeriesHtml = (seriesNames) => {
    return (seriesNames.map(series => {
        return (
            <Line key={series} type="monotone" dataKey={series} stroke={randomColour()} />
        )
    }))
}


export default ProgressionPredictiveGraph