import React from 'react';
import { useTable } from 'react-table'
// import { Tabs, Tab, Pagination } from 'react-bootstrap'
import { Table, Accordion } from 'semantic-ui-react'

const CurrentWeekExercisesContainer = ({
    dailyExercises,
    currentDay,
    loadingScheme,
    daysViewHandler,
    currentIndexsOpen,
    daysInWeekScope }) => {

    const handleAccordionChange = (event, data) => {
        console.log(data)
    }

    const generateAccordion = () => {

        var daysInWeek = ['1', '2', '3', '4', '5', '6', '7']
        var returnData = []

        for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
            var day = daysInWeekScope[dayIndex]
            if (dailyExercises[day].length > 0) {
                returnData.push({
                    key: daysInWeek[dayIndex],
                    title: `Day ${daysInWeek[dayIndex]}`,
                    content: {
                        content: (
                            (loadingScheme == 'rpe_time') ?
                                <ExerciseTableDayViewRpeTime
                                    data={dailyExercises[day]}
                                />
                                :
                                <ExerciseTableDayViewWeightReps
                                    data={dailyExercises[day]}
                                />
                        )
                    }
                })
            }
        }

        // daysInWeekScope.forEach(day => {
        //     if (dailyExercises[day].length > 0) {
        //         returnData.push({
        //             key: day,
        //             title: `Day ${day}`,
        //             content: {
        //                 content: (
        //                     (loadingScheme == 'rpe_time') ?
        //                         <ExerciseTableDayViewRpeTime
        //                             data={dailyExercises[day]}
        //                         />
        //                         :
        //                         <ExerciseTableDayViewWeightReps
        //                             data={dailyExercises[day]}
        //                         />
        //                 )
        //             }
        //         })
        //     }
        // })
        return returnData
    }

    const accordHTML = generateAccordion()


    return (
        <Accordion
            fluid
            styled
            defaultActiveIndex={[0]}
            exclusive={false}
            panels={accordHTML}
            onTitleClick={handleAccordionChange}
        />
        // <Container>
        //     <Grid divided='vertically'>
        //         {['1', '2', '3', '4', '5', '6', '7'].map(day => {
        //             return (
        //                 dailyExercises[day].length > 0 &&

        //                 <Grid.Row key={day}>
        //                     <Icon as='minus square' />
        //                     <Header fluid as='h4' onClick={() => { alert("ay") }}> Day {day} </Header>

        //                     {loadingScheme == 'rpe_time'
        //                         &&
        // <ExerciseTableDayViewRpeTime
        //     data={dailyExercises[day]}
        // />
        //                     }
        //                     {loadingScheme == 'weight_reps'
        //                         &&
        // <ExerciseTableDayViewWeightReps
        //     data={dailyExercises[day]}
        // />
        //                     }

        //                 </Grid.Row>
        //             )
        //         })}
        //     </Grid>
        // </Container>
    )
}

const ExerciseTableDayViewRpeTime = ({ data, handleTableUpdate }) => {

    const columns = React.useMemo(
        () => [
            {
                Header: 'Exercise',
                accessor: 'exercise'
            },
            {
                Header: 'Sets',
                accessor: 'sets',

            },
            {
                Header: 'Repetitions',
                accessor: 'reps',

            },
            {
                Header: 'Time',
                accessor: 'time',
            },
            {
                Header: 'RPE',
                accessor: 'rpe',
            },
            {
                Header: 'Delete',
                accessor: 'deleteButton'
            }

        ],
        []
    )


    const passTableDataUpStream = (row, col, value, ref) => {

        handleTableUpdate(
            rows[row].values.deleteButton.props.uid,
            col,
            value,
            ref
        )

    }

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
        passTableDataUpStream
    })



    return (
        <Table selectable celled {...getTableProps()}>
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

const ExerciseTableDayViewWeightReps = ({ data, handleTableUpdate }) => {

    const columns = React.useMemo(
        () => [
            {
                Header: 'Exercise',
                accessor: 'exercise'
            },
            {
                Header: 'Sets',
                accessor: 'sets',

            },
            {
                Header: 'Repetitions',
                accessor: 'reps',

            },
            {
                Header: 'Weight',
                accessor: 'weight',
            },
            {
                Header: 'Time',
                accessor: 'time',
            },
            {
                // Header: 'Delete',
                Header: '',
                accessor: 'deleteButton'
            }


        ],
        []
    )

    const passTableDataUpStream = (row, col, value, ref) => {

        handleTableUpdate(
            rows[row].values.deleteButton.props.uid,
            col,
            value,
            ref
        )

    }

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
        passTableDataUpStream
    })



    return (
        <Table selectable celled {...getTableProps()}>
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


export default CurrentWeekExercisesContainer;
