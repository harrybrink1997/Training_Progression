import React, { useState } from 'react'
import { Icon, Table } from 'semantic-ui-react'
import { useTable, useExpanded } from 'react-table'

const RedGreenUnderlineBasicTable = ({ data, columns, warningThreshold, warnBelowThreshold }) => {

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
        },
    )

    return (
        <>
            <Table celled {...getTableProps()}>
                {
                    <Table.Header>
                        {headerGroups.map(headerGroup => (
                            <Table.Row {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <Table.HeaderCell style={{ textAlign: 'center' }} {...column.getHeaderProps()}>
                                        {column.render('Header')}
                                    </Table.HeaderCell>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Header>
                }
                <Table.Body {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row)
                        if (row.original.warningValue !== undefined) {
                            if (warnBelowThreshold) {
                                if (row.original.warningValue < warningThreshold && row.original.warningValue !== false) {
                                    return (
                                        <Table.Row className='redUnderlineTableRow' {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                return <Table.Cell style={{ textAlign: 'center' }} {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                            })}
                                        </Table.Row>
                                    )
                                } else {
                                    return (
                                        <Table.Row className='greenUnderlineTableRow' {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                return <Table.Cell style={{ textAlign: 'center' }} {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                            })}
                                        </Table.Row>
                                    )
                                }
                            } else {
                                if (row.original.warningValue > warningThreshold && row.original.warningValue !== false) {
                                    return (
                                        <Table.Row className='redUnderlineTableRow' {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                return <Table.Cell style={{ textAlign: 'center' }} {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                            })}
                                        </Table.Row>
                                    )
                                } else {
                                    return (
                                        <Table.Row className='greenUnderlineTableRow' {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                return <Table.Cell style={{ textAlign: 'center' }} {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                            })}
                                        </Table.Row>
                                    )
                                }
                            }
                        } else {
                            return (
                                <Table.Row {...row.getRowProps()}>
                                    {row.cells.map(cell => {
                                        return <Table.Cell style={{ textAlign: 'center' }} {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                    })}
                                </Table.Row>
                            )
                        }
                    })}
                </Table.Body>
            </Table>
        </>

    )
}

export default RedGreenUnderlineBasicTable
