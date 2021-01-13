import React from 'react'

import { Button } from 'semantic-ui-react'

const AcceptRequestButton = ({ buttonHandler, objectUID }) => {

    const id = objectUID

    return (
        <Button className="lightGreenButton-inverted" onClick={() => buttonHandler(id, true)}>Accept</Button>
    )
}

const DeclineRequestButton = ({ buttonHandler, objectUID }) => {

    const id = objectUID

    return (
        <Button className="lightRedButton-inverted" onClick={() => buttonHandler(id, false)}>Decline</Button>
    )
}

const AcceptReplaceRequestButton = ({ buttonHandler, objectUID }) => {

    const id = objectUID

    return (
        <Button className="lightGreenButton-inverted" onClick={() => buttonHandler(id, true)}>Replace</Button>
    )
}

const DeclineReplaceRequestButton = ({ buttonHandler, objectUID }) => {

    const id = objectUID

    return (
        <Button className="lightRedButton-inverted" onClick={() => buttonHandler(id, false)}>Keep Existing</Button>
    )
}


export { AcceptRequestButton, DeclineRequestButton, AcceptReplaceRequestButton, DeclineReplaceRequestButton }