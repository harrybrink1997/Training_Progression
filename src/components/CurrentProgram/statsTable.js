import React, { useState } from 'react'
import { Icon, Table } from 'semantic-ui-react'
import { useTable } from 'react-table'

export const ExerciseSpreadStatsTable = ({ data }) => {

    const columns = React.useMemo(
        () => [
            {
                Header: 'Body Part',
                accessor: 'bodyPart'
            },
            {
                Header: 'Volume Percentage Current Week',
                accessor: 'weekVol',

            },
            {
                Header: 'Volume Percentage Program Overall',
                accessor: 'progVol',
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
        <Table celled {...getTableProps()}>
            <Table.Header>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <Table.Row {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <Table.HeaderCell {...column.getHeaderProps()}>
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
                                            <Table.Cell {...cell.getCellProps()}>
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

export const LoadingSpreadStatsTable = ({ data }) => {


    const columns = React.useMemo(
        () => [
            {
                Header: 'Body Part',
                accessor: 'bodyPart'
            },
            {
                Header: 'Load',
                accessor: 'currDayLoad',

            },
            {
                Header: 'Minimum Safe Load ',
                accessor: 'minSafeLoad',
            },
            {
                Header: 'Maximum Safe Load',
                accessor: 'maxSafeLoad',
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
        <Table celled {...getTableProps()}>
            <Table.Header>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <Table.Row {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <Table.HeaderCell {...column.getHeaderProps()}>
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
                        if (row.values.currDayLoad > row.values.maxSafeLoad ||
                            row.values.currDayLoad < row.values.minSafeLoad) {
                            return (
                                // Apply the row props
                                <Table.Row className='invalidTableValues' {...row.getRowProps()}>
                                    {// Loop over the rows cells
                                        row.cells.map(cell => {
                                            // Apply the cell props
                                            return (
                                                <Table.Cell {...cell.getCellProps()}>
                                                    {// Render the cell contents
                                                        cell.render('Cell')}
                                                </Table.Cell>
                                            )
                                        })}
                                </Table.Row>
                            )
                        } else {
                            return (
                                // Apply the row props
                                <Table.Row className='validTableValues' {...row.getRowProps()}>
                                    {// Loop over the rows cells
                                        row.cells.map(cell => {
                                            // Apply the cell props
                                            return (
                                                <Table.Cell {...cell.getCellProps()}>
                                                    {// Render the cell contents
                                                        cell.render('Cell')}
                                                </Table.Cell>
                                            )
                                        })}
                                </Table.Row>
                            )
                        }
                    })}
            </Table.Body>
        </Table>
    )

}

