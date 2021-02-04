import React, { useState } from 'react'
import { Modal, Button } from 'semantic-ui-react'
import BasicTable from '../CustomComponents/basicTable';

const TeamMemberLoadLogModal = ({ logsData, clickHandler }) => {

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
                <BasicTable
                    data={logsData.data}
                    columns={logsData.columns}
                />
            </Modal.Content>
        </Modal>
    );
}

export default TeamMemberLoadLogModal;