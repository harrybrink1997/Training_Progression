import React, { useState } from 'react'

import InputLabel from '../CustomComponents/DarkModeInput'
import { Icon, Input } from 'semantic-ui-react'

class Goal {
    constructor(uid, updateParentList) {
        this.description = ''
        this.difficulty = ''
        this.closeOffDate = ''
        this.subGoals = []
        this.uid = uid
        this.updateParentList = updateParentList
    }

    removeSubGoal() {
        console.log(this.subGoals)
        if (this.subGoals.length == 1) {
            this.subGoals = []
        } else {
            this.subGoals = this.subGoals.slice(0, -1)
            console.log(this.subGoals)
        }
        this.updateParentList(this, this.uid)
    }

    addSubGoal() {
        this.subGoals.push(new SubGoal(this.uid + '_' + this.subGoals.length))
        this.updateParentList(this, this.uid)
    }

    setDescription(value) {
        console.log(this.description)
        this.description = value
    }

    setDifficulty(value) {
        this.difficulty = value
    }

    getUID() {
        return this.uid
    }

    getFormattedGoalObject() {
        var returnObject = {
            description: this.description,
            difficulty: this.difficulty,
            closeOffDate: this.closeOffDate
        }

        if (this.subGoals.length != 0) {
            returnObject['subGoals'] = []
            this.subGoals.forEach(subGoal => {
                returnObject.push(subGoal.getFormattedGoalObject())
            })
        }
        return returnObject
    }

    formHTML() {
        // return FormInput(this.goalUID, this.description, this.setDescription)
        return (
            <div>
                <GoalFormInput
                    goalUID={this.goalUID}
                    initValue={this.description}
                    updateGoalInput={this.setDescription}
                    goalObj={this}
                    isSubGoal={false}
                    headerText='Goal Description'
                />
                { this.subGoals.length > 0 &&
                    this.subGoals.map(goal => {
                        return (
                            <div key={goal.getUID()}>{goal.formHTML()}</div>
                        )
                    })
                }
            </div>

        )
    }

}

const GoalFormInput = ({ goalUID, initValue, goalObj, headerText, isSubGoal }) => {

    const [description, setDescription] = useState(initValue)

    const handleInputChange = (event, { value }) => {
        setDescription(value)
        goalObj.description = value
    }

    const handleSubGoalNumUpdate = (increase) => {
        if (increase) {
            goalObj.addSubGoal()
        } else {
            goalObj.removeSubGoal()
        }
    }

    return (
        <div>
            <InputLabel text={headerText} />
            <Input
                id={goalUID}
                value={description}
                onChange={handleInputChange}
                className='cpModalGoalInputTextArea'
            />
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
}


// const GoalFieldForm = (goalIndex, updateGoalInput, goalObject) => {

//     return (
//         <div className='hpModalGoalInputChildContainer'>
// <InputLabel text={'Goal Description'} />
// <Input
//     id={goalIndex}
//     value={goalObject}
//     onChange={updateGoalInput}
//     className='cpModalGoalInputTextArea'
// />
// <div id='hpModalSubGoalsLabelContainer'>
//     <InputLabel
//         text='Add Sub Goals &nbsp;'
//     />
//     <Icon
//         className='hpModalModifyNumSubGoalsBtn'
//         style={{ color: 'white' }}
//         name='minus square outline'
//     // onClick={() => handleSubGoalNumUpdate(false)}
//     />
//     <Icon
//         className='hpModalModifyNumSubGoalsBtn'
//         style={{ color: 'white' }}
//         name='plus square outline'
//     // onClick={() => handleSubGoalNumUpdate(true)}
//     />
// </div>
//         </div>
//     )
// }

// export default GoalFieldForm
export { Goal }