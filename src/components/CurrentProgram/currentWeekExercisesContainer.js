import React, { useState } from 'react';
import { useTable } from 'react-table'
// import { Tabs, Tab, Pagination } from 'react-bootstrap'
import { Table, Accordion, Icon } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'

// Import Custom functions needed
import { convertTotalDaysToUIDay } from '../../constants/dayCalculations'

const CurrentWeekExercisesContainer = ({
    dailyExercises,
    loadingScheme,
    daysInWeekScope,
    daysViewHandler,
    openDaysUI }) => {

    return (
        <div className='exerciseTableContainer'>
            {
                [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                    var day = daysInWeekScope[dayIndex]
                    if (dailyExercises[day].length > 0) {
                        return (
                            <ExerciseTableContainer
                                key={day}
                                dayText={'Day ' + convertTotalDaysToUIDay(day)}
                                tableData={dailyExercises[day]}
                                tableScheme={loadingScheme}
                                initVisib={true}
                                defaultOpen={openDaysUI[dayIndex]}
                                clickHandler={daysViewHandler}
                                dayIndex={dayIndex}
                            />
                        )
                    }
                })
            }
        </div >
    )
}

const ExerciseTableContainer = ({ dayText, tableData, tableScheme, initVisib, defaultOpen, clickHandler, dayIndex }) => {

    const [tableVisible, setTableVisible] = useState(defaultOpen)

    const containerIndex = dayIndex

    const iconString = tableVisible ? 'caret down' : 'caret right'

    const handleOpenClose = (event) => {
        clickHandler(containerIndex)
        setTableVisible(!tableVisible)
    }

    return (
        < div>
            <div className='clickableDiv' onClick={handleOpenClose}>

                <InputLabel
                    text={dayText}
                    leftIcon={<Icon name={iconString} />}
                />
            </div>
            {
                tableVisible &&
                <LoadingSchemeExTable
                    data={tableData}
                    scheme={tableScheme}
                />
            }
        </div >
    )
}

const LoadingSchemeExTable = ({ data, scheme }) => {
    if (scheme === 'rpe_time') {
        return (
            <ExerciseTableDayViewRpeTime
                data={data}
            />
        )
    } else {
        return (
            <ExerciseTableDayViewWeightReps
                data={data}
            />
        )
    }
}

const ExerciseTableDayViewRpeTime = ({ data, handleTableUpdate }) => {

    const columns = React.useMemo(
        () => [
            {
                Header: 'Exercise',
                accessor: 'exercise'
            },
            {
                Header: 'Sets',
                accessor: 'sets',

            },
            {
                Header: 'Repetitions',
                accessor: 'reps',

            },
            {
                Header: 'Time',
                accessor: 'time',
            },
            {
                Header: 'RPE',
                accessor: 'rpe',
            },
            {
                Header: '',
                accessor: 'deleteButton',
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

    const headerCellCSS = {
        textAlign: 'center',
    }

    const bodyCellCSS = {
        textAlign: 'center',
    }

    return (
        <Table celled {...getTableProps()}>
            <Table.Header>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <Table.Row {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    (column.Header === '') ?
                                        <Table.HeaderCell
                                            key={column.accessor}
                                            className='currDayExerciseBtnCol' style={headerCellCSS} {...column.getHeaderProps()}>
                                            {// Render the header
                                                column.render('Header')}
                                        </Table.HeaderCell>
                                        :

                                        <Table.HeaderCell key={column.accessor} style={bodyCellCSS} {...column.getHeaderProps()}>
                                            {// Render the header
                                                column.render('Header')}
                                        </Table.HeaderCell>
                                ))}
                        </Table.Row>
                    ))}
            </Table.Header>
            <Table.Body {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row props
                            <Table.Row {...row.getRowProps()}>
                                {// Loop over the rows cells
                                    row.cells.map(cell => {
                                        // Apply the cell props

                                        return (
                                            <Table.Cell style={bodyCellCSS} {...cell.getCellProps()}>
                                                {// Render the cell contents
                                                    cell.render('Cell')}
                                            </Table.Cell>
                                        )
                                    })}
                            </Table.Row>
                        )
                    })}
            </Table.Body>
        </Table>
    )

}

const ExerciseTableDayViewWeightReps = ({ data, handleTableUpdate }) => {

    const columns = React.useMemo(
        () => [
            {
                Header: 'Exercise',
                accessor: 'exercise'
            },
            {
                Header: 'Sets',
                accessor: 'sets',

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
                Header: 'RPE',
                accessor: 'rpe',
            },
            {
                Header: 'Time',
                accessor: 'time',
            },
            {
                Header: '',
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

    const headerCellCSS = {
        textAlign: 'center',
    }

    const bodyCellCSS = {
        textAlign: 'center',
    }

    return (
        <Table celled {...getTableProps()}>
            <Table.Header>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <Table.Row {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <Table.HeaderCell style={headerCellCSS} {...column.getHeaderProps()}>
                                        {// Render the header
                                            column.render('Header')}
                                    </Table.HeaderCell>
                                ))}
                        </Table.Row>
                    ))}
            </Table.Header>
            <Table.Body {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row props
                            <Table.Row {...row.getRowProps()}>
                                {// Loop over the rows cells
                                    row.cells.map(cell => {
                                        // Apply the cell props
                                        return (
                                            <Table.Cell style={bodyCellCSS} {...cell.getCellProps()}>
                                                {// Render the cell contents
                                                    cell.render('Cell')}
                                            </Table.Cell>
                                        )
                                    })}
                            </Table.Row>
                        )
                    })}
            </Table.Body>
        </Table>
    )

}


export default CurrentWeekExercisesContainer;
export { ExerciseTableContainer }
