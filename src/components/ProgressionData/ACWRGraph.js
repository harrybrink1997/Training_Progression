import React from 'react'
import { ComposedChart, LineChart, Area, Line, Brush, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Label } from 'semantic-ui-react'

import InputLabel from '../CustomComponents/DarkModeInput'

const ACWEGraph = ({ ACWRData }) => {

    const hasGraphData = ACWRData != [] && ACWRData != undefined

    return (
        <>
            { hasGraphData &&
                <ResponsiveContainer width='100%' height={310}>
                    <ComposedChart
                        data={ACWRData}
                        syncId="synchronousACWRGraphs"
                        margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
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
                        <CartesianGrid stroke='#f5f5f5' />
                        <Area yAxisId="left" type='monotone' dataKey='Chronic Load' fill='#86fcbb' stroke='#8cfc86' />
                        <Bar yAxisId="left" dataKey='Acute Load' barSize={20} fill='#bb86fc' />
                        <Line yAxisId="right" type='monotone' dataKey='ACWR' stroke='#fcbb86' />
                    </ComposedChart>
                </ResponsiveContainer>
            }
        </>
    )
}

const RollChronicACWRGraph = ({ graphData, graphSeries }) => {

    const hasGraphData = graphData != []

    return (
        <>
            {hasGraphData &&
                <ResponsiveContainer width='100%' height={310}
                >

                    <LineChart data={graphData}
                        height={315} width={500} syncId="synchronousACWRGraphs"
                        margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                        <CartesianGrid />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: 'white' }}
                        // padding={{ left: 110, right: 110 }}
                        />
                        <YAxis label={{ dx: -30, value: "Load", angle: -90 }} tick={{ fill: 'white' }}
                        />
                        <Tooltip />
                        <Legend />

                        {reChartSeriesHtml(graphSeries)}
                    </LineChart>
                </ResponsiveContainer>
            }
        </>
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

export { ACWEGraph, RollChronicACWRGraph }