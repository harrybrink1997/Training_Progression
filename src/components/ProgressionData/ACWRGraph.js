import React from 'react'
import { ComposedChart, LineChart, Area, Line, Brush, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'



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
                    margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
                    <XAxis dataKey="name" />

                    <YAxis yAxisId="left" label={{ dx: -30, value: "Load", angle: -90 }} />
                    <YAxis yAxisId="right" orientation="right" label={{ dx: 30, value: "Acute Workload Ratio (ACWR)", angle: 90 }} />

                    <Tooltip cursor={{ fill: '#393F44' }} />
                    <Legend />
                    <Brush />
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ dx: -30, value: "Load", angle: -90 }} />
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