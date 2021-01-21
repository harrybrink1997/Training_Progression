import React from 'react'
import { List } from 'semantic-ui-react'
import utsToDateString from '../../constants/utsToDateString'
import BasicTable from '../CustomComponents/basicTable'
const AthletesStatsOverview = ({ data }) => {


    const columns = [
        {
            accessor: 'label'
        },
        {
            accessor: 'data'
        }
    ]

    const tableData = [
        {
            label: 'Username',
            data: data.username
        },
        {
            label: 'Email',
            data: data.email
        },
        {
            label: 'Date Joined',
            data: utsToDateString(parseInt(data.joinDate))
        },
        {
            label: 'Current Teams',
            data: data.teams ? Object.keys(data.teams).length : '0'
        },
    ]

    return (
        <div id='athleteDataOverviewTable'>
            <BasicTable
                data={tableData}
                columns={columns}
                header={false}
            />
        </div>
    )
}

export default AthletesStatsOverview