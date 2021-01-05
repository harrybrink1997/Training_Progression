import React, { useState } from 'react'
import InputLabel from '../CustomComponents/DarkModeInput'
import TeamRequestModal from './teamRequestModal'
import { Popup, Icon } from 'semantic-ui-react'
import { Button } from 'semantic-ui-react'

const TeamsContainer = ({ requestData, teamData, athleteData, userType, manageAthleteHandler }) => {

    let coachHTML =
        <div>
            I'm a coach

            {
                requestData === undefined
                    ?
                    <InputLabel
                        text='No Pending Team Requests'
                        custID='noTeamRequestsHeaderLabel'
                    />
                    :
                    <div>
                        <TeamRequestModal
                            requestTableData={requestData}
                        />
                    </div>
            }
            {
                athleteData === undefined
                    ?
                    < InputLabel
                        text='No Current Athletes'
                        custID='noTeamRequestsHeaderLabel'
                    />
                    :
                    <Button className='lightPurpleButton-inverted' onClick={manageAthleteHandler}>Manage Athletes</Button>
            }
            {
                teamData === undefined
                    ?
                    <InputLabel
                        text='No Active Teams'
                        custID='noTeamRequestsHeaderLabel'
                    />
                    :
                    <div>
                        has team
                    </div>
            }
        </div>

    let athleteHTML =
        <div>
            I'm a athlete
        </div>

    return (
        <div>
            {
                userType == 'coach' && coachHTML
            }
            {
                userType == 'athlete' && athleteHTML
            }
        </div>
    )
}



export default TeamsContainer;