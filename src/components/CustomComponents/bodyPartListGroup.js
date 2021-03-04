import React, { useEffect, useState } from 'react'

import { Icon } from 'semantic-ui-react'
import InputLabel from './DarkModeInput'

const BodyPartListGroup = ({ activeMuscle, muscleGroups, changeMuscleHandler, activeMuscleGroup, openMuscleGroupHandler }) => {

    return (
        <div>
            <Muscle
                muscle='Overall_Total'
                isActive={activeMuscle == 'Overall_Total'}
                clickHandler={changeMuscleHandler}
            />
            {
                Object.keys(muscleGroups).map(muscleGroup => {
                    return (
                        <MuscleGroupContainer
                            key={muscleGroup}
                            muscleGroup={muscleGroup}
                            defaultOpen={muscleGroup == activeMuscleGroup}
                            muscleList={
                                [muscleGroup + '_Total'].concat(muscleGroups[muscleGroup])
                            }
                            clickHandler={changeMuscleHandler}
                            activeMuscle={activeMuscle}
                            openMuscleGroupHandler={openMuscleGroupHandler}
                        />
                    )
                })
            }
        </div>

    )
}

const MuscleGroupContainer = ({ muscleGroup, defaultOpen, muscleList, activeMuscle, clickHandler, openMuscleGroupHandler }) => {

    const containerIndex = muscleGroup

    const iconString = defaultOpen ? 'caret down' : 'caret right'

    const handleOpenClose = (event) => {
        openMuscleGroupHandler(containerIndex)
    }

    return (
        < div>
            <div className='clickableDiv' onClick={handleOpenClose} key={containerIndex}>
                {
                    (muscleList.includes(activeMuscle)) ?
                        <InputLabel
                            text={muscleGroup}
                            leftIcon={<Icon name={iconString} />}
                            custID='muscleListActiveMuscleGroupLabel'
                        />
                        :
                        <InputLabel
                            text={muscleGroup}
                            leftIcon={<Icon name={iconString} />}
                        />

                }
            </div>
            {
                defaultOpen &&
                <MuscleList
                    muscleList={muscleList}
                    activeMuscle={activeMuscle}
                    clickHandler={clickHandler}
                />
            }
        </div >
    )
}

const MuscleList = ({ muscleList, activeMuscle, clickHandler }) => {

    return (

        < div>
            {
                muscleList.map(muscle => {
                    return (
                        <Muscle
                            key={muscle}
                            muscle={muscle}
                            isActive={muscle === activeMuscle}
                            clickHandler={clickHandler}
                        />
                    )
                })

            }
        </div>
    )
}

const Muscle = ({ muscle, isActive, clickHandler }) => {

    const muscleID = muscle

    const muscleText = (muscle.split('_').length == 2) ? 'Total' : muscle

    const handleClickMuscle = (event) => {
        clickHandler(muscleID)
    }

    return (
        <div
            className='clickableDiv'
            onClick={() => handleClickMuscle()}
        >
            {
                isActive &&
                <InputLabel
                    text={muscleText}
                    custID='muscleListActiveMuscleLabel'
                    styles={{ color: '#BB86FC' }}
                />
            }
            {
                !isActive &&
                <InputLabel
                    text={muscleText}
                />

            }
        </div>
    )

}

export default BodyPartListGroup