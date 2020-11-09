import React, { useState } from 'react'

import { Menu } from 'semantic-ui-react'

export const BodyPartListGroup = ({ currBodyPart, bodyPartsList, changeBodyPartHandler }) => {

    const [currentBodyPart, setCurrentBodyPart] = useState(currBodyPart)

    const handleButtonClick = (event) => {
        setCurrentBodyPart(event.target.value)
        changeBodyPartHandler(event.target.value)
    }

    return (
        <Menu vertical>
            {
                bodyPartsList.map(bodyPart => {
                    if (bodyPart === currentBodyPart) {
                        return (
                            <Menu.Item
                                as="button"
                                variant="dark"
                                onClick={handleButtonClick}
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
                                as="button"
                                variant="dark"
                                onClick={handleButtonClick}
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
