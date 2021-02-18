import React, { useState } from 'react'
import { Modal, Button } from 'semantic-ui-react'
import RedGreenUnderlineBasicTable from '../CustomComponents/redGreenUnderlineBasicTable';

const TeamMemberLoadLogModal = ({ logsData, warnBelowThreshold, warningThreshold }) => {

    const [show, setShow] = useState(false);

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger=
            {
                <Button className='lightPurpleButton-inverted'>View Logs</Button>
            }
        >
            <Modal.Header>Load Logs</Modal.Header>
            <Modal.Content>
                <RedGreenUnderlineBasicTable
                    data={logsData.data}
                    columns={logsData.columns}
                    warnBelowThreshold={warnBelowThreshold}
                    warningThreshold={warningThreshold}
                />
            </Modal.Content>
        </Modal>
    );
}

export default TeamMemberLoadLogModal;