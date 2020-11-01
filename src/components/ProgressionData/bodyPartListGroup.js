import React, { useState } from 'react'

import { ListGroup } from 'react-bootstrap'

export const BodyPartListGroup = ({ currBodyPart, bodyPartsList, changeBodyPartHandler }) => {

    const [currentBodyPart, setCurrentBodyPart] = useState(currBodyPart)

    const handleButtonClick = (event) => {
        setCurrentBodyPart(event.target.value)
        changeBodyPartHandler(event.target.value)
    }

    return (
        <ListGroup>
            {
                bodyPartsList.map(bodyPart => {
                    if (bodyPart === currentBodyPart) {
                        return (
                            <ListGroup.Item
                                as="button"
                                variant="dark"
                                onClick={handleButtonClick}
                                value={bodyPart}
                                key={bodyPart}
                                active
                            >
                                {bodyPart}
                            </ListGroup.Item>
                        )
                    } else {
                        return (
                            <ListGroup.Item
                                as="button"
                                variant="dark"
                                onClick={handleButtonClick}
                                value={bodyPart}
                                key={bodyPart}
                            >
                                {bodyPart}
                            </ListGroup.Item>
                        )
                    }
                })

            }
        </ListGroup>
    )



}