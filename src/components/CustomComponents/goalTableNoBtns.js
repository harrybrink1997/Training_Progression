import React, { useState, useEffect } from 'react'
import { Icon, Table } from 'semantic-ui-react'
import { useTable, useExpanded } from 'react-table'

export const GoalsTableNoBtns = ({ data }) => {

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
                Header: 'Description',
                accessor: 'description',

            },
            {
                Header: 'Difficulty',
                accessor: 'difficulty',
            },
            {
                Header: 'Target Close Date',
                accessor: 'targetCloseDate',
            },
            {
                Header: 'Progress',
                accessor: 'progressString',
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
                {headerGroups.map(headerGroup => (
                    <Table.Row {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <Table.HeaderCell {...column.getHeaderProps()}>{column.render('Header')}</Table.HeaderCell>
                        ))}
                    </Table.Row>
                ))}
            </Table.Header>
            <Table.Body {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    console.log(row)
                    if (row.depth == 1) {
                        return (
                            <Table.Row className='react-table-expandedChildRow' {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <Table.Cell {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                })}
                            </Table.Row>
                        )
                    } else {
                        return (
                            <Table.Row {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <Table.Cell {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                })}
                            </Table.Row>
                        )
                    }
                })}
            </Table.Body>
        </Table>
    )

}


export default GoalsTableNoBtns