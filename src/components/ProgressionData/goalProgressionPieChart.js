import React, { useState } from 'react'
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip } from 'recharts'

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
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill='white'>{payload.name}</text>
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
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="white">{`${value} Completed`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate ${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};

const GoalProgressionPieChart = ({ data, chartColours }) => {

    const [activeIndex, setActiveIndex] = useState(0)

    const onPieEnter = (data, index) => {
        setActiveIndex(index)
    }

    return (
        <ResponsiveContainer width='100%' height={400}>
            <PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                    {
                        data.map((entry, index) => <Cell key={index} fill={chartColours[index]} />)
                    }
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
}

export default GoalProgressionPieChart