import React, { useEffect, useState } from 'react'
import { Loader } from 'semantic-ui-react'
import { capitaliseFirstLetter } from '../../constants/stringManipulation'
import BasicTable from '../CustomComponents/basicTable'

const CoachProgramView = ({ data, name }) => {

    // Loading variables.
    const [loading, setLoading] = useState(true)
    const [overviewLoaded, setOverviewLoaded] = useState(false)
    const [programLoaded, setProgramLoaded] = useState(true)
    const [progressionLoaded, setProgressionLoaded] = useState(true)

    const [pageView, setPageView] = useState('overview')



    const initialiseOverviewData = (programData) => {
        var payLoad = {
            data: [],
            columns: [{ accessor: 'parameter' }, { accessor: 'value' }]
        }

        payLoad.data.push({
            parameter: 'Day In Program',
            value: programData.currentDayInProgram
        })
        payLoad.data.push({
            parameter: 'Acute Timeframe',
            value: programData.acutePeriod
        })
        payLoad.data.push({
            parameter: 'Chronic Timeframe',
            value: programData.chronicPeriod
        })
        payLoad.data.push({
            parameter: 'Program Type',
            value: programData.order ? 'Sequential' : 'Unlimited'
        })

        if (programData.order) {
            payLoad.data.push({
                parameter: 'Sequence Name',
                value: programData.order.split('_')[1]
            })
            payLoad.data.push({
                parameter: 'Order In Sequence',
                value: programData.order.split('_')[0]
            })
            payLoad.data.push({
                parameter: 'Currently Active In Sequence',
                value: programData.isActiveInSequence ? 'Yes' : 'No'
            })
        }
        return payLoad
    }

    const overviewData = initialiseOverviewData(data)




    // Use Effects to monitor the loading state of the program page.
    useEffect(() => {
        if (overviewData) {
            setOverviewLoaded(true)
        }
    }, [overviewData])

    useEffect(() => {
        if (overviewLoaded && programLoaded && progressionLoaded) {
            setLoading(false)
        }
    }, [overviewLoaded, programLoaded, progressionLoaded])


    // HTML that will actually be rendered
    let loadingHTML =
        <div className='vert-aligned'>
            <Loader active inline='centered' content='Preparing Program Space...' />
        </div>

    let overviewHTML =
        <div className='centred-info'>
            <CoachProgramViewOverviewTable
                data={overviewData.data}
                columns={overviewData.columns}
            />
        </div>

    let navHTML =
        <div className='centred-info'>

        </div>


    return (
        <>
            {loading && loadingHTML}
            {!loading && navHTML}
            {!loading && pageView === 'overview' && overviewHTML}
        </>
    )
}

const CoachProgramViewPageSubHeader = ({ data, name }) => {

    return (
        <>
            <div className='pageSubHeader2'>
                Current Program: {capitaliseFirstLetter(name.split('_')[0])}
            </div>
        </>
    )
}

const CoachProgramViewOverviewTable = ({ data, columns }) => {
    return (
        <div className='half-width pageContainerLevel1'>
            <div className='pageSubHeader1 med-margin-bottom'>
                Program overview
            </div>
            <div>
                <BasicTable
                    data={data}
                    columns={columns}
                    header={false}
                />
            </div>
        </div>
    )
}

export default CoachProgramView
export { CoachProgramViewPageSubHeader }