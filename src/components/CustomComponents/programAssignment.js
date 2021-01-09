import React, { useEffect, useState } from 'react'
import { Icon, Button, Card } from 'semantic-ui-react'

import InputLabel from './DarkModeInput'

import RowSelectTable from './rowSelectTable'
import BasicTable from './basicTable'

const ProgramAssignment = ({ handleFormSubmit, programTableData, programTableColumns }) => {

    const [pageNum, setPageNum] = useState(1)
    const [access, setAccess] = useState('')

    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }
    const handleSubmit = (accessType) => {
        if (accessType === 'unlimited') {
            console.log('is unlimited')
        }
        setAccess('')
    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)

    }

    const processAccess = (accessType) => {
        setAccess(accessType)
    }

    const resetPages = () => {
        setAccess('')
    }

    useEffect(() => {
        console.log(access)
    }, [access])

    return (
        <div>
            {
                access === '' &&
                <div id='programAssignmentCardGroupContainer'>
                    <Card.Group>
                        <div>
                            <Card onClick={() => handleSubmit('unlimited')}>
                                <Card.Content className='iconContent'>
                                    <Icon name='magnet' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header>Unlimited <br /> Access</Card.Header>
                                    <Card.Description>Athletes will have access to all the assigned programs at all times and can complete them in any order.</Card.Description>
                                </Card.Content>
                            </Card>
                        </div>
                        <div>
                            <Card onClick={() => { processAccess('sequential') }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='sort numeric down' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header>Sequential <br /> Access</Card.Header>
                                    <Card.Description>Athletes will have access to the program in the sequential order you choose.</Card.Description>
                                </Card.Content>
                            </Card>
                        </div>
                        <div>
                            <Card onClick={() => { processAccess('mix') }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='cogs' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header >Mix <br /> Access</Card.Header>
                                    <Card.Description>Athletes will have unlimited access to selected programs and sequential access to selected programs.</Card.Description>
                                </Card.Content>
                            </Card>
                        </div>
                    </Card.Group>
                </div>
            }
            {
                access === 'sequential' &&
                <SequentialAccess
                    programTableData={programTableData}
                    programTableColumns={programTableColumns}
                />
            }
            {
                access !== '' &&
                <div className='centeredPageContainerLabel' id='changeAccessTypeBtn'>
                    <Button
                        className='lightPurpleButton-inverted'
                        onClick={() => resetPages()}
                    >
                        Change Access Type
                    </Button>
                </div>
            }
        </div>

    );
}

const SequentialAccess = ({ handleFormSubmit, programTableData, programTableColumns }) => {

    const [pageNum, setPageNum] = useState(1)
    const [access, setAccess] = useState('')
    const [orderedPrograms, setOrderedPrograms] = useState([])
    const tableColumns = programTableColumns

    const initSeqTableData = (rawData) => {
        console.log(rawData)
        var tableData = []
        Object.values(rawData).forEach(program => {
            tableData.push({
                program: program.original.program,
                acutePeriod: program.original.acutePeriod,
                chronicPeriod: program.original.chronicPeriod,
                programLength: program.original.programLength,
            })
        })
        return tableData
    }

    // const [data, setData] = useState(initSeqTableData(programTableData))
    const [seqTableData, setSeqTableData] = useState(initSeqTableData(programTableData))

    const programAlreadyOrdered = (programName) => {
        if (orderedPrograms.length === 0) {
            return false
        } else {
            for (var program in orderedPrograms) {
                if (orderedPrograms[program].program === programName) {
                    return true
                }
            }
            return false
        }
    }

    const removeProgramFromSequentialTable = (programName) => {

        for (var program in seqTableData) {
            if (seqTableData[program].program === programName) {
                let newTableData = [...seqTableData]
                newTableData.splice(program, 1)
                setSeqTableData(newTableData)
                return
            }
        }
    }

    const handleProgramSelection = (selectionData) => {

        for (var row in selectionData) {
            var programData = selectionData[row].original
            programData.order = orderedPrograms.length + 1
            if (programAlreadyOrdered(programData.program)) {
                continue
            } else {
                let newOrderedPrograms = [...orderedPrograms]
                newOrderedPrograms.push(programData)
                setOrderedPrograms(newOrderedPrograms)
                removeProgramFromSequentialTable(programData.program)
            }

        }
    }

    const orderedProgramsTableColumns = [
        {
            Header: 'Order',
            accessor: 'order',
        },
        {
            Header: 'Program',
            accessor: 'program',
        },
        {
            Header: 'Acute Period',
            accessor: 'acutePeriod',
        },
        {
            Header: 'Chronic Period',
            accessor: 'chronicPeriod',
        },
        {
            Header: 'Program Length (Weeks)',
            accessor: 'programLength',
        },
    ]



    useEffect(() => {
        console.log(seqTableData)
        console.log(orderedPrograms)
    }, [orderedPrograms, seqTableData])

    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }
    const handleSubmit = (event) => {
        setAccess('')
    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)

    }

    const resetPages = () => {
        setPageNum(1)
    }

    return (
        <div>
            {
                seqTableData.length > 0 &&
                <RowSelectTable
                    data={seqTableData}
                    columns={tableColumns}
                    rowSelectChangeHanlder={handleProgramSelection}
                />
            }
            <br />
            <br />
            <br />
            {
                orderedPrograms.length > 0 &&
                <div>
                    <BasicTable
                        data={orderedPrograms}
                        columns={orderedProgramsTableColumns}
                    />
                    <div className='rightAlignedButton'>
                        <Button
                            icon
                            className='red-undo-inverted'
                        // onClick={}
                        >
                            <Icon name='undo' />
                        </Button>
                    </div>
                </div>

            }

        </div>

    );
}



export default ProgramAssignment;