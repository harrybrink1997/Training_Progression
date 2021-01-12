import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader } from 'semantic-ui-react'

import BasicTable from '../CustomComponents/basicTable'
import ManageProgramsModal from './manageProgramsModal'
import CreateProgramModal from './createProgramModal'
import CreateProgramGroupModal from './createProgramGroupModal'
import DeleteProgramModal from './deleteProgramModal'
import loadingSchemeString, { loadingSchemeStringInverse } from '../../constants/loadingSchemeString'


class ManageProgramsPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            programManagementTableData: [],
            programManagementTableColumns: [],
            loading: true
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        var currUserUid = this.props.firebase.auth.currentUser.uid
        this.props.firebase.getUserData(currUserUid).on('value', userData => {
            const userObject = userData.val();

            this.updateObjectState(userObject)
        });
    }


    componentWillUnmount() {
        this.props.firebase.getUserData().off();
    }

    updateObjectState = (userObject) => {

        var programData = this.initProgramData(userObject)


        this.setState({
            currentProgramList: programData.currentProgramList,
            pastProgramList: programData.pastProgramList,
            programManagementTableData: programData.tableData,
            programManagementTableColumns: this.initProgramTableColumns(userObject.userType),
            userType: userObject.userType,
            loading: false
        })
    }

    initProgramTableColumns = (userType) => {
        if (userType === 'coach') {
            return (
                [
                    {
                        Header: 'Program',
                        accessor: 'program',
                        filter: 'fuzzyText'
                    },
                    {
                        Header: 'Loading Scheme',
                        accessor: 'loadingScheme',
                        filter: 'fuzzyText'
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
                    {
                        accessor: 'manageModal',
                    }
                ]
            )
        } else {
            return (
                [
                    {
                        Header: 'Program',
                        accessor: 'program',
                        filter: 'fuzzyText'
                    },
                    {
                        Header: 'Loading Scheme',
                        accessor: 'loadingScheme',
                        filter: 'fuzzyText'
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
                        accessor: 'manageModal',
                    }
                ]
            )
        }
    }

    initProgramData = (userObject) => {

        var returnData = {
            currentProgramList: false,
            pastProgramList: false,
            tableData: []
        }

        if ('currentPrograms' in userObject) {
            var currentProgramList = []

            for (var program in userObject.currentPrograms) {
                currentProgramList.push(program)
            }
            returnData.currentProgramList = currentProgramList

            Object.keys(userObject.currentPrograms).forEach(programUID => {
                var program = userObject.currentPrograms[programUID]

                if (userObject.userType === 'coach') {
                    returnData.tableData.push({
                        program: programUID.split('_')[0],
                        programUID: programUID,
                        loadingScheme: loadingSchemeString(program.loading_scheme),
                        acutePeriod: program.acutePeriod,
                        chronicPeriod: program.chronicPeriod,
                        programLength: program.currentDayInProgram,
                        manageModal: <ManageProgramsModal programUID={programUID} athleteData={program} />
                    })
                }
            })

        }
        // Make the list of past programs.
        if ('pastPrograms' in userObject) {
            var pastProgramList = []

            for (program in userObject.pastPrograms) {
                pastProgramList.push(program)
            }

            returnData.pastProgramList = pastProgramList
        }

        return returnData
    }


    checkIfProgramAlreadyExists(newProgram) {
        var nameToCheck = newProgram.split('_')[0] + '_' + newProgram.split('_')[1]
        if (this.state.currentProgramList.length > 0) {
            for (var program in this.state.currentProgramList) {
                var currProgName = this.state.currentProgramList[program]
                currProgName = currProgName.split('_')[0] + '_' + currProgName.split('_')[1]

                if (currProgName === nameToCheck) {
                    return true
                }
            }
        }

        if (this.state.pastProgramList.length > 0) {
            for (program in this.state.pastProgramList) {
                var currProgName = this.state.pastProgramList[program]
                currProgName = currProgName.split('_')[0] + '_' + currProgName.split('_')[1]

                if (currProgName === nameToCheck) {
                    return true
                }
            }
        }

        return false

    }

    handleCreateProgram = async (programName, acutePeriod, chronicPeriod, loadingScheme, date, goalList) => {

        // Creates a unique name for a program. Input name + coach UID + timestamp of creation.
        programName = programName.trim()
            + '_'
            + this.props.firebase.auth.currentUser.uid
            + '_'
            + new Date().getTime().toString()

        if (this.checkIfProgramAlreadyExists(programName)) {
            alert('Program with name "' + programName.split('_')[0] + '" already exists in either your current or past programs.')
        } else {

            if (this.state.userType === 'athlete') {
                var goalListObject = {}
                var index = 1
                Object.values(goalList).forEach(goal => {
                    goalListObject['Goal_' + index] = goal.getFormattedGoalObject()
                    index++
                })

                var dateConversion = date.split('-')

                dateConversion = dateConversion[2] + '-' + dateConversion[1] + '-' + dateConversion[0]

                var startTimestamp = Math.floor(new Date(dateConversion).getTime())

                await this.props.firebase.createProgramUpstream(
                    this.state.userInformation.uid,
                    programName,
                    acutePeriod,
                    chronicPeriod,
                    loadingScheme,
                    1,
                    startTimestamp,
                    goalListObject
                )

                this.props.firebase.setActiveProgram(
                    this.props.firebase.auth.currentUser.uid,
                    programName
                )
            } else {
                await this.props.firebase.createProgramUpstream(
                    this.props.firebase.auth.currentUser.uid,
                    programName,
                    acutePeriod,
                    chronicPeriod,
                    loadingScheme,
                    1,
                    null,
                    null
                )

                this.props.firebase.setActiveProgram(
                    this.props.firebase.auth.currentUser.uid,
                    programName
                )
            }

        }
    }


    deleteCurrentProgramsUpstream = async (list) => {
        if (list.length == 0) {
            return
        } else {
            if (!(list.includes(this.state.userInformation.data.activeProgram))) {

                list.forEach(program => {
                    this.props.firebase.deleteCurrentProgramUpstream(
                        this.props.firebase.auth.currentUser.uid,
                        program
                    )
                })
            } else {
                var activeProgram = ''
                var currProgList = this.state.currentProgramList

                for (var program in currProgList) {
                    if (!(list.includes(currProgList[program]))) {
                        activeProgram = currProgList[program]
                        break
                    }
                }

                await this.props.firebase.setActiveProgram(
                    this.props.firebase.auth.currentUser.uid,
                    activeProgram
                )

                list.forEach(program => {
                    this.props.firebase.deleteCurrentProgramUpstream(
                        this.props.firebase.auth.currentUser.uid,
                        program
                    )
                })
            }
        }
    }

    handleDeleteProgram = (currentPrograms, pastPrograms) => {

        var payLoad = {}
        var currProgPath = `/users/${this.props.firebase.auth.currentUser.uid}/currentPrograms/`
        var pastProgPath = `/users/${this.props.firebase.auth.currentUser.uid}/pastPrograms/`

        currentPrograms.forEach(program => {
            payLoad[currProgPath + program] = null
        })

        pastPrograms.forEach(program => {
            payLoad[pastProgPath + program] = null
        })

        this.props.firebase.deleteCurrentProgramsUpstream(payLoad)
    }

    handleCreateProgramGroup = (groupName, programData) => {
        console.log(groupName)
        console.log(programData)

        var payLoad = {
            sequential: false,
            unlimited: false
        }

        if (programData.unlimited) {
            var programArray = []
            programData.unlimited.forEach(program => {
                programArray.push(program.programUID)
            })
            payLoad.unlimited = programArray

        }

        if (programData.sequential) {
            var programObj = {}
            var timestamp = new Date().getTime()

            programData.sequential.forEach(program => {
                programObj[program.programUID] =
                    program.order
                    + '_' + programData.sequenceName
                    + '_' + this.props.firebase.auth.currentUser.uid
                    + '_' + timestamp
            })

            payLoad.sequential = programObj
        }

        this.props.firebase.createProgramGroupUpstream(
            this.props.firebase.auth.currentUser.uid,
            groupName,
            payLoad
        )

    }
    render() {
        const {
            loading,
            programManagementTableData,
            programManagementTableColumns,
            currentProgramList,
            pastProgramList,
            userType
        } = this.state
        console.log(programManagementTableData)
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    <div id='mainContainerHeaderDiv'>
                        <div id='mainHeaderText'>
                            Program Management
                        </div>
                        <div id='hpBtnContainer' >
                            <div id='hpLeftBtnContainer'>
                                <DeleteProgramModal
                                    handleFormSubmit={this.handleDeleteProgram}
                                    currentProgramList={currentProgramList}
                                    pastProgramList={pastProgramList}
                                    userType={userType}
                                />
                            </div>
                            <div id='hpMidBtnContainer'>
                                <CreateProgramModal
                                    handleFormSubmit={this.handleCreateProgram}
                                    userType={userType}
                                />

                            </div>
                            <div id='hpRightBtnContainer'>
                                <CreateProgramGroupModal
                                    programTableData={programManagementTableData}
                                    handleFormSubmit={this.handleCreateProgramGroup}
                                />
                            </div>

                        </div>
                    </div>
                </div>
                <div className="pageContainerLevel1">
                    <BasicTable
                        data={programManagementTableData}
                        columns={programManagementTableColumns}
                    />
                </div>
            </NonLandingPageWrapper>



        return (
            <div>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(ManageProgramsPage)