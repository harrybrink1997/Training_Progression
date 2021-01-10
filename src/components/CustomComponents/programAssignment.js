import React, { useEffect, useState } from 'react'
import { Icon, Button, Card } from 'semantic-ui-react'

import InputLabel from './DarkModeInput'

import RowSelectTable from './rowSelectTable'
import BasicTable from './basicTable'
import { im } from 'mathjs'

const ProgramAssignment = ({ handleFormSubmit, programTableData, programTableColumns }) => {

    const [pageNum, setPageNum] = useState(1)
    const [access, setAccess] = useState('')

    const initTableData = (rawData) => {
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

    const programTableDataFormatted = initTableData(programTableData)

    const handleSubmit = (accessType, programData = undefined) => {
        var payLoad = {}
        if (accessType === 'unlimited') {
            payLoad.sequential = false
            payLoad.unlimited = []

            programTableData.forEach(program => {
                payLoad.unlimited.push(program.original)
            })

        } else if (accessType === 'sequential') {
            payLoad.unlimited = false
            payLoad.sequential = programData

        } else if (accessType === 'mixed') {
            payLoad = programData

        }

        handleFormSubmit(payLoad)
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

    const handleSequentialProgramSubmission = (programOrder) => {
        handleSubmit('sequential', programOrder)
    }

    const handleMixProgramSubmission = (programData) => {
        handleSubmit('mixed', programData)
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
                            <Card onClick={() => { processAccess('mixed') }}>
                                <Card.Content className='iconContent'>
                                    <Icon name='cogs' size='huge' />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header >Mixed <br /> Access</Card.Header>
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
                    programTableData={programTableDataFormatted}
                    programTableColumns={programTableColumns}
                    handleFormSubmit={handleSequentialProgramSubmission}
                />
            }
            {
                access === 'mixed' &&
                <MixedAccess
                    programTableData={programTableDataFormatted}
                    programTableColumns={programTableColumns}
                    handleFormSubmit={handleMixProgramSubmission}
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

    const [orderedPrograms, setOrderedPrograms] = useState([])
    const tableColumns = programTableColumns

    const [seqTableData, setSeqTableData] = useState(programTableData)

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

    const handleSubmit = (event) => {
        handleFormSubmit(orderedPrograms)
        setOrderedPrograms([])
    }

    const removeLatestProgram = () => {
        let newOrderedData = [...orderedPrograms]
        var programToRemove = newOrderedData.pop()
        delete programToRemove.order
        let newSeqTableData = [...seqTableData]
        newSeqTableData.push(programToRemove)

        setOrderedPrograms(newOrderedData)
        setSeqTableData(newSeqTableData)
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
            {
                orderedPrograms.length > 0 &&
                <div>
                    <BasicTable
                        data={orderedPrograms}
                        columns={orderedProgramsTableColumns}
                    />
                    <div className='rightAlignedButton'>
                        {
                            seqTableData.length === 0 &&
                            <Button
                                icon
                                className='tick-inverted'
                                onClick={() => handleSubmit()}
                            >
                                <Icon name='check' />
                            </Button>
                        }
                        <Button
                            icon
                            className='undo-inverted'
                            onClick={() => removeLatestProgram()}
                        >
                            <Icon name='undo' />
                        </Button>
                    </div>
                </div>
            }

        </div>
    );
}


const UnlimitedAccess = ({ handleFormSubmit, programTableData, programTableColumns }) => {

    const [unlimitedPrograms, setUnlimitedPrograms] = useState([])
    const tableColumns = programTableColumns

    const [unlimTableData, setUnlimTableData] = useState(programTableData)

    const UnlimitedProgramsTableColumns = [
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


    const handleSubmit = (event) => {
        console.log(unlimTableData)
        console.log(unlimitedPrograms)

        handleFormSubmit(unlimitedPrograms, unlimTableData)

    }

    const removeLatestProgram = () => {
        let newUnlimData = [...unlimitedPrograms]
        var programToRemove = newUnlimData.pop()
        delete programToRemove.order
        let newUnlimTableData = [...unlimTableData]
        newUnlimTableData.push(programToRemove)

        setUnlimitedPrograms(newUnlimData)
        setUnlimTableData(newUnlimTableData)
    }

    const programAlreadyOrdered = (programName) => {
        if (unlimitedPrograms.length === 0) {
            return false
        } else {
            for (var program in unlimitedPrograms) {
                if (unlimitedPrograms[program].program === programName) {
                    return true
                }
            }
            return false
        }
    }

    const removeProgramFromSequentialTable = (programName) => {

        for (var program in unlimTableData) {
            if (unlimTableData[program].program === programName) {
                let newTableData = [...unlimTableData]
                newTableData.splice(program, 1)
                setUnlimTableData(newTableData)
                return
            }
        }
    }

    const handleProgramSelection = (selectionData) => {
        for (var row in selectionData) {
            var programData = selectionData[row].original
            if (programAlreadyOrdered(programData.program)) {
                continue
            } else {
                let newUnlimitedPrograms = [...unlimitedPrograms]
                newUnlimitedPrograms.push(programData)
                setUnlimitedPrograms(newUnlimitedPrograms)
                removeProgramFromSequentialTable(programData.program)
            }

        }
    }

    return (
        <div>
            {
                unlimTableData.length > 0 &&
                <RowSelectTable
                    data={unlimTableData}
                    columns={tableColumns}
                    rowSelectChangeHanlder={handleProgramSelection}
                />
            }
            {
                unlimitedPrograms.length > 0 &&
                <div>
                    <BasicTable
                        data={unlimitedPrograms}
                        columns={UnlimitedProgramsTableColumns}
                    />
                    <div className='rightAlignedButton'>

                        <Button
                            icon
                            className='tick-inverted'
                            onClick={() => handleSubmit()}
                        >
                            <Icon name='check' />
                        </Button>
                        <Button
                            icon
                            className='undo-inverted'
                            onClick={() => removeLatestProgram()}
                        >
                            <Icon name='undo' />
                        </Button>
                    </div>
                </div>
            }

        </div>
    );

}


const MixedAccess = ({ handleFormSubmit, programTableData, programTableColumns }) => {

    const [unlimitedPrograms, setUnlimitedPrograms] = useState([])
    const [unlimitedProgramsSelected, setUnlimitedProgramsSelected] = useState(false)
    const [sequentialProgramsTableData, setSequentialProgramsTableData] = useState([])
    const [headerText, setHeaderText] = useState('Select Unlimited Access Programs')

    const handleUnlimitedProgramsSubmitted = (unlimitedProgramsSelected, sequentialPrograms) => {
        console.log(unlimitedProgramsSelected)
        console.log(sequentialPrograms)

        if (sequentialPrograms.length > 0) {
            setUnlimitedProgramsSelected(true)
            setSequentialProgramsTableData(sequentialPrograms)
            setUnlimitedPrograms(unlimitedProgramsSelected)
            setHeaderText('Select Sequentially Accessible Programs')
        } else {
            handleFormSubmit({
                unlimited: unlimitedProgramsSelected,
                sequential: false
            })
        }
    }

    const handleSequentialProgramSubmission = (orderedPrograms) => {
        console.log(orderedPrograms)
        handleFormSubmit({
            unlimited: unlimitedPrograms,
            sequential: orderedPrograms
        })
    }

    return (
        <div>
            <InputLabel
                text={headerText}
                custID='mixedAccessHeaderText'
            />
            {
                !unlimitedProgramsSelected &&
                <UnlimitedAccess
                    programTableData={programTableData}
                    programTableColumns={programTableColumns}
                    handleFormSubmit={handleUnlimitedProgramsSubmitted}
                />
            }
            {
                unlimitedProgramsSelected &&
                <SequentialAccess
                    programTableData={sequentialProgramsTableData}
                    programTableColumns={programTableColumns}
                    handleFormSubmit={handleSequentialProgramSubmission}
                />
            }
        </div>
    )

}

export default ProgramAssignment;