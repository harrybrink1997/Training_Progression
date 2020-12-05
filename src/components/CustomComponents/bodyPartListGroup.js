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
        // setGroupVisible(!groupVisible)
    }

    return (
        < div>
            <div onClick={handleOpenClose} key={containerIndex}>
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

    const checker = (ap) => {
        console.log(ap)
    }

    const [check, setChec] = useState(checker(muscleList))

    return (
        <div>
            {
                muscleList.map(muscle => {
                    return (
                        <Muscle
                            key={muscle}
                            muscle={muscle}
                            isActive={muscle == activeMuscle}
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
            onClick={() => handleClickMuscle()}
        >
            {
                isActive &&
                <InputLabel
                    text={muscleText}
                    custID='muscleListActiveMuscleLabel'
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
// const BodyPartListGroup = ({ currBodyPart, bodyPartsList, changeBodyPartHandler }) => {

//     const [currentBodyPart, setCurrentBodyPart] = useState(currBodyPart)

//     const handleClick = (event, { value }) => {
//         setCurrentBodyPart(value)
//         changeBodyPartHandler(value)
//     }

//     return (
//         <Menu
//             vertical
//             fluid
//         >
//             {
//                 bodyPartsList.map(bodyPart => {
//                     if (bodyPart === currentBodyPart) {
//                         return (
//                             <Menu.Item
//                                 onClick={handleClick}
//                                 value={bodyPart}
//                                 key={bodyPart}
//                                 active
//                             >
//                                 {bodyPart}
//                             </Menu.Item>
//                         )
//                     } else {
//                         return (
//                             <Menu.Item
//                                 onClick={handleClick}
//                                 value={bodyPart}
//                                 key={bodyPart}
//                             >
//                                 {bodyPart}
//                             </Menu.Item>
//                         )
//                     }
//                 })

//             }
//         </Menu>
//     )
// }

export default BodyPartListGroup