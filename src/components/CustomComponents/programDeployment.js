import React, { useEffect, useState } from 'react'
import ProgramClassification from './programClassification'
import RowSelectTable from './rowSelectTable'
import InputLabel from '../CustomComponents/DarkModeInput'
import OnRowClickBasicTableWithPageination from '../CustomComponents/onRowClickBasicTable'
import { Button, Card, Icon, List } from 'semantic-ui-react'
import loadingSchemeString from '../../constants/loadingSchemeString'

const ProgramDeployment = ({ initProgTabData, submitHandler, initProgGroupTabData }) => {
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

    const initProgTabColumns =
        [
            {
                Header: 'Program',
                accessor: 'program',
                filter: 'fuzzyText'
            },
            {
                Header: 'Acute Period',
                accessor: 'acutePeriod',
                filter: 'fuzzyText'
            },
            {
                Header: 'Chronic Period',
                accessor: 'chronicPeriod',
                filter: 'fuzzyText'
            },
            {
                Header: 'Loading Scheme',
                accessor: 'loadingScheme',
                filter: 'fuzzyText'
            },
            {
                Header: 'Program Length (Weeks)',
                accessor: 'programLength',
                filter: 'fuzzyText'
            },
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

const initProgDeployCoachProgGroupTableData = (programGroups) => {
    var tableData = []

    if (programGroups) {
        Object.keys(programGroups).forEach(programGroupName => {
            var programGroup = programGroups[programGroupName]

            var sequentialTableVal = ''

            if (programGroup.sequential) {
                var sequentialOrder = []

                Object.keys(programGroup.sequential).forEach(program => {
                    sequentialOrder.push([program.split('_')[0], parseInt(programGroup.sequential[program].split('_')[0])])
                })

                sequentialOrder.sort((a, b) => {
                    return a[1] - b[1]
                })

                sequentialTableVal =
                    <List bulleted>
                        {
                            sequentialOrder.map(program => {
                                return (
                                    <List.Item key={program}>
                                        {program[1] + ': ' + program[0]}
                                    </List.Item>
                                )
                            })

                        }
                    </List>

            }

            tableData.push({
                programGroup: programGroupName,
                unlimited:
                    !programGroup.unlimited ?
                        ''
                        :
                        <List bulleted>
                            {
                                programGroup.unlimited.map(program => {
                                    return (
                                        <List.Item key={program}>
                                            {program.split('_')[0]}
                                        </List.Item>
                                    )
                                })
                            }
                        </List>,
                sequential: sequentialTableVal,
                unlimitedRawData: programGroup.unlimited,
                sequentialRawData: programGroup.sequential

            })

        })
        return tableData
    } else {
        return undefined
    }
}

const initProgDeployCoachProgramTableData = (programs) => {
    var tableData = []
    var userObject = {}
    console.log(programs)
    if (userObject.currentPrograms !== undefined) {
        Object.keys(userObject.currentPrograms).forEach(programName => {
            var program = userObject.currentPrograms[programName]
            tableData.push({
                program: programName.split('_')[0],
                loadingScheme: loadingSchemeString(program.loading_scheme),
                acutePeriod: program.acutePeriod,
                chronicPeriod: program.chronicPeriod,
                programLength: program.currentDayInProgram % 7,
                programUID: programName
            })
        })
        return tableData
    } else {
        return undefined
    }
}


export default ProgramDeployment
export { initProgDeployCoachProgGroupTableData, initProgDeployCoachProgramTableData }