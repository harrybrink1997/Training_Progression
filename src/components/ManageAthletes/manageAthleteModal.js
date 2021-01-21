import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'
import AbsBreadCrumb from '../CustomComponents/absBreadCrumb'
import AthletesStatsOverview from './athletesStatsOverview'

const ManageAthleteModal = ({ athleteUID, athleteData }) => {

    const [show, setShow] = useState(false);
    const athleteId = athleteUID
    const [pageNum, setPageNum] = useState(1)

    const breadCrumbItems = [
        {
            pageNum: 1,
            text: 'Menu'
        },
    ]

    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

    }

    const handleNonFinalSubmit = (event) => {
        event.preventDefault()
        setPageNum(prevNum => prevNum + 1)
    }


    const handlePageChange = (event, pageNum) => {
        event.preventDefault()
        setPageNum(pageNum)
    }

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={
                <Button className='lightPurpleButton-inverted'>Manage Athlete</Button>
            }
        >
            <Modal.Header>{athleteData.username}</Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Content>
                    <AbsBreadCrumb
                        items={breadCrumbItems}
                        clickHandler={handlePageChange}
                        currPage={pageNum}
                    />

                    <AthletesStatsOverview
                        data={athleteData}
                    />
                </Modal.Content>
            </Form>
        </Modal>
    );
}



export default ManageAthleteModal;