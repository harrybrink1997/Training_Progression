import React, { useEffect, useState } from 'react'
import ProgramClassification from './programClassification'
import RowSelectTable from './rowSelectTable'
import InputLabel from '../CustomComponents/DarkModeInput'
import OnRowClickBasicTableWithPageination from '../CustomComponents/onRowClickBasicTable'
import { Button, Card, Icon } from 'semantic-ui-react'

const ProgramDeployment = ({ initProgTabData, initProgTabColumns, submitHandler, initProgGroupTabData }) => {
    const [pageNum, setPageNum] = useState(1)
    const [selectedPrograms, setSelectedPrograms] = useState([])
    const rawProgramData = initProgTabData
    const initProgGroupTabColumns =
        [
            {
                Header: 'Program Group',
                accessor: 'programGroup',
                filter: 'fuzzyText'
            },
            {
                Header: 'Unlimited Programs',
                accessor: 'unlimited',
            },
            {
                Header: 'Sequential Programs',
                accessor: 'sequential',
            }
        ]


    const pageNames = {
        '1': '',
        '2': 'Select Program Group?',
        '3': 'Select Program Group?',
        '4': 'Program Selection'
    }
    const [backText, setBackText] = useState(pageNames[pageNum])




    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }

    const handleProgramSelection = (selectedTablePrograms) => {
        setSelectedPrograms(selectedTablePrograms)
    }

    const handleProgramAssignmentSubmission = (programAssignment) => {
        submitHandler(programAssignment)
    }

    const handleProgramGroupSelection = (programGroupTableSelection) => {

        var unlimitedPrograms = false

        if (programGroupTableSelection.original.unlimitedRawData) {
            unlimitedPrograms = []
            programGroupTableSelection.original.unlimitedRawData.forEach(targetProgram => {
                for (var program in rawProgramData) {
                    var programData = rawProgramData[program]
                    if (targetProgram === programData.programUID) {
                        unlimitedPrograms.push(programData)
                        break
                    }
                }
            })
        }

        var sequentialPrograms = false

        if (programGroupTableSelection.original.sequentialRawData) {
            sequentialPrograms = []
            Object.keys(programGroupTableSelection.original.sequentialRawData).forEach(targetProgram => {
                for (var program in rawProgramData) {
                    var programData = rawProgramData[program]
                    if (targetProgram === programData.programUID) {
                        programData.order = programGroupTableSelection.original.sequentialRawData[targetProgram]

                        sequentialPrograms.push(programData)
                        break
                    }
                }
            })
        }

        var payLoad = {
            sequenceName: 'preDetermined',
            sequential: sequentialPrograms,
            unlimited: unlimitedPrograms
        }

        submitHandler(payLoad)
    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)
    }

    const handleBackButton = (event) => {
        event.preventDefault()
        if (pageNum === 3) {
            setPageNum(1)
        } else {
            setPageNum(prevNum => prevNum - 1)
        }
    }

    useEffect(() => {
        console.log(pageNames[pageNum.toString()])
        console.log(pageNum)
        setBackText(pageNames[pageNum.toString()])
    }, [pageNum])

    const processDontUseExistingProgGroup = (event) => {
        event.preventDefault()
        setPageNum(3)
    }

    return (
        <>
            {
                pageNum > 1 &&
                <div className='rowContainer'>
                    <Button className='backButton-inverted' circular icon='arrow left' onClick={(e) => { handleBackButton(e) }} />
                    <div className='lightPurpleText vert-aligned'>
                        {backText}
                    </div>
                </div>
            }
            {
                pageNum === 1 && initProgTabData !== undefined &&
                < div >
                    <InputLabel
                        text='Would you like to use an existing program group?'
                        custID='assignProgramsToTeamNowHeader'
                    />
                    <div id='assignProgramsCardGroupContainer'>
                        <Card.Group>
                            <div>
                                <Card onClick={handleNonFinalSubmit}>

                                    <Card.Content className='iconContent'>
                                        <Icon name='thumbs up outline' size='huge' />
                                    </Card.Content>
                                </Card>
                            </div>
                            <div>
                                <Card onClick={processDontUseExistingProgGroup}>
                                    <Card.Content className='iconContent'>
                                        <Icon name='thumbs down outline' size='huge' />
                                    </Card.Content>
                                </Card>
                            </div>
                        </Card.Group>
                    </div>
                </div>
            }
            {
                pageNum === 2 &&
                <OnRowClickBasicTableWithPageination
                    columns={initProgGroupTabColumns}
                    data={initProgGroupTabData}
                    rowClickHandler={handleProgramGroupSelection}
                />
            }
            {
                pageNum === 3 && initProgTabData &&
                <>
                    <RowSelectTable
                        data={initProgTabData}
                        columns={initProgTabColumns}
                        rowSelectChangeHandler={handleProgramSelection}
                    />
                    {
                        selectedPrograms.length > 0 &&
                        <Button
                            className='lightPurpleButton'
                            onClick={(e) => { handlePageChange(e, 4) }}
                        >
                            Next
                        </Button>
                    }
                </>
            }
            {
                selectedPrograms.length > 0 && pageNum === 4 &&
                <>
                    <ProgramClassification
                        programTableData={selectedPrograms}
                        programTableColumns={initProgTabColumns}
                        handleFormSubmit={handleProgramAssignmentSubmission}
                    />
                </>
            }
        </>
    )


}

export default ProgramDeployment