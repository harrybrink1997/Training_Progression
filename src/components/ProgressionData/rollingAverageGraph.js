import React, { useState } from 'react';

import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip, Legend } from 'recharts'

const RollingAverageGraph = ({ graphData, graphSeries, currentWeek }) => {

    const hasGraphData = graphData != []

    return (
        <div>
            {hasGraphData && <LineChart width={800} height={500} data={graphData}
                margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {reChartSeriesHtml(graphSeries)}
            </LineChart>}
            {!hasGraphData && < div > There is no progression data for this body. Add data in current programs section. For greater accuracy check back on week {currentWeek + 4}. This will allow a month loading data to be accumulated. </div>}

        </div >
    )
};

const reChartSeriesHtml = (seriesNames) => {
    return (seriesNames.map(series => {
        if (series != 'Actual Loading') {
            return (
                <Line key={series} type="monotone" dataKey={series} stroke='red' />
            )
        } else {
            return (
                <Line key={series} type="monotone" dataKey={series} stroke='blue' />
            )
        }
    }))
}

export default RollingAverageGraph