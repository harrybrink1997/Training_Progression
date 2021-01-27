import React from 'react'
import { Card, Icon } from 'semantic-ui-react'

const ManageCurrAthleteHome = ({ clickHandler }) => {

    return (
        <div id='programAssignmentCardGroupContainer'>
            <Card.Group>
                <div>
                    <Card onClick={() => clickHandler('managePrograms')}>
                        <Card.Content className='iconContent'>
                            <Icon name='file alternate outline' size='huge' />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header textAlign='center'>Manage <br /> Programs</Card.Header>
                        </Card.Content>
                    </Card>
                </div>
                <div>
                    <Card onClick={() => { clickHandler('manageTeams') }}>
                        <Card.Content className='iconContent'>
                            <Icon name='group' size='huge' />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header textAlign='center'>Manage <br /> Teams</Card.Header>
                        </Card.Content>
                    </Card>
                </div>
            </Card.Group>
        </div>
    )
}

export default ManageCurrAthleteHome