import React, { useState } from 'react'
import { Button, TextArea } from 'semantic-ui-react'


const FinalProgramNotes = ({ submitHandler, initialText }) => {

    const [text, setText] = useState(initialText)

    const handleSave = () => {
        submitHandler(text)
    }

    return (
        <div>
            <textarea id='ppProgramNotesTextArea'
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='What went well? What are you proud of? What can you improve on in the next program?'
            />
            <div id='ppProgramNotesBtnContainer'>
                <Button onClick={handleSave} className='lightPurpleButton'>Save</Button>
            </div>
        </div>
    )
}


export default FinalProgramNotes