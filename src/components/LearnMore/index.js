import React, { Component } from 'react'
import { Icon, Statistic, StatisticGroup, Image } from 'semantic-ui-react'
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
                        A High Level Overview
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
                <Image src={require("./ACWR_equation.png")} size='medium' centered />
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
                <DeepDiveAnalogy />
                <div className="pageContainerLevel2">
                    <div className='learnMorePageInfoSubHeader'>
                        Load Calculations
                    </div>
                    <div className='learnMorePageInfoSubSubHeader'>
                        (A bit more Math)
                    </div>
                    <LoadCalculationsStart />
                </div>
            </div>
        </div >
    )
}

const LightPurpleText = ({ text, fontSize, fontWeight }) => {
    return (
        <div style={{ fontSize: fontSize, fontWeight: fontWeight, color: '#BB86FC' }}>
            {' ' + text + ' '}
        </div>
    )
}


const LoadCalculationsStart = () => (
    <div className='paragraphDiv'>
        The following section contains involved mathematics, however, details on how the acute and chronic load components are calculated is deconstructed. A worked example will be demonstrated after.

        <br /><br />

        Currently there are two accepted techniques for calculating Chronic and Acute Workload. Rolling Average (RA) and Exponentially Weighted Moving Average (EWMA). Corvus Strength implements EWMA as it has demonstrated higher sensitivity in predicitive models.

        <br /><br />

        EWMA is an averaging algorithm which gives higher priority to events that have more recently occured. In terms of Corvus Strength, this means training completed a day ago has a greater impact on your current fitness levels then training completed 3 weeks ago.

        <br /><br />

        The following equation below shows the EWMA algorithm used to calculate the Acute/Chronic Workload for day n in a program.
        <Image src={require('./summation.png')} size='big' centered />
        Where:
        <ul>
            <li>n - Number of days</li>
            <li>a<sub>n</sub> - Acute/Chronic Load for day n</li>
            <li>&alpha; - Decay Constant</li>
            <li>T - Acute/Chronic Timeframe</li>
            <li>L<sub>j</sub> - Net Daily Load for day j</li>
        </ul>
    </div>
)
const DeepDiveRecap = () => (
    <div className='paragraphDiv'>

        The main scientific principle which encompasses Corvus Strength is the theory of Acute Chronic Workload Ratio (ACWR). ACWR is the ratio between two key components: Acute Workload and Chronic Workload.

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
        Acute Workload is the training load you have accumlated over a recent period of time (generally a single week). It is representative of your fatigue and is the main predictor of injury in our model.

    </div>
)
const ChronicWorkLoadInfo = () => (
    <div className='paragraphDiv'>
        Chronic Workload is the training load you have accumlated over a long period of time (generally a month). It is representative of your body's current readiness to undertake new training loads.
    </div>
)

const DeepDiveAnalogy = () => (
    <div className='paragraphDiv'>
        Through monitoring this ratio, we are able to predict future training loads which minimise the chance of injury, whilst maximising the progression in training. Maintaining an ACWR between approximately 0.8 and 1.2 has been determined to be the 'sweet spot' (reference).

        <br /><br />

        Understanding the above concept is essential to understanding how the predictive model works and the role of each loading component. The ACWR is analogous to how a tree grows. The water a tree receives is the acute load and the tree's root system is the chronic load. At its infancy, the tree has a small root system. Dousing the tree with too much water may cause the tree to drown (injury). Not enough water will cause the tree to shrivel (injury). Providing the tree with the correct amount of water will allow the root system to grow. This growth over time (increase in chronic workload) allows to the root system to intake larger amounts of water (acute workload) without drowing, which corresponds to more root growth. This process is cyclic and will continue whilst the correct amount of water is given to the tree.
    </div>
)
export default withRouter(LearnMorePage);