import React, { useState } from 'react'
import { Modal, Button, Form } from 'semantic-ui-react'

import BasicTable from '../CustomComponents/basicTable'

const ManagePendingProgramsModal = ({ programTableData, numPrograms }) => {

    const [show, setShow] = useState(false);
    const handleClose = (event) => {
        setShow(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setShow(false);

    }

    const pendingProgramsTableColumns = [
        {
            Header: 'Program',
            accessor: 'program',
        },
        {
            Header: 'Assigning Coach',
            accessor: 'coach',
        },
        {
            Header: 'Program Type',
            accessor: 'programType',
        },
        {
            Header: 'Related Programs',
            accessor: 'relatedPrograms',
        },
        {
            accessor: 'buttons',
        }
    ]
    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger={
                <Button className='lightPurpleButton-inverted'>{numPrograms === 1 ? '1 Pending Program' : numPrograms + ' Pending Programs'}</Button>
            }
        >
            <Modal.Header>Pending Programs</Modal.Header>

            <Modal.Content>
                <BasicTable
                    data={programTableData}
                    columns={pendingProgramsTableColumns}
                />
            </Modal.Content>
        </Modal>
    );
}


export default ManagePendingProgramsModal;