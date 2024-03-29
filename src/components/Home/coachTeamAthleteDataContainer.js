import React, { useState } from 'react'
import InputLabel from '../CustomComponents/DarkModeInput'
import CoachRequestModal from './coachRequestModal'
import { Popup, Icon } from 'semantic-ui-react'
import { Button } from 'semantic-ui-react'

const CoachTeamAthleteDataContainer = ({ requestData, userType, athleteData, manageAthleteHandler, manageTeamsHandler, manageProgramsHandler }) => {

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
                        <CoachRequestModal
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
            < Button className='lightPurpleButton-inverted' onClick={manageTeamsHandler}>Manage Teams</Button>
            < Button className='lightPurpleButton-inverted' onClick={manageProgramsHandler}>Manage Programs</Button>

        </div >

    let athleteHTML =
        <div>
            < Button className='lightPurpleButton-inverted' onClick={manageProgramsHandler}>Manage Programs</Button>
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



export default CoachTeamAthleteDataContainer;