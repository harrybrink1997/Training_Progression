import React, { useState } from 'react'
import { Modal, Button, Statistic } from 'semantic-ui-react'
import InputLabel from '../CustomComponents/DarkModeInput'
import GoalProgressionPieChart from '../ProgressionData/goalProgressionPieChart'
import GoalTableNoBtns from '../CustomComponents/goalTableNoBtns'

const GoalHistoryModal = ({ goalTableData, goalStatsData, goalProgPieChartData }) => {

    const [show, setShow] = useState(false);

    const handleClose = (event) => {
        setShow(false);
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger=
            {<Button className='lightPurpleButton-inverted'>View Goal History</Button>}
        >
            <Modal.Header>Program Goal History</Modal.Header>

            <Modal.Content>
                {
                    goalTableData.length > 0 &&
                    <div>
                        <div id='ppGoalStatGrouping'>
                            <Statistic
                                inverted
                                size='tiny'
                                className='ppStatisticLevel1ImpLeft'
                            >
                                <Statistic.Value>
                                    {goalStatsData.numSubGoalsComplete}
                                </Statistic.Value>
                                <Statistic.Label>
                                    Sub Goals Completed
                                </Statistic.Label>
                            </Statistic>

                            <Statistic
                                inverted
                                className='statisticLevel0Imp'
                                size='small'
                            >
                                <Statistic.Value>
                                    {goalStatsData.numSubGoalsComplete + goalStatsData.numMainGoalsComplete}
                                </Statistic.Value>
                                <Statistic.Label>
                                    Total Goals Completed
                                        </Statistic.Label>
                            </Statistic>

                            <Statistic
                                inverted
                                size='tiny'
                                className='ppStatisticLevel1ImpRight'
                            >
                                <Statistic.Value>
                                    {goalStatsData.numMainGoalsComplete}
                                </Statistic.Value>
                                <Statistic.Label>
                                    Main Goals Completed
                                        </Statistic.Label>
                            </Statistic>
                        </div>
                        <div id='pastprogGoalChartsRow'>
                            <div id='ppGoalPieChartContainer'>

                                <InputLabel
                                    custID='ppGoalPieChartLabel'
                                    text='Goal Difficulty Spread'
                                />

                                <GoalProgressionPieChart
                                    data={goalProgPieChartData.data}
                                    chartColours={goalProgPieChartData.colours}
                                />
                            </div>
                        </div>
                        <InputLabel
                            custID='ppGoalTableLabel'
                            text='Program Goals'
                        />
                        <GoalTableNoBtns
                            data={goalTableData}
                        />
                    </div>
                }
                {
                    goalTableData.length == 0 &&
                    <div id='noGoalsPromptContainer'>
                        <div id='ppNoGoalsPromptLabelContainer'>
                            <InputLabel text='No Historical Goal Data' custID='ppNoGoalsPromptLabel' />
                        </div>
                    </div>
                }
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose}>Close</Button>
            </Modal.Actions>
        </Modal>
    );
}

export default GoalHistoryModal;