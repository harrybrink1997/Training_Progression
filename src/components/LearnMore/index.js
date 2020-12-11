import React, { Component } from 'react'
import { Icon, Statistic, StatisticGroup } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'

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
                        What Is Corvus?
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


const HighLevelRecap = () => (
    <div className='paragraphDiv'>
        Corvus is a cloud based platform which aims to provide every user with an accessible means in which to track their own training and reduce their exposure to injury. Corvus is based around the scientific principle of Acute Chronic Workload Ratio (ACWR). This value is comprised of two parts: your acute workload and your chronic workload.

    </div>
)

const AcuteWorkLoadInfo = () => (
    <div className='paragraphDiv'>
        Corvus is a cloud based platform which aims to provide every user with an accessible means in which to track their own training and reduce their exposure to injury. Corvus is based around the scientific principle of Acute Chronic Workload Ratio (ACWR). This value is comprised of two parts: your acute workload and your chronic workload.

    </div>
)
const ChronicWorkLoadInfo = () => (
    <div className='paragraphDiv'>
        Corvus is a cloud based platform which aims to provide every user with an accessible means in which to track their own training and reduce their exposure to injury. Corvus is based around the scientific principle of Acute Chronic Workload Ratio (ACWR). This value is comprised of two parts: your acute workload and your chronic workload.

    </div>
)
export default withRouter(LearnMorePage);