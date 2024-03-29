import React, { useState } from 'react'
import { Table } from 'semantic-ui-react'
import { useTable } from 'react-table'

const LoadInfoTable = ({ data }) => {


    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'col1'
            },
            {
                Header: '',
                accessor: 'col2',
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
            <Table.Body {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)

                        if (row.values.col1 == 'Net Increase' || row.values.col1 == 'Average Increase Per Week' || row.values.col1 == 'Percentage Increase') {
                            if (row.values.col2.charAt(0) == '-') {
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
                            } else if (row.values.col2 == '0.00') {
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
                        } else {
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
                        }
                    })}
            </Table.Body>
        </Table>
    )

}

export default LoadInfoTable