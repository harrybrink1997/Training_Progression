import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader } from 'semantic-ui-react'

import RowSelectTable from '../CustomComponents/rowSelectTable'
import ManageAthleteModal from './manageAthleteModal'


class ManageAthletesPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            athleteManagementTableData: [],
            athleteManagementTableColumns: [],
            selectedAthletesTable: [],
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
        this.setState({
            athleteManagementTableData: this.initAthleteTableData(userObject),
            athleteManagementTableColumns: this.initAthleteTableColumns(),
            loading: false
        })
    }

    initAthleteTableColumns = () => {
        return (
            [
                {
                    Header: 'Athlete',
                    accessor: 'athlete',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Email',
                    accessor: 'email',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Team',
                    accessor: 'team',
                    filter: 'fuzzyText'
                },
                {
                    Header: 'Programs',
                    accessor: 'programs',
                    filter: 'fuzzyText'
                },
                {
                    accessor: 'manageModal',
                }
            ]
        )
    }

    initAthleteTableData = (userObject) => {

        var tableData = []

        Object.keys(userObject.currentAthletes).forEach(athleteUID => {
            var athlete = userObject.currentAthletes[athleteUID]
            console.log(athlete)
            tableData.push({
                athlete: athlete.username,
                email: athlete.email,
                team: athlete.team,
                manageModal: <ManageAthleteModal athleteUID={athleteUID} athleteData={athlete} />
            })
        })

        return tableData
    }

    handleAthleteSelection = (athleteTableData) => {
        this.setState({
            selectedAthletesTable: athleteTableData
        })
    }

    render() {
        const {
            loading,
            athleteManagementTableData,
            athleteManagementTableColumns
        } = this.state
        let loadingHTML =
            <Dimmer active>
                <Loader inline='centered' content='Loading...' />
            </Dimmer>

        let nonLoadingHTML =
            <NonLandingPageWrapper>
                <div className="pageContainerLevel1">
                    hello
                </div>

                <RowSelectTable
                    data={athleteManagementTableData}
                    columns={athleteManagementTableColumns}
                    rowSelectChangeHanlder={this.handleAthleteSelection}
                />
            </NonLandingPageWrapper>



        return (
            <div>
                {loading && loadingHTML}
                {!loading && nonLoadingHTML}
            </div>
        )
    }
}

const condition = role => role === 'coach';
export default withCoachAuthorisation(condition)(ManageAthletesPage);