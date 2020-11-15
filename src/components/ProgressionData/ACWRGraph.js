import React from 'react'
import { ComposedChart, LineChart, Area, Line, Brush, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts'

import InputLabel from '../CustomComponents/DarkModeInput'

const SynchronousACWRGraphs = ({ ACWRData, rollChronicACWRData, rollChronicACWRDataSeries, }) => {

    return (
        <div>
            <ACWEGraph ACWRData={ACWRData} />
            <RollChronicACWRGraph graphData={rollChronicACWRData} graphSeries={rollChronicACWRDataSeries} />
        </div>
    )
}


const ACWEGraph = ({ ACWRData }) => {

    const hasGraphData = ACWRData != [] && ACWRData != undefined

    return (
        <div>
            { hasGraphData &&
                <ComposedChart width={700} height={400} data={ACWRData} syncId="synchronousACWRGraphs"
                    margin={{ top: 20, right: 50, bottom: 20, left: 5 }}>
                    <XAxis
                        dataKey="name"
                        tick={{ fill: 'white' }}
                        domain={['dataMin', 'dataMax']}
                    />

                    <YAxis
                        yAxisId="left"
                        tick={{ fill: 'white' }}
                        label={{ dx: -30, value: "Load", angle: -90, id: 'yaxislabel' }}

                    />
                    <YAxis
                        yAxisId="right"
                        tick={{ fill: 'white' }}
                        orientation="right"
                        label={{ dx: 30, value: "Acute Workload Ratio (ACWR)", angle: 90 }}
                    />

                    <Tooltip />
                    <Legend />
                    <Brush dataKey='name' data={ACWRData} height={30} />
                    <CartesianGrid stroke='#f5f5f5' />
                    <Area yAxisId="left" type='monotone' dataKey='Chronic Load' fill='#86fcbb' stroke='#8cfc86' />
                    <Bar yAxisId="left" dataKey='Acute Load' barSize={20} fill='#bb86fc' />
                    <Line yAxisId="right" type='monotone' dataKey='ACWR' stroke='#fcbb86' />
                </ComposedChart>
            }
        </div>
    )
}

const RollChronicACWRGraph = ({ graphData, graphSeries }) => {

    const hasGraphData = graphData != []

    return (
        <div>
            {hasGraphData &&
                <LineChart width={600} height={400} data={graphData} syncId="synchronousACWRGraphs"
                    margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
                    <CartesianGrid />
                    <XAxis dataKey="name" tick={{ fill: 'white' }} />
                    <YAxis label={{ dx: -30, value: "Load", angle: -90 }} tick={{ fill: 'white' }} />
                    <Tooltip />
                    <Legend dy={-5} />
                    {reChartSeriesHtml(graphSeries)}
                </LineChart>}
        </div >
    )
};

const reChartSeriesHtml = (seriesNames) => {
    return (seriesNames.map(series => {
        if (series != 'Actual Loading') {
            return (
                <Line key={series} type="monotone" dataKey={series} stroke='#fc868c' />
            )
        } else {
            return (
                <Line key={series} type="monotone" dataKey={series} stroke='#86c7fc' />
            )
        }
    }))
}

export { ACWEGraph, SynchronousACWRGraphs }