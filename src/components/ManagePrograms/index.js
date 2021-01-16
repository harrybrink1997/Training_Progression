import React, { Component } from 'react';
import { withAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader, List } from 'semantic-ui-react'

import BasicTable from '../CustomComponents/basicTable'
import ManageProgramsModal from './manageProgramsModal'
import ManagePendingProgramsModal from './managePendingProgramsModal'
import CreateProgramModal from './createProgramModal'
import CreateProgramGroupModal from './createProgramGroupModal'
import DeleteProgramModal from './deleteProgramModal'
import loadingSchemeString, { loadingSchemeStringInverse } from '../../constants/loadingSchemeString'
import { AcceptRequestButton, DeclineRequestButton, AcceptReplaceRequestButton, DeclineReplaceRequestButton } from '../CustomComponents/customButtons'
import ReplaceProgramOptionsModal from './replaceProgramOptionsModal'
import OverrideReplaceProgramModal from './overrideReplaceProgramModal'

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
            pendingProgramsTableData: this.initPendingProgramsTableData(userObject),
            pendingProgramsData: userObject.pendingPrograms,
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

    findRelatedSequentialPrograms = (userObject, seqOrderString) => {

        // If the start of the sequence is 1 - there will be no related programs in current or past programs. Related programs will only exist in pending programs.
        if (seqOrderString.split('_')[0] === '1') {
            var seqOrderArray = seqOrderString.split('_')
            seqOrderArray.shift()
            var sequenceString = seqOrderArray.join("_")
            var relatedPrograms = []

            Object.keys(userObject.pendingPrograms).forEach(programUID => {
                var programData = userObject.pendingPrograms[programUID]

                if (programData.order) {
                    if (programData.order !== seqOrderString) {
                        var currOrderArray = programData.order.split('_')
                        currOrderArray.shift()
                        var currSeqString = currOrderArray.join("_")

                        if (sequenceString === currSeqString) {
                            relatedPrograms.push({
                                programUID: programUID,
                                order: programData.order
                            })
                        }
                    }
                }
            })
            return relatedPrograms

        }
    }

    programInCurrentPrograms = (userObject, programName) => {
        if (!userObject.currentPrograms) {
            return false
        } else {
            for (var program in userObject.currentPrograms) {
                if (program === programName) {
                    return true
                }
            }
            return false
        }
    }

    programInPastPrograms = (userObject, programName) => {
        if (!userObject.pastPrograms) {
            return false
        } else {
            for (var program in userObject.pastPrograms) {
                if (program === programName) {
                    return true
                }
            }
            return false
        }
    }

    handlePendingProgramReplacement = (programName, replacementType, currentDayInProgram) => {
        console.log(programName)
        console.log(replacementType)
        console.log(currentDayInProgram)
        console.log(this.state.pendingProgramsData)
        var basePath =
            '/users/'
            + this.props.firebase.auth.currentUser.uid

        if (replacementType === 'future') {
            var maxDay = 0
            Object.keys(this.state.pendingProgramsData[programName]).forEach(key => {
                if (parseInt(key)) {
                    if (parseInt(key) > maxDay) {
                        maxDay = key
                    }
                }
            })
            var path =
                basePath
                + '/currentPrograms/'
                + programName + '/'
            var payLoad = {}
            for (var day = currentDayInProgram + 1; day <= maxDay; day++) {

                (this.state.pendingProgramsData[programName][day]) ?
                    payLoad[path + day.toString()] = this.state.pendingProgramsData[programName][day]
                    : payLoad[path + day.toString()] = {}
            }

        } else {
            var path =
                basePath
                + '/currentPrograms/'
                + programName

            var payLoad = {}

            payLoad[path] = this.state.pendingProgramsData[programName]
        }
        // console.log(payLoad)
        var pendingPath =
            basePath
            + '/pendingPrograms/'
            + programName

        payLoad[pendingPath] = null

        this.props.firebase.updateDatabaseFromRootPath(payLoad)
    }

    checkSameMetaParameters = (userObject, programName) => {
        var metaParameters = {
            'Loading Scheme': false,
            'Chronic Period': false,
            'Acute Period': false
        }

        if (userObject.currentPrograms[programName].loading_scheme === userObject.pendingPrograms[programName].loading_scheme) {
            metaParameters['Loading Scheme'] = true
        }

        if (userObject.currentPrograms[programName].chronicPeriod === userObject.pendingPrograms[programName].chronicPeriod) {
            metaParameters['Chronic Period'] = true
        }

        if (userObject.currentPrograms[programName].acutePeriod === userObject.pendingPrograms[programName].acutePeriod) {
            metaParameters['Acute Period'] = true
        }
        if (metaParameters['Acute Period'] && metaParameters['Chronic Period'] && metaParameters['Loading Scheme']) {
            return true
        }

        return metaParameters
    }

    initPendingProgramsTableData = (userObject) => {
        if (userObject.pendingPrograms) {
            var tableData = []

            Object.keys(userObject.pendingPrograms).forEach(programName => {
                var program = userObject.pendingPrograms[programName]
                if (program.order === undefined) {
                    // Deals with unlimited pending programs.
                    if (this.programInCurrentPrograms(userObject, programName)) {
                        var noMetaParameterMismatch = this.checkSameMetaParameters(userObject, programName)
                        if (noMetaParameterMismatch === true) {
                            // If the pending program is already in the athletes
                            // current programs give an option to replace.
                            tableData.push({
                                program: programName.split('_')[0],
                                coach: userObject.teams[programName.split('_')[1]].username,
                                relatedPrograms: 'None',
                                programType: 'Stand-Alone',
                                buttons:
                                    <div>
                                        <ReplaceProgramOptionsModal
                                            handleFormSubmit={this.handlePendingProgramReplacement}
                                            programUID={programName}
                                            currentDayInProgram={userObject.currentPrograms[programName].currentDayInProgram}
                                        />
                                        <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                    </div>
                            })
                        } else {
                            console.log(noMetaParameterMismatch)
                            tableData.push({
                                program: programName.split('_')[0],
                                coach: userObject.teams[programName.split('_')[1]].username,
                                relatedPrograms: 'None',
                                programType: 'Stand-Alone',
                                buttons:
                                    <div>
                                        <OverrideReplaceProgramModal
                                            handleFormSubmit={this.handlePendingProgramRequestAcceptence}
                                            programUID={programName}
                                            mismatchedParams={noMetaParameterMismatch}
                                        />
                                        <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                    </div>
                            })
                        }

                    } else {
                        // If its not in past or current programs. 
                        tableData.push({
                            program: programName.split('_')[0],
                            coach: userObject.teams[programName.split('_')[1]].username,
                            relatedPrograms: 'None',
                            programType: 'Stand-Alone',
                            buttons:
                                <div>
                                    <AcceptRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                    <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                </div>
                        })
                    }

                } else {
                    // Deals with sequential pending programs
                    if (program.order.split('_')[0] === '1') {

                        var relatedPrograms = this.findRelatedSequentialPrograms(userObject, program.order)

                        relatedPrograms.sort((a, b) => {
                            return parseInt(a.order.split('_')[0]) - parseInt(b.order.split('_')[0])
                        })
                        var numInSequence = 2

                        if (this.programInCurrentPrograms(userObject, programName)) {

                        } else if (this.programInPastPrograms(userObject, programName)) {

                        } else {
                            // If its not in past or current programs. 
                            tableData.push({
                                program: programName.split('_')[0],
                                coach: userObject.teams[programName.split('_')[1]].username,
                                programType: 'Sequential',
                                buttons:
                                    <div>
                                        <AcceptRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                        <DeclineRequestButton buttonHandler={this.handlePendingProgramRequestAcceptence} objectUID={programName} />
                                    </div>,
                                relatedPrograms:
                                    <List>
                                        {
                                            relatedPrograms.map(relProgram => {

                                                let listHTML =
                                                    <List.Item key={relProgram.programUID}>
                                                        {numInSequence + ': ' + relProgram.programUID.split('_')[0]
                                                        }
                                                    </List.Item>

                                                numInSequence++
                                                return listHTML
                                            })
                                        }
                                    </List>
                            })
                        }
                        console.log(relatedPrograms)

                    }
                }
            })
            return tableData
        } else {
            return undefined
        }
    }

    handlePendingProgramRequestAcceptence = (programName, isAccepted) => {
        var payLoad = {}
        var basePath = '/users/'
            + this.props.firebase.auth.currentUser.uid
        var pendingPath = basePath + '/pendingPrograms/'

        if (isAccepted) {
            var currProgPath =
                basePath
                + '/currentPrograms/'

            payLoad[basePath + '/activeProgram'] = programName
            payLoad[currProgPath + programName] = this.state.pendingProgramsData[programName]
            payLoad[pendingPath + programName] = null

            if (this.state.pendingProgramsData[programName].order) {

                var relatedProgs = this.findRelatedSequentialPrograms(
                    { pendingPrograms: this.state.pendingProgramsData },
                    this.state.pendingProgramsData[programName].order
                )

                relatedProgs.forEach(relatedProgram => {
                    payLoad[currProgPath + relatedProgram.programUID] = this.state.pendingProgramsData[relatedProgram.programUID]

                    payLoad[pendingPath + relatedProgram.programUID] = null
                })
            }

        } else {

            payLoad[pendingPath + programName] = null

            if (this.state.pendingProgramsData[programName].order) {

                var relatedProgs = this.findRelatedSequentialPrograms(
                    { pendingPrograms: this.state.pendingProgramsData },
                    this.state.pendingProgramsData[programName].order
                )

                relatedProgs.forEach(relatedProgram => {
                    payLoad[pendingPath + relatedProgram.programUID] = null
                })
            }
        }

        this.props.firebase.processPendingProgramsUpstream(payLoad)

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
                    + '_' + 'none'
                    + '_' + this.props.firebase.auth.currentUser.uid
                    + '_' + timestamp
            })

            payLoad.sequential = programObj
            console.log(programObj)
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
            pendingProgramsTableData,
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
                        {
                            pendingProgramsTableData &&
                            <div id='pendingProgramsModalContainer'>
                                <ManagePendingProgramsModal
                                    programTableData={pendingProgramsTableData}
                                    numPrograms={pendingProgramsTableData.length}
                                />
                            </div>
                        }
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