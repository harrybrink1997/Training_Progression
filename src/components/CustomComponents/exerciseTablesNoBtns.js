import React, { useState } from 'react';
import { useTable } from 'react-table'
// import { Tabs, Tab, Pagination } from 'react-bootstrap'
import { Table, Accordion, Icon } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'
import CopyExerciseDayDataModal from './copyDayExerciseDataModal'

const ExerciseTableContainerNoBtns = ({ dayText, tableData, tableScheme, defaultOpen, dayIndex, copyDays, copyDayHandler }) => {

    const [tableVisible, setTableVisible] = useState(defaultOpen)

    const containerIndex = dayIndex

    const iconString = tableVisible ? 'caret down' : 'caret right'

    const handleOpenClose = (event) => {
        setTableVisible(!tableVisible)
    }

    const handleCopyDayClick = (dayToCopy, insertionDay) => {
        copyDayHandler(dayToCopy, insertionDay)
    }

    return (
        < div>
            <div className='exerciseTableContainerHeaderDivContainer' onClick={handleOpenClose}>
                <InputLabel
                    text={dayText}
                    leftIcon={<Icon name={iconString} />}
                />
            </div>
            {
                copyDays && tableVisible &&
                <div className='copyDayExerciseDataTextTriggerContainer'>
                    <CopyExerciseDayDataModal
                        defaultDay={parseInt(dayText.split(' ')[1])}
                        handleFormSubmit={handleCopyDayClick}
                    />
                </div>
            }
            {
                tableVisible && <LoadingSchemeExTable data={tableData} scheme={tableScheme} />
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
                                        <Table.HeaderCell className='currDayExerciseBtnCol' style={headerCellCSS} {...column.getHeaderProps()}>
                                            {// Render the header
                                                column.render('Header')}
                                        </Table.HeaderCell>
                                        :

                                        <Table.HeaderCell style={bodyCellCSS} {...column.getHeaderProps()}>
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

export default ExerciseTableContainerNoBtns
export { LoadingSchemeExTable }