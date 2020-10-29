import React, { useState } from 'react';
import { useTable } from 'react-table'
import { Table, Tabs, Tab, Pagination, Col, Row } from 'react-bootstrap'


const CurrentWeekExercisesContainer = ({
    tabHandler,
    dayPaginationHandler,
    dailyExercises,
    currentDay,
    currentView,
    handleTableUpdate }) => {

    const [currentTab, setCurrentTab] = useState(currentView)

    const [currentPage, setCurrentPage] = useState(currentDay)

    const setExerciseList = (list) => {
        if (list == {}) {
            return []
        } else {
            return dailyExercises[currentDay]
        }
    }

    const [currentExerciseList, setCurrentExerciseList] = useState(setExerciseList(dailyExercises))


    const handleChangeTab = (key) => {
        setCurrentTab(key)
        tabHandler(key)
    }

    const handleChangeDay = (dayChange) => {
        dayPaginationHandler(dayChange)
        setCurrentExerciseList(dailyExercises[dayChange])

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
                                buttonHandler={handleChangeDay}
                                currDayPage={currentPage}
                            />
                        </Row>
                        <ExerciseTableDayView
                            data={currentExerciseList}
                            handleTableUpdate={handleTableUpdate}
                        />
                    </Col>
                </Row>

            </Tab>
            <Tab
                eventKey="weekView"
                title="Week View"
            >
                <Col>
                    {['1', '2', '3', '4', '5', '6', '7'].map(day => {
                        return (
                            <div key={day}>
                                <h4>Day {day}</h4>
                                <ExerciseTableDayView
                                    data={dailyExercises[day]}
                                />
                            </div>
                        )
                    })}
                </Col>
            </Tab>
        </Tabs>
    )
}

const DayViewPagenation = ({ buttonHandler, currDayPage }) => {
    const [currentDay, setCurrentDay] = useState(currDayPage)

    const handleChangeDayClick = (event) => {
        if (event.target.value != null) {
            setCurrentDay(event.target.value)
            buttonHandler(event.target.value)
        }
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
                        cursor="pointer"
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



const ExerciseTableDayView = ({ data, handleTableUpdate }) => {

    const columns = React.useMemo(
        () => [
            {
                Header: 'Exercise',
                accessor: 'exercise'
            },
            {
                Header: 'RPE',
                accessor: 'rpe',
            },
            {
                Header: 'Time',
                accessor: 'time',
            },
            {
                Header: 'Repetitions',
                accessor: 'reps',

            },
            {
                Header: 'Weight',
                accessor: 'weight',
            },
            {
                Header: 'Delete',
                accessor: 'deleteButton'
            }

        ],
        []
    )


    const passTableDataUpStream = (row, col, value, ref) => {

        handleTableUpdate(
            rows[row].values.deleteButton.props.uid,
            col,
            value,
            ref
        )

    }

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
        passTableDataUpStream
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
