import React, { useEffect, useState } from 'react'

import { Dropdown, Table, Grid, Container, Button, Input, Checkbox } from 'semantic-ui-react'

import { useTable, useFilters, useGlobalFilter, usePagination } from 'react-table'
import { DefaultColumnFilter, fuzzyTextFilterFn } from '../../constants/tableFiltering'
import useWindowDimensions from '../PageStructure/pageSize'

const BasicTablePagination = ({ columns, data }) => {
    const { width } = useWindowDimensions()

    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id]
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true
                })
            },
        }),
        []
    )

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )



    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,

        // For pagenation
        canPreviousPage,
        canNextPage,
        pageOptions,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,


        // For search filter
        state: { pageIndex, pageSize }
    } = useTable(
        {
            columns,
            data,
            defaultColumn, // Be sure to pass the defaultColumn option
            filterTypes,
        },
        useFilters,
        useGlobalFilter,
        usePagination,

    )

    return (
        <>
            <Table celled {...getTableProps()}>

                <Table.Header>
                    {headerGroups.map(headerGroup => (
                        <Table.Row {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                (column.Header == '') ?
                                    <Table.HeaderCell key={column.accessor} />
                                    :
                                    <Table.HeaderCell style={{ textAlign: 'center' }} {...column.getHeaderProps()}>
                                        {column.render('Header')}
                                        {/* Render the columns filter UI */}
                                        <div>{column.canFilter ? column.render('Filter') : null}</div>
                                    </Table.HeaderCell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Header>
                <Table.Body {...getTableBodyProps()}>
                    {page.map((row, i) => {
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
            <Container style={{ 'marginTop': '10px' }}>
                <Grid divided='vertically'>
                    <Grid.Row colums={3}>
                        <Grid.Column width={6}>
                            <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                                {'<'}
                            </Button>{' '}
                            <Button onClick={() => nextPage()} disabled={!canNextPage}>
                                {'>'}
                            </Button>{' '}
                        </Grid.Column>

                        <Grid.Column width={8}>
                            <span>
                                Page{' '}
                                <strong>
                                    {pageIndex + 1} of {pageOptions.length}
                                </strong>{' '}
                            </span>
                            <span>
                                | Go to page:{'  '}
                                <Input
                                    size='mini'
                                    defaultValue={pageIndex + 1}
                                    onChange={e => {
                                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                                        gotoPage(page)
                                    }}
                                    style={{ width: '100px' }}
                                />
                            </span>{' '}
                        </Grid.Column>

                        <Grid.Column width={2}>
                            <PagenationDropdown buttonHandler={setPageSize} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </>
    )
};

const PagenationDropdown = ({ buttonHandler }) => {

    const processData = () => {

        var returnData = []
        var sizeArray = ['10', '20', '30', '40', '50']
        sizeArray.forEach(size => {
            returnData.push({
                key: size,
                value: size,
                text: size
            })
        })
        return returnData
    }

    const handleChange = (event, { value }) => {
        setActiveSize(value)
        buttonHandler(Number(value))
    }


    const [dropDownData] = useState(processData())
    const [activeSize, setActiveSize] = useState('10')

    return (
        <Dropdown
            selection
            fluid
            text={activeSize}
            onChange={handleChange}
            options={dropDownData}
            defaultValue={'10'}
        />
    )

}



export default BasicTablePagination
