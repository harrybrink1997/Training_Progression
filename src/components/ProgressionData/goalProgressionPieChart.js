import React, { useState } from 'react'
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Label } from 'recharts'

// const data = [{ name: 'Group A', value: 400 }, { name: 'Group B', value: 300 },
// { name: 'Group C', value: 300 }, { name: 'Group D', value: 200 }];


const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
        </g>
    );
};

const GoalProgressionPieChart = ({ data, chartColours }) => {

    const [activeIndex, setActiveIndex] = useState(0)

    const initialisePercentage = (d) => {

        var targetVal = d[0].value
        var totalVal = 0
        Object.values(d).forEach(type => {
            totalVal += type.value
        })

        return targetVal / totalVal

    }

    const [name, setName] = useState(data[0].name)
    const [percent, setPercent] = useState(initialisePercentage(data))
    const [value, setValue] = useState(data[0].value)

    const onPieEnter = (data, index) => {
        setActiveIndex(index)
        setPercent(data.percent)
        setName(data.name)
        setValue(data.value)
        console.log(data)
    }

    return (
        <ResponsiveContainer width='100%' height={300}>
            <PieChart margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={data}
                    cy={150}
                    innerRadius={60}
                    outerRadius={80}
                    onMouseEnter={onPieEnter}
                    dataKey='value'
                >
                    <Label
                        value={name} position="centerBottom" className='label-top' fontSize='27px'
                    />
                    <Label
                        value={value + ' Completed'} position="centerTop" className='label'
                    />
                    <Label
                        value={`${(percent * 100).toFixed(2)}%`} position="centerTop" className='label-bottom'
                    />
                    {
                        data.map((entry, index) => <Cell key={index} fill={chartColours[index]} />)
                    }
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
}

export default GoalProgressionPieChart