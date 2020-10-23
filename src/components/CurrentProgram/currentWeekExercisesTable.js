import React from 'react';
import { useTable } from 'react-table'
import Table from 'react-bootstrap/Table'


const CurrentWeekExercisesTable = ({ currentWeekExercises, newExercise }) => {

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

    const data = currentWeekExercises



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



export default CurrentWeekExercisesTable;