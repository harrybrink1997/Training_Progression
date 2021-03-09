import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import AccountPage from '../Account';
import AdminPage from '../Admin';
import SafetyGraphPage from '../SafetyGraph'
import ProgressionDataPage from '../ProgressionData'
import CurrentProgramPage from '../CurrentProgram'
import PastProgramPage from '../PastPrograms'
import LearnMorePage from '../LearnMore'
import PasswordChangePage from '../PasswordChange'
import EmailChangePage from '../EmailChange'
import DeleteAccountPage from '../DeleteAccount'
import ManageCoachesPage from '../ManageCoaches'
import ManageAthletesPage from '../ManageAthletes'
import ManageCoachTeamsPage from '../ManageCoachTeams'
import ManageAthleteTeamsPage from '../ManageAthleteTeams'
import ManageProgramsPage from '../ManagePrograms'
import CreateCoachTeamPage from '../CreateCoachTeam'
import ManageExercisesPage from '../ManageExercises'
import VerifyEmailPage from '../VerifyEmail'

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

import 'semantic-ui-css/semantic.min.css';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

// CSS Modules to Include
import '../../CustomCSS/editExerciseModal.css'
import '../../CustomCSS/darkMode.css'
import '../../CustomCSS/standardElements.css'
import '../../CustomCSS/landingPage.css'
import '../../CustomCSS/loginPage.css'
import '../../CustomCSS/learnMorePage.css'
import '../../CustomCSS/semanticUIButton.css'
import '../../CustomCSS/semanticUICards.css'
import '../../CustomCSS/nonPageSpecific.css'
import '../../CustomCSS/progressionPage.css'
import '../../CustomCSS/semanticUIMenu.css'
import '../../CustomCSS/semanticUIBreadCrumb.css'
import '../../CustomCSS/currentProgramsPage.css'
import '../../CustomCSS/pastProgramsPage.css'
import '../../CustomCSS/manageAthletesPage.css'
import '../../CustomCSS/manageTeamsPage.css'
import '../../CustomCSS/manageProgramsPage.css'
import '../../CustomCSS/homePage.css'
import '../../CustomCSS/deleteAccountPage.css'
import '../../CustomCSS/accountPage.css'
import '../../CustomCSS/semanticUIStatistic.css'
import '../../CustomCSS/semanticUITable.css'
import '../../CustomCSS/semanticUINavBar.css'
import '../../CustomCSS/semanticUIPagination.css'
import '../../CustomCSS/semanticUIDropdown.css'
import '../../CustomCSS/semanticUIPopUp.css'
import '../../CustomCSS/semanticUIForm.css'
import '../../CustomCSS/joyride.css'
import '../../CustomCSS/fullPageForm.css'

const App = () => {

    return (
        < Router>
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
            <Route path={ROUTES.SIGN_IN} component={SignInPage} />
            <Route
                path={ROUTES.PASSWORD_FORGET}
                component={PasswordForgetPage}
            />
            <Route path={ROUTES.HOME} component={HomePage} />
            <Route path={ROUTES.ACCOUNT} component={AccountPage} />
            {/* <Route path={ROUTES.ADMIN} component={AdminPage} /> */}
            <Route path={ROUTES.SAFETY_GRAPH} component={SafetyGraphPage} />
            <Route path={ROUTES.PROG_DATA} component={ProgressionDataPage} />
            <Route path={ROUTES.CURRENT_PROGRAMS} component={CurrentProgramPage} />
            <Route path={ROUTES.PAST_PROGRAMS} component={PastProgramPage} />
            <Route path={ROUTES.LEARN_MORE} component={LearnMorePage} />
            <Route path={ROUTES.PASSWORD_CHANGE} component={PasswordChangePage} />
            <Route path={ROUTES.EMAIL_CHANGE} component={EmailChangePage} />
            <Route path={ROUTES.DELETE_ACCOUNT} component={DeleteAccountPage} />
            <Route path={ROUTES.MANAGE_COACHES} component={ManageCoachesPage} />
            <Route path={ROUTES.MANAGE_ATHLETES} component={ManageAthletesPage} />
            <Route path={ROUTES.MANAGE_COACH_TEAMS} component={ManageCoachTeamsPage} />
            <Route path={ROUTES.MANAGE_ATHLETE_TEAMS} component={ManageAthleteTeamsPage} />
            <Route path={ROUTES.MANAGE_PROGRAMS} component={ManageProgramsPage} />
            <Route path={ROUTES.CREATE_COACH_TEAM} component={CreateCoachTeamPage} />
            <Route path={ROUTES.MANAGE_EXERCISES} component={ManageExercisesPage} />
            <Route path={ROUTES.VERIFY_EMAIL} component={VerifyEmailPage} />
        </Router >
    )
};

export default withAuthentication(App);