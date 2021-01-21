import React, { useState } from 'react'
import { Modal, Button, Pagination, Form, Radio, List } from 'semantic-ui-react'

const ReplaceProgramSequenceModal = ({ buttonHandler, sequenceOverlapData }) => {

    const [show, setShow] = useState(false);
    const [currPage, setCurrPage] = useState(1)
    const totalSequenceData = sequenceOverlapData
    const initRenderData = (rawData) => {
        var payLoad = []
        rawData.forEach(program => {
            if (program.inCurrProg) {
                payLoad.push(program)
            }
        })
        return payLoad
    }

    const renderData = initRenderData(sequenceOverlapData)

    const initReplacementType = (initProgramData) => {
        if (initProgramData[0].order !== undefined &&
            initProgramData[0].isActiveInSequence === false) {
            return undefined
        } else {
            return 'all'
        }
    }

    const [replacementType, setReplacementType] = useState(initReplacementType(sequenceOverlapData))

    const handleRadioChange = (val) => {
        setReplacementType(val)
    }

    const handleClose = (event) => {
        setShow(false);
    }

    const handlePageChange = (event, data) => {
        setCurrPage(data.activePage)
    }

    const handleProceedBtnClick = () => {
        buttonHandler(replacementType, totalSequenceData)
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
                    <div>
                        We ran some quick checks and found the following
                        {
                            renderData.length === 1 ?
                                ' issue'
                                :
                                ' ' + renderData.length + ' issues'
                        }
                        . Please review these before proceeding.
                    </div>
                    <div className='centeredPageContainerLabel'>
                        <Pagination
                            firstItem={null}
                            lastItem={null}
                            pointing
                            secondary
                            defaultActivePage={1}
                            totalPages={renderData.length}
                            onPageChange={handlePageChange}
                        />
                    </div>
                    {
                        currPage === 1
                        && sequenceOverlapData[0].inCurrProg
                        &&
                        <FirstProgramText
                            data={sequenceOverlapData[0]}
                            pushRadioChangeUpstream={handleRadioChange}
                            defaultRadioVal={replacementType}
                        />
                    }
                    {
                        currPage === 1
                        && !sequenceOverlapData[0].inCurrProg
                        &&
                        <NonFirstProgramText
                            data={renderData[0]}
                        />
                    }
                    {
                        currPage > 1
                        &&
                        <NonFirstProgramText
                            data={renderData[currPage - 1]}
                        />
                    }
                </div>
                <div className='rowContainer'>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleClose() }}
                            className='lightPurpleButton-inverted'
                        >
                            Back
                        </Button>
                    </div>
                    <div className='half-width centred-info'>
                        <Button
                            onClick={() => { handleProceedBtnClick() }}
                            className='lightPurpleButton-inverted'
                        >
                            Proceed
                        </Button>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    );
}

const NonFirstProgramText = ({ data }) => {
    const programData = data

    return (
        <div>
            <h5 className='lightPurpleText'>{programData.programUID.split('_')[0]}</h5>
            {
                programData.sameMetaParams !== true &&
                programData.inCurrProg === true &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]}. This current version has the following differences to the version your coach just sent you.
                    <br />
                    <List bulleted>
                        {
                            Object.keys(programData.sameMetaParams).map(param => {
                                if (programData.sameMetaParams[param] === false) {
                                    return (
                                        <List.Item key={param}>
                                            {param}
                                        </List.Item>
                                    )
                                }
                            })
                        }
                    </List>
                    <div>
                        Due to these differences, the programs are unable to be merged. If you choose to proceed, the program and any associated sequences will be removed.
                    </div>
                </div>
            }
            {
                data.order === undefined &&
                programData.sameMetaParams === true &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as an unlimited program and are on day {programData.currentDayInProgram}. If you accept this sequence, the unlimited program will be removed and added to this new sequence.
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence &&
                programData.sameMetaParams === true &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence.
                    <br /><br />
                    If you accept, {programData.order.split('_')[1]} program sequence will be removed from your current programs.
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence === false &&
                programData.sameMetaParams === true &&
                <div>
                    You are currently have {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence. It is, however, not currently active in the sequence.
                    <br />
                    <br />
                    Accepting this new sequence will remove the {programData.order.split('_')[1]} sequence.
                </div>
            }
        </div>
    )
}

const FirstProgramText = ({ data, pushRadioChangeUpstream, defaultRadioVal }) => {
    const programData = data

    const [replaceType, setReplaceType] = useState(defaultRadioVal)

    const handleRadioChange = (event, { value }) => {
        console.log(value)
        setReplaceType(value)
        pushRadioChangeUpstream(value)
    }

    const replaceOption1 = 'The first option is we can replace the program entirely.'
    const replaceOption2Start = 'The second option is we can keep your data up to and including day '
    const replaceOptions2End = " for the program and replace all the future data that you're yet to complete."

    return (
        <div>
            <h5 className='lightPurpleText'>{programData.programUID.split('_')[0]}</h5>
            {
                programData.sameMetaParams !== true &&
                programData.inCurrProg === true &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]}. This current version has the following differences to the version your coach just sent you.
                    <br />
                    <List bulleted>
                        {
                            Object.keys(programData.sameMetaParams).map(param => {
                                if (programData.sameMetaParams[param] === false) {
                                    return (
                                        <List.Item key={param}>
                                            {param}
                                        </List.Item>
                                    )
                                }
                            })
                        }
                    </List>
                    <div>
                        Due to these differences, the programs are unable to be merged. If you choose to proceed, the program and any associated sequences will be removed.
                    </div>
                </div>
            }
            {
                programData.order === undefined &&
                programData.sameMetaParams === true &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as an unlimited program and are on day {programData.currentDayInProgram}. There are two options for this program moving forward.
                    <br />
                    <br />
                    <Form.Group >
                        <Form.Field
                            control={Radio}
                            label={replaceOption1}
                            value='all'
                            checked={replaceType === 'all'}
                            onChange={handleRadioChange}
                        />
                        <br />
                        <Form.Field
                            control={Radio}
                            label={replaceOption2Start + programData.currentDayInProgram + replaceOptions2End}
                            value='future'
                            checked={replaceType === 'future'}
                            onChange={handleRadioChange}
                        />
                    </Form.Group>
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence &&
                programData.sameMetaParams === true &&
                <div>
                    You are currently completing {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence. There are two options for this program moving forward.
                    <br />
                    <br />
                    <Form.Group >
                        <Form.Field
                            control={Radio}
                            label={replaceOption1}
                            value='all'
                            checked={replaceType === 'all'}
                            onChange={handleRadioChange}
                        />
                        <br />
                        <Form.Field
                            control={Radio}
                            label={replaceOption2Start + programData.currentDayInProgram + replaceOptions2End}
                            value='future'
                            checked={replaceType === 'future'}
                            onChange={handleRadioChange}
                        />
                    </Form.Group>
                    <div>
                        Please note both these options will remove the entire {programData.order.split('_')[1]} program sequence.
                    </div>
                </div>
            }
            {
                programData.order !== undefined &&
                programData.isActiveInSequence === false &&
                programData.sameMetaParams === true &&
                <div>
                    You are currently have {programData.programUID.split('_')[0]} as part of the {programData.order.split('_')[1]} program sequence. It is, however, not currently active in the sequence.
                    <br />
                    <br />
                    Accepting this new sequence will remove the {programData.order.split('_')[1]} program sequence.
                </div>
            }
        </div>
    )
}

export default ReplaceProgramSequenceModal;