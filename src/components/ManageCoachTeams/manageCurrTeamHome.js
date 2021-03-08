import React from 'react'
import { Card, Icon } from 'semantic-ui-react'

const ManageCurrTeamHome = ({ clickHandler, deleteTeamHandler }) => {

    return (
        <div id='programAssignmentCardGroupContainer'>
            <Card.Group>
                <div>
                    <Card onClick={() => clickHandler('manageTeamLoads')}>
                        <Card.Content className='iconContent'>
                            <Icon name='area graph' size='huge' />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header textAlign='center'>Manage <br /> Loads</Card.Header>
                        </Card.Content>
                    </Card>
                </div>
                <div>
                    <Card onClick={() => clickHandler('manageTeamPrograms')}>
                        <Card.Content className='iconContent'>
                            <Icon name='file alternate outline' size='huge' />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header textAlign='center'>Manage <br /> Programs</Card.Header>
                        </Card.Content>
                    </Card>
                </div>
                <div>
                    <Card onClick={() => { clickHandler('manageTeamMembers') }}>
                        <Card.Content className='iconContent'>
                            <Icon name='group' size='huge' />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header textAlign='center'>Manage <br /> Members</Card.Header>
                        </Card.Content>
                    </Card>
                </div>
                <div>
                    <Card onClick={() => { deleteTeamHandler() }}>
                        <Card.Content className='iconContent'>
                            <Icon name='group' size='huge' />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header textAlign='center'>Delete <br /> Team</Card.Header>
                        </Card.Content>
                    </Card>
                </div>
            </Card.Group>
        </div>
    )
}

export default ManageCurrTeamHome