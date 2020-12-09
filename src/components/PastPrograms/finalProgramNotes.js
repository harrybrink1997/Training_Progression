import { compositionDependencies } from 'mathjs'
import React, { useEffect, useState } from 'react'
import { Button, TextArea } from 'semantic-ui-react'


const FinalProgramNotes = ({ submitHandler, initialText }) => {
    const text = initialText
    const [textField, setTextField] = useState(initialText)

    useEffect(() => {
        setTextField(text)
        // console.log(textField)
    }, [text])


    const handleSave = () => {
        console.log(textField)
        submitHandler(textField)
    }

    return (
        <div>
            <TextArea id='ppProgramNotesTextArea'
                value={textField}
                onChange={(e, { value }) => setTextField(value)}
                placeholder='What went well? What are you proud of? What can you improve on in the next program?'
            />
            <div id='ppProgramNotesBtnContainer'>
                <Button onClick={handleSave} className='lightPurpleButton'>Save</Button>
            </div>
        </div>
    )
}


export default FinalProgramNotes