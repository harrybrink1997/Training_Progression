import React, { Component, useEffect, useState } from 'react'
import { withAuthorisation } from '../Session';

import { Table, Button, Container, Row, Col, Dropdown } from 'react-bootstrap'

import { useTable, useFilters, useGlobalFilter, usePagination, useRowSelect } from 'react-table'
import { DefaultColumnFilter, GlobalFilter, fuzzyTextFilterFn, SelectColumnFilter } from './filterSearch'
import { AddExerciseButton } from './progressionPageButtons'

class ExerciseTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            exercises: [],
            tableData: {
                columns: [],
                data: []
            },

        }
    }

    setColumns = () => {
        return (
            [
                {
                    Header: 'Exercise Name',
                    accessor: 'exercise',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Primary Muscles',
                    accessor: 'primMusc',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Secondary Muscles',
                    accessor: 'secMusc',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Experience Level',
                    accessor: 'expLevel',
                    Filter: SelectColumnFilter,
                    filter: 'includes',
                },
                {
                    Header: 'Add Me',
                    accessor: 'addExerciseBtn',
                }
            ]
        )
    }



    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.exercises().on('value', snapshot => {
            const exerciseObject = snapshot.val();
            console.log(exerciseObject)
            const exerciseList = Object.keys(exerciseObject).map(key => ({
                uid: key,
                primary: exerciseObject[key].primary,
                secondary: exerciseObject[key].secondary,
                experience: exerciseObject[key].experience,
                name: this.props.underscoreToSpaced(key)
            }));

            this.setState({
                exercises: exerciseList,
                tableData: {
                    columns: this.setColumns(),
                    data: this.setChartData(exerciseList),
                },
                loading: false,
            });

            console.log(this.state)

        });
    }

    componentWillUnmount() {
        this.props.firebase.exercises().off();
    }

    setChartData = (exerciseList) => {
        var tableData = []

        exerciseList.forEach(exercise => {
            tableData.push({
                exercise: exercise.name,
                primMusc: exercise.primary.join(', '),
                secMusc: exercise.secondary.join(', '),
                expLevel: exercise.experience,
                addExerciseBtn: <AddExerciseButton buttonHandler={this.props.handleAddExerciseButton} uid={exercise.uid} primaryMusc={exercise.primary} />
            })
        })

        return tableData
    }

    render() {
        const { tableData, loading } = this.state;

        return (
            <div>
                <h1>Exercise Table</h1>

                {loading && <div>Loading ...</div>}
                <ExerciseList columns={tableData.columns} data={tableData.data} />


            </div>
        );
    }
}

const ExerciseList = ({ columns, data }) => {

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
            <Table striped bordered hover variant="dark" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                    {/* Render the columns filter UI */}
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                </th>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <th
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
                        </th>
                    </tr>
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
            <Container>
                <Row className="justify-content-md-center">
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
                </Row>
            </Container>
        </>
    )
};



const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ExerciseTable);
