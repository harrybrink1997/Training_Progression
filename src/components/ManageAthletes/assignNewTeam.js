import React from 'react'
import OnRowClickBasicTableWithPageination from '../CustomComponents/onRowClickBasicTable'


const AssignNewTeam = ({ teamList, handleSubmit }) => {

    const handleRowClick = (row) => {
        handleSubmit(row.original.team)
    }

    return (
        <div>
            <OnRowClickBasicTableWithPageination
                columns={teamList.columns}
                data={teamList.data}
                rowClickHandler={handleRowClick}
            />
        </div>
    )
}


export default AssignNewTeam