import React, { useState } from 'react'
// import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { Modal, Button, Form, Table } from 'semantic-ui-react'
import { useTable } from 'react-table'



const CoachRequestModal = ({ requestTableData }) => {

    const [show, setShow] = useState(false);
    const handleSubmit = (event) => {
        event.preventDefault();
        setShow(false);
    }

    const pendingTeamRequests = requestTableData

    return (
        <Modal
            size='small'
            centered={false}
            onClose={() => setShow(false)}
            onOpen={() => setShow(true)}
            open={show}
            trigger=
            {
                <Button className='lightPurpleButton-inverted'>{requestTableData.length} Pending Request{requestTableData.length > 1 && 's'}</Button>
            }
        >
            <Modal.Header >Pending Team Requests</Modal.Header>
            <Modal.Content>
                <RequestModalTable
                    data={pendingTeamRequests}
                />
            </Modal.Content>
        </Modal>
    );
}


const RequestModalTable = ({ data }) => {

    const init = (de) => {
        console.log(de)
    }
    const [d, sd] = useState(init(data))

    const columns = React.useMemo(
        () => [
            {
                Header: 'Username',
                accessor: 'username'
            },
            {
                Header: 'Email',
                accessor: 'email',

            },
            {
                Header: 'Additional Notes',
                accessor: 'notes',
            },
            {
                Header: '',
                accessor: 'buttons',
            },
        ],
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
        }
    )

    return (
        <Table celled {...getTableProps()}>
            <Table.Header>
                {headerGroups.map(headerGroup => (
                    <Table.Row {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <Table.HeaderCell {...column.getHeaderProps()}>{column.render('Header')}</Table.HeaderCell>
                        ))}
                    </Table.Row>
                ))}
            </Table.Header>
            <Table.Body {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                        <Table.Row {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <Table.Cell {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                            })}
                        </Table.Row>
                    )

                })}
            </Table.Body>
        </Table>

    )
}

export default CoachRequestModal;