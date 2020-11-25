import React, { useState } from 'react'

// Import off shelf components
import { Icon, Input } from 'semantic-ui-react'
import SemanticDatepicker from 'react-semantic-ui-datepickers';

// Import custom components
import InputLabel from '../CustomComponents/DarkModeInput'
import GoalDifficultyDropdown from '../CustomComponents/goalDifficultyDropDown'

// Import custom functions
import datePickerToString from '../../constants/datePickerToString'

class Goal {
    constructor(uid, updateParentList, currentGoalList) {
        this.description = ''
        this.difficulty = 'Easy'
        this.closeOffDate = new Date()
        this.completed = false
        this.subGoals = {}
        this.uid = uid
        this.updateParentList = updateParentList
        this.currentGoalList = currentGoalList
    }

    setCurrentGoalList(list) {
        this.currentGoalList = list
    }

    removeSubGoal() {
        console.log(this.subGoals)
        if (Object.keys(this.subGoals).length == 1) {
            this.subGoals = {}
        } else {
            var lastSubGoalIndex = Object.keys(this.subGoals).length - 1
            delete this.subGoals[lastSubGoalIndex]
        }
        console.log(this.subGoals)
        this.updateParentList(this, this.uid, this.currentGoalList)
    }

    addSubGoal() {
        var newSubGoalIndex = Object.keys(this.subGoals).length
        this.subGoals[newSubGoalIndex] = new SubGoal((parseInt(this.uid) + 1) + '_' + (parseInt(newSubGoalIndex) + 1))
        console.log(this.subGoals)

        this.updateParentList(this, this.uid, this.currentGoalList)
    }

    setDescription(value) {
        console.log(this.description)
        this.description = value
    }

    setCompleted(value) {
        this.completed = value
    }

    setDifficulty(value) {
        this.difficulty = value
    }

    getDate() {
        return this.closeOffDate
    }
    setDate(value) {
        this.closeOffDate = value
    }

    getDescription() {
        return this.description
    }

    getUID() {
        return this.uid
    }

    getDifficulty() {
        return this.difficulty
    }

    getFormattedGoalObject() {
        var returnObject = {
            mainGoal: {
                description: this.description,
                difficulty: this.difficulty,
                closeOffDate: datePickerToString(this.closeOffDate),
                completed: this.completed
            },
            subGoals: {}
        }

        if (Object.keys(this.subGoals).length != 0) {
            returnObject['subGoals'] = {}
            Object.values(this.subGoals).forEach(subGoal => {
                returnObject.subGoals[subGoal.getUID()] = subGoal.getFormattedGoalObject()
            })
        }
        return returnObject
    }

    formHTML() {
        // return FormInput(this.goalUID, this.description, this.setDescription)
        return (
            <div className='hpCPModalGoalContainer'>
                <GoalFormInput
                    goalUID={this.goalUID}
                    goalObj={this}
                    headerText='Goal Description'
                    isSubGoal={false}
                />
                { Object.keys(this.subGoals).length > 0 &&
                    Object.values(this.subGoals).map(value => {
                        return (
                            <div key={value.getUID()}>{value.formHTML()}</div>
                        )
                    })
                }
            </div>

        )
    }

}

const GoalFormInput = ({ goalUID, goalObj, headerText, isSubGoal }) => {

    const [description, setDescription] = useState(goalObj.getDescription())

    const handleInputChange = (event, { value }) => {
        setDescription(value)
        goalObj.setDescription(value)
    }

    const handleDateChange = (event, { value }) => {
        goalObj.setDate(value)
    }

    const handleDifficultyChange = (value) => {
        goalObj.setDifficulty(value)
        console.log(value)
    }

    const handleSubGoalNumUpdate = (increase) => {
        if (increase) {
            goalObj.addSubGoal()
        } else {
            goalObj.removeSubGoal()
        }
    }


    return (
        <div className={'hpCPModalGoalContainer' + ((isSubGoal) ? ' subgoal' : '')}>
            <div className='hpCPModalAttributesContainer'>
                <div className='hpCPModalDescriptionContainer'>
                    <InputLabel text={headerText} />
                    <Input
                        required
                        id={goalUID}
                        value={description}
                        onChange={handleInputChange}
                        className='cpModalGoalInputTextArea'
                    />

                </div>
                <div className='hpCPModalDateContainer'>
                    <InputLabel text='Target Finish Date' />
                    <SemanticDatepicker
                        className='goalDate'
                        today
                        type='basic'
                        onChange={handleDateChange}
                        format='DD-MM-YYYY'
                        value={goalObj.getDate()}
                    />
                </div>
                <div className='hpCPModalDifficultyContainer'>
                    <InputLabel text='Difficulty' />
                    <GoalDifficultyDropdown
                        buttonHandler={handleDifficultyChange}
                        initialValue={goalObj.getDifficulty()}
                    />
                </div>
            </div>

            {!isSubGoal &&
                <div id='hpModalSubGoalsLabelContainer'>
                    <InputLabel
                        text='Add Sub Goals &nbsp;'
                    />
                    <Icon
                        className='hpModalModifyNumSubGoalsBtn'
                        style={{ color: 'white' }}
                        name='minus square outline'
                        onClick={() => handleSubGoalNumUpdate(false)}
                    />
                    <Icon
                        className='hpModalModifyNumSubGoalsBtn'
                        style={{ color: 'white' }}
                        name='plus square outline'
                        onClick={() => handleSubGoalNumUpdate(true)}
                    />
                </div>
            }
        </div>

    )
}

class SubGoal extends Goal {
    formHTML() {
        return (
            <GoalFormInput
                headerText='Sub Goal'
                goalUID={this.goalUID}
                initValue={this.description}
                updateGoalInput={this.setDescription}
                goalObj={this}
                isSubGoal={true} />
        )
    }

    getFormattedGoalObject() {
        return {
            description: this.description,
            difficulty: this.difficulty,
            closeOffDate: datePickerToString(this.closeOffDate),
            completed: this.completed
        }
    }
}

export { Goal, SubGoal }