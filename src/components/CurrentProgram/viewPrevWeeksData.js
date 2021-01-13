import React, { useState } from 'react'
import { Modal, Button, Form, Pagination, Input } from 'semantic-ui-react'
import ExerciseTableContainerNoBtns from '../CustomComponents/exerciseTablesNoBtns'
import InputLabel from '../CustomComponents/DarkModeInput'

const ViewPrevWeeksData = ({ handleFormSubmit, data, defaultWeek, progScheme }) => {

    const historicalData = data
    const [currWeek, setCurrWeek] = useState(defaultWeek)
    const scheme = progScheme

    const handleSubmit = (event, isCopyWeek = true, dayToCopy = undefined, insertionDay = undefined) => {
        if (isCopyWeek) {
            event.preventDefault()
            handleFormSubmit(historicalData[currWeek], undefined)
        } else {
            console.log(insertionDay)
            console.log(historicalData[currWeek][dayToCopy])
            handleFormSubmit(historicalData[currWeek][dayToCopy], insertionDay)
        }
    }

    const handlePageChange = (event, data) => {
        setCurrWeek(data.activePage)
    }

    const handleCopyDayButton = (dayToCopy, insertionDay) => {
        console.log(dayToCopy)
        console.log(insertionDay)
        handleSubmit(undefined, false, dayToCopy, insertionDay)
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
        <div>
            <InputLabel
                text={currWeek === 0 ? 'Sorry, there is no previous exercise data to show.' : 'Previous Exercise Data'}
                custID='noPrevWeekExerciseDataHeader'
            />
            {
                currWeek > 0 &&
                < Form onSubmit={handleSubmit}>
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
                                                copyDays={true}
                                                copyDayHandler={handleCopyDayButton}
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
            }

        </div >
    );
}

export default ViewPrevWeeksData;