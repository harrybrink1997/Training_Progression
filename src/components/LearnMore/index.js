import React, { Component } from 'react'
import { Icon, Statistic, StatisticGroup } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'

import InputLabel from '../CustomComponents/DarkModeInput'

class LearnMorePage extends Component {
    render() {

        return (
            <LandingPageCTAContainer
                handleSignInButton={this.handleSignInButton} />
        )
    }
}

const LandingPageCTAContainer = ({ handleSignInButton }) => {

    return (
        <div>
            <div className="pageContainerLevel1">
                <div id='learnMorePageHeaderContainer'>
                    <div id='learnMorePageHeader'>
                        What Is Corvus Strength?
                </div>
                    <div id='learnMorePageHeaderIcons'>
                        <div>
                            <Statistic.Group
                                inverted
                                size='tiny'
                                widths='four'
                            >
                                <Statistic>
                                    <Statistic.Value>
                                        <Icon name='universal access' />
                                    </Statistic.Value>
                                    <Statistic.Label>
                                        Easy To Use
                            </Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value>
                                        <Icon name='chart area' />
                                    </Statistic.Value>
                                    <Statistic.Label>
                                        Data Driven
                            </Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value>
                                        <Icon name='dna' />
                                    </Statistic.Value>
                                    <Statistic.Label>
                                        Scnetifically <br /> Based
                            </Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value>
                                        <Icon name='users' />
                                    </Statistic.Value>
                                    <Statistic.Label>
                                        User <br /> Orientated
                            </Statistic.Label>
                                </Statistic>
                            </Statistic.Group>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pageContainerLevel1">
                <div className='learnMorePageInfoHeaderContainer'>
                    <div className='learnMorePageInfoHeader'>
                        At a High Level
                    </div>
                </div>
                <HighLevelRecap />
            </div>
            <div className="pageContainerLevel1">
                <div className='learnMorePageInfoHeaderContainer'>
                    <div className='learnMorePageInfoHeader'>
                        A Deep Dive
                    </div>
                </div>
                <DeepDiveRecap />
                <div className='rowContainer'>
                    <div className='pageContainerLevel2 half-width'>
                        <div className='learnMorePageInfoSubHeader'>
                            Acute Work Load
                        </div>
                        <AcuteWorkLoadInfo />
                    </div>
                    <div className='pageContainerLevel2 half-width'>
                        <div className='learnMorePageInfoSubHeader'>
                            Chronic Work Load
                        </div>
                        <ChronicWorkLoadInfo />
                    </div>
                </div>
            </div>
        </div>
    )
}

const LightPurpleText = ({ text, fontSize, fontWeight }) => {
    return (
        <div style={{ fontSize: fontSize, fontWeight: fontWeight, color: '#BB86FC' }}>
            {' ' + text + ' '}
        </div>
    )
}


const DeepDiveRecap = () => (
    <div className='paragraphDiv'>

        The main scientific principle which encompasses Corvus Strength is the theory of Acute Chronic Workload Ratio (ACWR). ACWR is the ratio between the training you've
        <br /><br />

    </div>
)


const HighLevelRecap = () => (
    <div className='paragraphDiv'>

        Corvus Strength is a cloud based platform which aims to provide every user with an accessible means in which to track their own training and reduce their exposure to injury. At a high level Corvus Strength uses the training you've accomplished over a long period of time (generally a month) and the training you've most recently undertaken (generally a week) to predict safe training loads for your future sessions.
        <br /><br />

        Our predicitive model accounts for both the physical and mental components of training. Physical loads are tracked through (sets, reps, weight, etc...) whilst mental loads and tracked through the rate of perceived exertion (RPE).

        <br /><br />

        Corvus Strength gives you the ability to track specific muscle groups or aggregate each muscle group and consider your body holistically.

    </div>
)

const AcuteWorkLoadInfo = () => (
    <div className='paragraphDiv'>
        Corvus is based around the scientific principle of Acute Chronic Workload Ratio (ACWR). This value is comprised of two parts: your acute workload and your chronic workload.

    </div>
)
const ChronicWorkLoadInfo = () => (
    <div className='paragraphDiv'>
        Corvus is a cloud based platform which aims to provide every user with an accessible means in which to track their own training and reduce their exposure to injury. Corvus is based around the scientific principle of Acute Chronic Workload Ratio (ACWR). This value is comprised of two parts: your acute workload and your chronic workload.

    </div>
)
export default withRouter(LearnMorePage);