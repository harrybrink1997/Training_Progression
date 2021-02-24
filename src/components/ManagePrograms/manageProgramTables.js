import React, { useState } from 'react'
import { Button } from 'semantic-ui-react'
import BasicTable from '../CustomComponents/basicTable'

const ManageProgramTables = ({ pendingData, currentData, pastData }) => {
    const [table, setTable] = useState('current')

    let nonDataHTML =
        <div>
            No {table} program data...
        </div>

    return (
        <>
            <ManageProgramToggle
                clickHandler={setTable}
                currentView={table}
            />
            {
                table === 'current' &&
                <>
                    {
                        currentData ?
                            <BasicTable
                                columns={currentData.columns}
                                data={currentData.data}
                            />
                            :
                            nonDataHTML
                    }
                </>
            }
            {
                table === 'past' &&
                <>
                    {
                        pastData ?
                            <BasicTable
                                columns={pastData.columns}
                                data={pastData.data}
                            />
                            :
                            nonDataHTML
                    }
                </>
            }
            {
                table === 'pending' &&
                <>
                    {
                        pendingData ?
                            <BasicTable
                                columns={pendingData.columns}
                                data={pendingData.data}
                            />
                            :
                            nonDataHTML
                    }
                </>
            }
        </>
    )

}


const ManageProgramToggle = ({ currentView, clickHandler }) => {

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
            </Button.Group>
        </div>
    )
}
export default ManageProgramTables