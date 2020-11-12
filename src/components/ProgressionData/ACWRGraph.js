import React from 'react'
import { ComposedChart, Area, Line, Brush, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const ACWEGraph = ({ ACWRData }) => {

    const hasGraphData = ACWRData != [] && ACWRData != undefined

    return (
        <div>
            { hasGraphData &&
                <ComposedChart width={600} height={400} data={ACWRData}
                    margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
                    <XAxis dataKey="name" label={{ value: "Date", position: 'insideBottomRight', offset: 0 }} />

                    <YAxis yAxisId="left" label={{ value: "Load", angle: -90 }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: "Acute Workload Ratio (ACWR)", angle: 90 }} />

                    <Tooltip />
                    <Legend />
                    <Brush />
                    <CartesianGrid stroke='#f5f5f5' />
                    <Area yAxisId="left" type='monotone' dataKey='Chronic Load' fill='#03a734' stroke='#028e2c' />
                    <Bar yAxisId="left" dataKey='Acute Load' barSize={20} fill='#413ea0' />
                    <Line yAxisId="right" type='monotone' dataKey='ACWR' stroke='#ff7300' />
                </ComposedChart>
            }
        </div>
    )
}

export default ACWEGraph