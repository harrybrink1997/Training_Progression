import React, { useState } from 'react';
import { useTable } from 'react-table'
import { Table, Tabs, Tab, Pagination, Nav, Col, Row } from 'react-bootstrap'

const CurrentWeekExercisesContainer = ({ currentWeekExercises, tabHandler, dayPaginationHandler, dailyExercises }) => {

    const [currentTab, setCurrentTab] = useState('dayView')

    const [currentPage, setCurrentPage] = useState('1')

    const setExerciseList = (list) => {
        if (list == {}) {
            return []
        } else {
            return dailyExercises['1']
        }
    }

    const [currentExerciseList, setCurrentExerciseList] = useState(setExerciseList(dailyExercises))


    const handleChangeTab = (key) => {
        setCurrentTab(key)
        tabHandler(key)
    }

    const handleChangeDay = (currentDay) => {

        setCurrentPage(currentDay)
        dayPaginationHandler(currentDay)
        setCurrentExerciseList(dailyExercises[currentDay])

    }



    return (
        <Tabs
            id="currentProgramViewTabs"
            activeKey={currentTab}
            onSelect={(key) => { handleChangeTab(key) }}>
            <Tab
                eventKey="dayView"
                title="Day View"
            >
                <Row className="justify-content-md-center">
                    <Col>
                        <Row className="justify-content-md-center">
                            <DayViewPagenation
                                currentExerciseList={currentExerciseList}
                                buttonHandler={handleChangeDay}
                            />
                        </Row>
                        <ExerciseTableDayView
                            data={currentExerciseList}
                        />
                    </Col>
                </Row>

            </Tab>
            <Tab
                eventKey="weekView"
                title="Week View"
            >
                <div> week view</div>
                <ExerciseTableDayView
                    data={currentWeekExercises}
                />
            </Tab>
        </Tabs>
    )
}

const DayViewPagenation = ({ buttonHandler }) => {
    const [currentDay, setCurrentDay] = useState("1")

    const handleChangeDayClick = (event) => {
        setCurrentDay(event.target.value)
        buttonHandler(event.target.value)
    }

    const days = [1, 2, 3, 4, 5, 6, 7]
    return (
        <Pagination>
            {days.map(day => {
                return (
                    <Pagination.Item
                        as="button"
                        key={day}
                        onClick={handleChangeDayClick}
                        active={day == currentDay}
                        value={day}
                    >
                        Day {day}
                    </Pagination.Item>
                )
            })}
        </Pagination>
    )
}



const ExerciseTableDayView = ({ data }) => {

    const columns = React.useMemo(
        () => [
            {
                Header: 'Exercise',
                accessor: 'exercise'
            },
            {
                Header: 'RPE',
                accessor: 'rpe'
            },
            {
                Header: 'Time',
                accessor: 'time'
            },
            {
                Header: 'Repetitions',
                accessor: 'reps'
            },
            {
                Header: 'Weight',
                accessor: 'weight'
            },
            {
                Header: 'Delete',
                accessor: 'deleteButton'
            }

        ],
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    })

    return (
        <Table striped bordered hover variant="dark" {...getTableProps()}>
            <thead>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <th {...column.getHeaderProps()}>
                                        {// Render the header
                                            column.render('Header')}
                                    </th>
                                ))}
                        </tr>
                    ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row props
                            <tr {...row.getRowProps()}>
                                {// Loop over the rows cells
                                    row.cells.map(cell => {
                                        // Apply the cell props
                                        return (
                                            <td {...cell.getCellProps()}>
                                                {// Render the cell contents
                                                    cell.render('Cell')}
                                            </td>
                                        )
                                    })}
                            </tr>
                        )
                    })}
            </tbody>
        </Table>
    )

}


export default CurrentWeekExercisesContainer;