import React from 'react'
import ReactJoyride from 'react-joyride';

const OnBoarding = ({ run }) => {

    return (
        <div>
            <ReactJoyride
                steps={steps}
                run={true}
                styles={style}
                continuous={true}
                showProgress={true}
                showSkipButton={true}
                disableOverlayClose={true}
            />
        </div>
    )
}

const style = {
    options: {
        backgroundColor: '#333333',
        arrowColor: '#333333',
        primaryColor: '#BB86FC',
    },
    buttonClose: {
        display: 'none',
    }
}


const steps = [
    {
        title: 'Welcome!',
        content: 'Welcome to Corvus Strength, lets go over a few key things to get you started',
        target: 'body',
        placement: 'center'
    },
    {
        content: "Firstly, some housekeeping. All account related issues can be attended to through here.",
        target: '[href="/account"]',
    },
    {
        content: "You'll want to start by creating a program. This can be done through here.",
        target: '#hpMidBtnContainer > button'
    },
    {
        content: "Once created, you can access all your current programs here. You'll be able to add exercises, fill in your program information and even add more goals.",
        target: '[href="/current-programs"]',
    },
    {
        content: "Once you're up and running you can view your progression stats here.",
        target: '[href="/progression"]',
    },
    {
        content: "Don't worry about closing off programs and starting new ones. All past program data including exercise/goal history and loading stats can be viewed here.",
        target: '[href="/past-programs"]',
    },
    {
        content: "A last note on programs. If you want to delete a program this can be done through here. Both past programs and current programs are able to be deleted.",
        target: '#hpLeftBtnContainer > button'
    },
    {
        content: "And Lastly! If you're unable to find an exercise in our database, or you prefer to call an exercise by another name, just add it in to your local exercise list. Customisation is key!",
        target: '#hpRightBtnContainer > button'
    }
]

export default OnBoarding