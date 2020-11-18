import React, { useState } from 'react'

import { Menu } from 'semantic-ui-react'

export const BodyPartListGroup = ({ currBodyPart, bodyPartsList, changeBodyPartHandler }) => {

    const [currentBodyPart, setCurrentBodyPart] = useState(currBodyPart)

    const handleClick = (event, { value }) => {
        setCurrentBodyPart(value)
        changeBodyPartHandler(value)
    }

    return (
        <Menu
            vertical
            fluid
        >
            {
                bodyPartsList.map(bodyPart => {
                    if (bodyPart === currentBodyPart) {
                        return (
                            <Menu.Item
                                onClick={handleClick}
                                value={bodyPart}
                                key={bodyPart}
                                active
                            >
                                {bodyPart}
                            </Menu.Item>
                        )
                    } else {
                        return (
                            <Menu.Item
                                onClick={handleClick}
                                value={bodyPart}
                                key={bodyPart}
                            >
                                {bodyPart}
                            </Menu.Item>
                        )
                    }
                })

            }
        </Menu>
    )
}
