import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'




const GoalProgressionBarChart = ({ data }) => {

    return (
        <ResponsiveContainer width='100%' height={400}>
            <BarChart data={data}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: 'white' }} />
                <YAxis
                    tick={{ fill: 'white' }}
                    label={{ dx: -10, value: "Goal Count", angle: -90 }} />
                <Tooltip cursor={false} />
                <Legend />
                <Bar barSize={20} dataKey="Total" fill="#86c7fc" />
                <Bar barSize={20} dataKey="Completed" fill="#f686fc" />
            </BarChart>
        </ResponsiveContainer>
    )
}


export default GoalProgressionBarChart