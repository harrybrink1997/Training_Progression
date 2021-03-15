import React, { useEffect } from 'react'

import { Table } from 'semantic-ui-react'
import { useTable, } from 'react-table'
import useWindowDimensions from '../PageStructure/pageSize'

const BasicTable = ({ columns, data, header = true }) => {

    const { width } = useWindowDimensions()

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        rows
    } = useTable(
        {
            columns,
            data
        },

    )

    return (
        <>
            <Table celled {...getTableProps()}>
                {
                    header && width > 750 &&
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
                        return (
                            <Table.Row {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <Table.Cell style={{ textAlign: 'center' }} {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                })}
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
        </>
    )
};

export default BasicTable