import React, { useState } from 'react'
import { Modal, Button, Form, Pagination } from 'semantic-ui-react'
import ExerciseTableContainerNoBtns from '../CustomComponents/exerciseTablesNoBtns'
import InputLabel from '../CustomComponents/DarkModeInput'
const ViewPrevWeeksData = ({ handleFormSubmit, data, defaultWeek, progScheme }) => {

    const historicalData = data
    const [currWeek, setCurrWeek] = useState(defaultWeek)
    const scheme = progScheme

    const handleSubmit = (event) => {
        event.preventDefault()
        handleFormSubmit(historicalData[currWeek])
    }

    const handlePageChange = (event, data) => {
        setCurrWeek(data.activePage)
    }

    const generateHistoricalTableData = (dayData) => {
        var tableData = []
        if (scheme == 'rpe_time') {
            Object.values(dayData).forEach(exercise => {
                tableData.push({
                    exercise: exercise.exercise,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    time: exercise.time,
                    rpe: exercise.rpe
                })
            })
        } else {
            Object.values(dayData).forEach(exercise => {
                tableData.push({
                    exercise: exercise.exercise,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    time: exercise.time
                })
            })
        }
        return tableData

    }

    return (
        <Form onSubmit={handleSubmit}>
            <div id='cpPrevExModalPagContainer'>
                <Pagination
                    firstItem={null}
                    lastItem={null}
                    pointing
                    secondary
                    defaultActivePage={defaultWeek}
                    totalPages={Object.keys(data).length}
                    onPageChange={handlePageChange}
                />

            </div>
            <div>
                <InputLabel
                    text={'Week ' + currWeek}
                />
            </div>
            {
                (historicalData[currWeek] != undefined) ?
                    Object.keys(historicalData[currWeek]).map(day => {
                        if (Object.keys(historicalData[currWeek][day]).length != 0) {
                            return (
                                <div id='cpPrevExModalDayContainer'>
                                    <ExerciseTableContainerNoBtns
                                        key={day}
                                        dayText={'Day ' + day}
                                        tableScheme={scheme}
                                        tableData={generateHistoricalTableData(historicalData[currWeek][day])}
                                        defaultOpen={false}
                                        dayIndex={day}
                                    />
                                </div>
                            )
                        }
                    })
                    :
                    <></>

            }
            <Button className='submitBtn' type="submit">Copy Week</Button>
        </Form>
    );
}

export default ViewPrevWeeksData;