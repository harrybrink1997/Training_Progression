import React, { useState } from 'react'
import { Modal, Button, Form, Pagination } from 'semantic-ui-react'
import ExerciseTableContainerNoBtns from '../CustomComponents/exerciseTablesNoBtns'
import InputLabel from '../CustomComponents/DarkModeInput'

const ExerciseHistoryModal = ({ data, defaultWeek, progScheme }) => {

    const [show, setShow] = useState(false);
    const historicalData = data
    const [currWeek, setCurrWeek] = useState(defaultWeek)
    const scheme = progScheme

    const handleClose = (event) => {
        setShow(false);
    }

    const handlePageChange = (event, data) => {
        setCurrWeek(data.activePage)
    }

    const generateTableData = (dayData) => {
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
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger=
            {
                currWeek != 0 &&
                <Button className='lightPurpleButton-inverted'>View Exercise History</Button>
            }
        >
            <Modal.Header>Program Exercise History</Modal.Header>

            <Modal.Content>
                {
                    Object.keys(historicalData).length > 0 ?
                        <div>
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
                        </div>
                        :
                        <div id='noExPromptContainer'>
                            <div id='ppNoExPromptLabelContainer'>
                                <InputLabel text='No Historical Exercise Data' custID='ppNoExPromptLabel' />
                            </div>
                        </div>
                }

                {
                    (historicalData[currWeek] != undefined) ?
                        Object.keys(historicalData[currWeek]).map(day => {
                            if (Object.keys(historicalData[currWeek][day]).length != 0) {
                                return (
                                    <div
                                        key={day}
                                        id='cpPrevExModalDayContainer'>
                                        <ExerciseTableContainerNoBtns
                                            key={day}
                                            dayText={'Day ' + day}
                                            tableScheme={scheme}
                                            tableData={generateTableData(historicalData[currWeek][day])}
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
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose}>Close</Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ExerciseHistoryModal;