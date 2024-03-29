import React, { useState } from 'react'
import { Icon, Table } from 'semantic-ui-react'
import { useTable, useExpanded } from 'react-table'

export const LoadingSpreadStatsTable = ({ data }) => {

    const columns = React.useMemo(
        () => [
            {
                // Build our expander column
                id: 'expander', // Make sure it has an ID
                Cell: ({ row }) =>
                    // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                    // to build the toggle for expanding a row
                    row.canExpand ? (
                        <span
                            {...row.getToggleRowExpandedProps({
                                style: {
                                    // We can even use the row.depth property
                                    // and paddingLeft to indicate the depth
                                    // of the row
                                    paddingLeft: `${row.depth * 2}rem`,
                                },
                            })}
                        >
                            {row.isExpanded ? <Icon name='caret down' /> : <Icon name='caret right' />}
                        </span>
                    ) : null,
            },
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
        state: { expanded },
    } = useTable(
        {
            columns,
            data,
        },
        useExpanded
    )

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

                        console.log(row.values)

                        if (parseFloat(row.values.currDayLoad) > parseFloat(row.values.maxSafeLoad) ||
                            parseFloat(row.values.currDayLoad) < parseFloat(row.values.minSafeLoad)) {

                            if (row.depth == 1) {
                                return (
                                    // Apply the row props
                                    <Table.Row className='invalidTableValues react-table-expandedChildRow' {...row.getRowProps()}>
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
                            }
                        } else {
                            if (row.depth == 1) {
                                return (
                                    // Apply the row props
                                    <Table.Row className='validTableValues react-table-expandedChildRow' {...row.getRowProps()}>
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

                        }
                    })}
            </Table.Body>
        </Table>

    )

}
