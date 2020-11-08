import React, { Component } from 'react'
import { withAuthorisation } from '../Session';

import { Button, Container, Row, Col, Dropdown } from 'react-bootstrap'

import { Table, Grid } from 'semantic-ui-react'

import { useTable, useFilters, useGlobalFilter, usePagination } from 'react-table'
import { DefaultColumnFilter, GlobalFilter, fuzzyTextFilterFn } from './filterSearch'

const AvailableExercisesList = ({ columns, data }) => {

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
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,


        // For search filter
        state,
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
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
                                <Table.HeaderCell {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                    {/* Render the columns filter UI */}
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                </Table.HeaderCell>
                            ))}
                        </Table.Row>
                    ))}
                    <Table.Row>
                        <Table.HeaderCell
                            colSpan={visibleColumns.length}
                            style={{
                                textAlign: 'left',
                            }}
                        >
                            <GlobalFilter
                                preGlobalFilteredRows={preGlobalFilteredRows}
                                globalFilter={state.globalFilter}
                                setGlobalFilter={setGlobalFilter}
                            />
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <Table.Row {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <Table.Cell {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                                })}
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
            <Container>
                <Grid divided='vertically'>
                    <Grid.Row colums={3}>
                        <Grid.Column width={5}>
                            <Button variant="dark" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                {'<<'}
                            </Button>{' '}
                            <Button variant="dark" onClick={() => previousPage()} disabled={!canPreviousPage}>
                                {'<'}
                            </Button>{' '}
                            <Button variant="dark" onClick={() => nextPage()} disabled={!canNextPage}>
                                {'>'}
                            </Button>{' '}
                            <Button variant="dark" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                                {'>>'}
                            </Button>{' '}
                        </Grid.Column>

                        <Grid.Column>
                            <span>
                                Page{' '}
                                <strong>
                                    {pageIndex + 1} of {pageOptions.length}
                                </strong>{' '}
                            </span>
                            <span>
                                | Go to page:{' '}
                                <input
                                    type="number"
                                    defaultValue={pageIndex + 1}
                                    onChange={e => {
                                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                                        gotoPage(page)
                                    }}
                                    style={{ width: '100px' }}
                                />
                            </span>{' '}
                        </Grid.Column>

                        <Grid.Column>
                            <Dropdown>
                                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                                    {pageSize}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {[10, 20, 30, 40, 50].map(pageSize => (
                                        <Dropdown.Item
                                            as="button"
                                            onClick={e => {
                                                setPageSize(Number(e.target.value))
                                            }}
                                            key={pageSize} value={pageSize}>
                                            Show {pageSize}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                {/* <Row className="justify-content-md-center">
                    <div className="pagination">
                        <Col xs={5}>
                            <Button variant="dark" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                {'<<'}
                            </Button>{' '}
                            <Button variant="dark" onClick={() => previousPage()} disabled={!canPreviousPage}>
                                {'<'}
                            </Button>{' '}
                            <Button variant="dark" onClick={() => nextPage()} disabled={!canNextPage}>
                                {'>'}
                            </Button>{' '}
                            <Button variant="dark" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                                {'>>'}
                            </Button>{' '}
                        </Col>
                        <Col xs={7}>
                            <span>
                                Page{' '}
                                <strong>
                                    {pageIndex + 1} of {pageOptions.length}
                                </strong>{' '}
                            </span>
                            <span>
                                | Go to page:{' '}
                                <input
                                    type="number"
                                    defaultValue={pageIndex + 1}
                                    onChange={e => {
                                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                                        gotoPage(page)
                                    }}
                                    style={{ width: '100px' }}
                                />
                            </span>{' '}
                        </Col>
                        <Col>
                            <Dropdown>
                                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                                    {pageSize}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {[10, 20, 30, 40, 50].map(pageSize => (
                                        <Dropdown.Item
                                            as="button"
                                            onClick={e => {
                                                setPageSize(Number(e.target.value))
                                            }}
                                            key={pageSize} value={pageSize}>
                                            Show {pageSize}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </div>
                </Row> */}
            </Container>
        </>
    )
};



const condition = authUser => !!authUser;
export default withAuthorisation(condition)(AvailableExercisesList);
