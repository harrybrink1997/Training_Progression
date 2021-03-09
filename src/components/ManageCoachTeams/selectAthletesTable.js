import React, { useState } from 'react'
import { Form, Button } from 'semantic-ui-react'
import RowSelectTable from '../CustomComponents/rowSelectTable'

const SelectAthletesTable = ({ data, columns, submitHandler, buttonText }) => {

    const [selectedAthletes, setSelectedAthletes] = useState([])

    const handleAthleteSelection = (athletes) => {
        setSelectedAthletes(athletes)
    }

    return (
        <>
            <RowSelectTable
                columns={columns}
                data={data}
                rowSelectChangeHandler={handleAthleteSelection}
            />
            <div className='centred-info'>
                <Button
                    className='lightPurpleButton'
                    onClick={() => { submitHandler(selectedAthletes) }}
                >
                    {selectedAthletes.length === 0 ? 'Create Team' : buttonText}
                </Button>

            </div>
        </>
    )
}

export default SelectAthletesTable