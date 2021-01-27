import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'
import AbsBreadCrumb from '../CustomComponents/absBreadCrumb'
import AthletesStatsOverview from './athletesStatsOverview'
import ProgramAssignment from '../CustomComponents/programAssignment'

import BasicTablePagination from '../CustomComponents/basicTablePagination'
import InputLabel from '../CustomComponents/DarkModeInput'
import utsToDateString from '../../constants/utsToDateString'
import ProgramDeployment from '../CustomComponents/programDeployment'

const ManageAthleteModal = ({ athleteUID, athleteData, coachProgramTableData, assignProgHandler, assignTeamHandler, initProgGroupTabData, viewProgramHandler }) => {

    const [show, setShow] = useState(false);
    const athleteId = athleteUID
    const [pageNum, setPageNum] = useState(1)

    const initAthTeamTableData = (data) => {

        if (data.teams) {
            var returnData = {}
            returnData.columns = [
                {
                    Header: 'Team',
                    accessor: 'team'
                },
                {
                    Header: 'Date Joined',
                    accessor: 'joinDate'
                },
                {
                    accessor: 'btns'
                }
            ]

            returnData.data = []
            Object.keys(data.teams).forEach(team => {

                returnData.data.push({
                    team: team,
                    joinDate: utsToDateString(parseInt(data.teams[team].joiningDate))
                })
            })
            console.log(returnData)
            return returnData
        } else {
            return undefined
        }
    }

    const initAthProgTableData = (data) => {
        if (data.teams) {
            var returnData = {}
            returnData.columns = [
                {
                    Header: 'Program',
                    accessor: 'program'
                },
                {
                    Header: 'Related Team',
                    accessor: 'team'
                },
                {
                    Header: 'Date Assigned',
                    accessor: 'dateAssigned'
                },
                {
                    accessor: 'buttons'
                }
            ]


            returnData.data = []
            Object.keys(data.teams).forEach(team => {

                if (data.teams[team].sharedPrograms) {
                    Object.keys(data.teams[team].sharedPrograms).forEach(prog => {
                        returnData.data.push({
                            program: prog.split('_')[0],
                            team: team,
                            dateAssigned: utsToDateString(parseInt(data.teams[team].sharedPrograms[prog])),
                            buttons:
                                <Button
                                    className='lightPurpleButton-inverted'
                                    onClick={() => { viewProgramHandler(athleteId, prog, data.teams[team].sharedPrograms[prog]) }}
                                >
                                    View Program
                                </Button>


                        })
                    })
                }
            })
            console.log(returnData)
            return returnData
        } else {
            return undefined
        }
    }

    const athProgTableData = initAthProgTableData(athleteData)

    const athTeamTableData = initAthTeamTableData(athleteData)

    const breadCrumbItems = [
        {
            pageNum: 1,
            text: 'Menu'
        },
        {
            pageNum: 2,
            text: 'Manage Programs',
            exclusions: [3]
        },
        {
            pageNum: 3,
            text: 'Manage Teams'
        }
    ]

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)
    }


    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }


    const handleAssignNewProgram = (progData) => {
        console.log(athleteId)
        console.log(progData)
        assignProgHandler(progData, athleteId)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={
                <Button className='lightPurpleButton-inverted'>Manage Athlete</Button>
            }
        >
            <Modal.Header>{athleteData.username}</Modal.Header>
            <Modal.Content>
                <AbsBreadCrumb
                    items={breadCrumbItems}
                    clickHandler={handlePageChange}
                    currPage={pageNum}
                />
                {
                    pageNum === 1 &&
                    <div>
                        <AthletesStatsOverview
                            data={athleteData}
                        />
                        <div className='rowContainer'>
                            <div className='half-width centred-info'>
                                <Button
                                    className='lightPurpleButton'
                                    onClick={(e) => { handlePageChange(e, 2) }}
                                >
                                    Manage Programs
                            </Button>
                            </div>
                            <div className='half-width centred-info'>
                                <Button
                                    className='lightPurpleButton'
                                    onClick={(e) => { handlePageChange(e, 3) }}
                                >
                                    Manage Teams
                            </Button>
                            </div>
                        </div>
                    </div>
                }
                {
                    pageNum === 2 &&
                    <div>
                        <ManageProgramsPage
                            athProgData={athProgTableData}
                            coachProgramTableData={coachProgramTableData}
                            assignProgHandler={handleAssignNewProgram}
                            initProgGroupTabData={initProgGroupTabData}

                        />
                    </div>
                }
                {
                    pageNum === 3 &&
                    <div>
                        <ManageTeamsPage
                            athTeamData={athTeamTableData}
                            coachTeamData={[]}
                        />
                    </div>
                }
            </Modal.Content>
        </Modal>
    );
}

const ManageProgramsPage = ({ athProgData, coachProgramTableData, assignProgHandler, initProgGroupTabData }) => {

    const [pageNum, setPageNum] = useState(1)
    const coachProgTableData = coachProgramTableData
    const coachProgTableColumns =
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

    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }

    const handleProgramAssignmentSubmission = (programAssignment) => {
        setPageNum(1)
        assignProgHandler(programAssignment)
    }

    return (
        <div>
            {
                athProgData && pageNum === 1 &&
                <>
                    <InputLabel
                        text='Program History'
                        custID='programHistHeader'
                    />
                    <BasicTablePagination
                        data={athProgData.data}
                        columns={athProgData.columns}
                    />
                    <div className='centred-info'>
                        <Button
                            className='lightPurpleButton'
                            onClick={(e) => { handlePageChange(e, 2) }}
                        >
                            Assign New Program
                        </Button>
                    </div>
                </>
            }
            {
                coachProgTableData !== undefined && pageNum === 2 &&
                <ProgramDeployment
                    initProgTabData={coachProgTableData}
                    initProgTabColumns={coachProgTableColumns}
                    submitHandler={handleProgramAssignmentSubmission}
                    initProgGroupTabData={initProgGroupTabData}
                />
            }
        </div >
    )
}

const ManageTeamsPage = ({ athTeamData, coachTeamData }) => {
    return (
        <div>
            {
                athTeamData &&
                <>
                    <InputLabel
                        text='Team History'
                        custID='programHistHeader'
                    />
                    <BasicTablePagination
                        data={athTeamData.data}
                        columns={athTeamData.columns}

                    />
                </>
            }
            <div className='rowContainer'>
                <div className='half-width centred'>
                    <Button className='lightPurpleButton'>
                        Assign Team
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ManageAthleteModal;