import React, { Component } from 'react';
import { withCoachAuthorisation } from '../Session';
import NonLandingPageWrapper from '../CustomComponents/nonLandingPageWrapper'
import { Dimmer, Loader } from 'semantic-ui-react'

import AthleteMangementTable from '../CustomComponents/athleteManagementTable'
import ManageAthleteModal from './manageAthleteModal'


class ManageAthletesPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            athleteManagementTableData: [],
            athleteManagementTableColumns: [],
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

            tableData.push({
                athlete: athlete.username,
                email: athlete.email,
                manageModal: <ManageAthleteModal athleteUID={athleteUID} athleteData={athlete} />
            })
        })

        return tableData
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

                <AthleteMangementTable
                    data={athleteManagementTableData}
                    columns={athleteManagementTableColumns}
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