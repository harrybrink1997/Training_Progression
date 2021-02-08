import React, { useState } from 'react'
import { Form, Input, Button } from 'semantic-ui-react'
import BasicTable from '../CustomComponents/basicTable'
import { FooterErrorMessage } from '../CustomComponents/errorMessage'
const TeamLoadingDataOverview = ({ dayThreshold, data, submitHandler }) => {

    const [threshold, setThreshold] = useState(dayThreshold)
    const [error, setError] = useState(false)

    const columns = [
        {
            accessor: 'field'
        },
        {
            accessor: 'value'
        }
    ]

    const thresholdChange = (e, { value }) => {

        let input = value.slice(-1)

        if (input >= 0 && input <= 9) {
            if (value <= 60) {
                setThreshold(value)
            }
        }
    }

    const handleSubmit = () => {
        console.log("submit")
        if (threshold === '') {
            setError(true)
        } else {
            setError(false)
        }
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
                                value={threshold}
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
            {
                error &&
                <FooterErrorMessage>
                    Please Input Value Before Submitting.
                </FooterErrorMessage>
            }
            <div className='centred-info'>
                <div className='half-width'>
                    <BasicTable
                        data={data}
                        columns={columns}
                        header={false}
                    />
                </div>
            </div>

        </>
    )
}

export default TeamLoadingDataOverview