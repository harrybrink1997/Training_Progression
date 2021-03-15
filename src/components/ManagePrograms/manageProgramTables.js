import React, { useState } from 'react'
import { Button } from 'semantic-ui-react'
import BasicTable from '../CustomComponents/basicTable'
import useWindowDimensions from '../PageStructure/pageSize'

const ManageProgramTables = ({ pendingData, currentData, pastData, currentTableView, changeTableHandler }) => {
    const [table, setTable] = useState('current')
    const { width, height } = useWindowDimensions()

    let nonDataHTML =
        <div>
            No {table} program data...
        </div>

    return (
        <>
            <ManageProgramToggle
                clickHandler={changeTableHandler}
                currentView={currentTableView}
                height={height}
                width={width}
            />
            {
                currentTableView === 'current' &&
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
                currentTableView === 'past' &&
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
                currentTableView === 'pending' &&
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


const ManageProgramToggle = ({ currentView, clickHandler, height, width }) => {



    return (
        <div className='availExercises-ExData-toggleContainer centred-info'>
            <Button.Group vertical={width < 450} size='tiny'>
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