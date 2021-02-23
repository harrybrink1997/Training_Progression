import React, { useState } from 'react'
import { Button } from 'semantic-ui-react'
import BasicTable from '../CustomComponents/basicTable'

const ManageProgramTables = ({ pendingData, currentData, pastData }) => {
    const [table, setTable] = useState('current')



    return (
        <>
            <ManageProgramToggle
                clickHandler={setTable}
            />
            <BasicTable
                columns={pendingData.columns}
                data={pendingData.data}
            />
        </>
    )

}


const ManageProgramToggle = ({ hasCurrent, hasPending, hasPast, currentView, clickHandler }) => {
    const [table, setTable] = useState(currentView)

    return (
        <div className='availExercises-ExData-toggleContainer centred-info'>
            <Button.Group size='tiny'>
                {
                    currentView === 'current' ?
                        <Button
                            className='smallerBtn'
                            active
                        >
                            Current Programs
                                        </Button>
                        :
                        <Button
                            className='smallerBtn'
                            onClick={() => { { clickHandler('current') } }}
                        >
                            Current Programs
                    </Button>
                }
                {
                    currentView === 'pending' ?
                        <Button

                            active
                        >
                            Pending Programs
                                        </Button>
                        :
                        <Button
                            onClick={() => { clickHandler('pending') }}
                        >
                            Pending Programs
                    </Button>
                }
                {
                    currentView === 'past' ?
                        <Button

                            active
                        >
                            Past Programs
                                        </Button>
                        :
                        <Button
                            onClick={() => { clickHandler('past') }}
                        >
                            Past Programs
                    </Button>
                }
            </Button.Group>
        </div>
    )
}
export default ManageProgramTables