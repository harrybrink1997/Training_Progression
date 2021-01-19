import React, { useState } from 'react'
import { Modal, Button, List } from 'semantic-ui-react'

const ReplaceProgramSequenceModal = ({ handleFormSubmit, firstProgramUID, sequenceOverlapData }) => {

    const [show, setShow] = useState(false);
    const programName = firstProgramUID
    const handleClose = (event) => {
        setShow(false);
    }

    const initProgramData = (data) => {
        console.log(data)
        return data.slice(1, data.length)
    }

    const nonFirstProgData = initProgramData(sequenceOverlapData)


    const handleButtonClick = (replacementType) => {
        handleClose()
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger=
            {
                <Button className='lightGreenButton-inverted'>Accept</Button>
            }
        >
            <Modal.Header>Woah! Hold Up.</Modal.Header>

            <Modal.Content>
                <div id='cpPageSubmitDayWarningContent'>
                    We ran some quick checks and found the following issues:
                    {
                        sequenceOverlapData[0] !== false &&
                        <FirstProgramText
                            data={sequenceOverlapData[0]}
                        />
                    }
                    {
                        nonFirstProgData.map(program => {
                            return (
                                <NonFirstProgramText
                                    data={program}
                                />
                            )
                        })
                    }
                </div>
                {/* <div className='rowContainer'>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleButtonClick('all') }}
                            className='lightPurpleButton-inverted'
                        >
                            Replace Completely
                        </Button>
                    </div>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleButtonClick('future') }}
                            className='lightPurpleButton-inverted'
                        >
                            Replace Only Future
                        </Button>
                    </div>
                </div> */}
            </Modal.Content>
        </Modal>
    );
}

const NonFirstProgramText = ({ data }) => {
    const programData = data

    return (
        <div>
            <br />
            <h5 className='lightPurpleText'>{programData.programUID.split('_')[0]}</h5>

            {
                data.order === undefined &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as an unlimited program and are on day {programData.currentDayInProgram}. If you accept this sequence, the unlimited program will be removed and added to this new sequence.
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence.
                    <br /><br />
                    If you accept, {programData.order.split('_')[1]} program sequence will be removed from your current programs.
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence === false &&
                <div>
                    You are currently have {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence. It is, however, not currently active in the sequence.
                    <br />
                    <br />
                    Accepting this new sequence will remove it from {programData.order.split('_')[1]}.
                </div>
            }
        </div>
    )
}

const FirstProgramText = ({ data }) => {
    const programData = data

    return (
        <div>
            <br />
            <h5 className='lightPurpleText'>{programData.programUID.split('_')[0]}</h5>
            {
                programData.order === undefined &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as an unlimited program and are on day {programData.currentDayInProgram}. There are two options for this program moving forward.
                    <br />
                    <List bulleted>
                        <List.Item>
                            The first option is we can replace the program entirely.
                        </List.Item>
                        <List.Item>
                            The second option is we can keep your data up to and including day {programData.currentDayInProgram} for the program and replace all the future data that you're yet to complete.
                        </List.Item>
                    </List>
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence. There are two options for this program moving forward.
                    <br />
                    <List bulleted>
                        <List.Item>
                            The first option is we can replace the program entirely.
                        </List.Item>
                        <List.Item>
                            The second option is we can keep your data up to and including day {programData.currentDayInProgram} for the program and replace all the future data that you're yet to complete.
                        </List.Item>
                    </List>
                    <div>
                        Please note both these options will remove the entire {programData.order.split('_')[1]} program sequence.
                    </div>
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence === false &&
                <div>
                    You are currently have {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence. It is, however, not currently active in the sequence.
                    <br />
                    <br />
                    Accepting this new sequence will remove it from {programData.order.split('_')[1]}.
                </div>
            }
        </div>
    )
}

export default ReplaceProgramSequenceModal;