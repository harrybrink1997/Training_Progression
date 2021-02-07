import React, { useState } from 'react'
import { Form, Input, Button } from 'semantic-ui-react'
import BasicTable from '../CustomComponents/basicTable'
import InputLabel from '../CustomComponents/DarkModeInput'

const TeamLoadingDataOverview = ({ dayThreshold, data }) => {

    const [threshold, setThreshold] = useState(dayThreshold)

    const columns = [
        {
            accessor: 'field'
        },
        {
            accessor: 'value'
        }
    ]

    const thresholdChange = (e, { value }) => {
        console.log(value)
    }

    const handleSubmit = () => {
        console.log("submit")
    }


    return (
        <>
            <div className='tableHeader'>
                Loading Overview
            </div>
            <div className='centred-info sml-margin-top'>
                <Form onSubmit={handleSubmit}>
                    <div className='rowContainer'>
                        <Form.Field inline>
                            <label>Days Since Overloading:</label>
                            <Input
                                value={dayThreshold}
                                size='mini'
                                onChange={thresholdChange}
                            />
                        </Form.Field>
                        <div className='sml-margin-left tiny-margin-top'>
                            <Button
                                type="submit"
                                className="lightPurpleButton"
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
            <BasicTable
                data={data}
                columns={columns}
                header={false}
            />

        </>
    )
}

export default TeamLoadingDataOverview