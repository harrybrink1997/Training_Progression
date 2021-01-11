/*
Written: 15/10
Author: Harry Brink

Creates a firebase object with the configuration as set in the .env file. 

*/
import * as app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/functions'
import { ADMIN } from '../../constants/routes';

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
        this.db = app.database();
        this.functions = app.functions()

    }


    grantModeratorRole = (id, role) => {
        var moderatorFunction = this.functions.httpsCallable('setUserPrivledges');

        moderatorFunction({ userType: role })
            .then(result => {
                return true
            })
            .catch(error => {
                console.log(`error: ${JSON.stringify(error)}`)
            })

        // this.functions.httpsCallable('addUserPrivledges')({ userType: role })
    }

    isAuthenticatedUser = () => {
        return this.auth.currentUser
    }

    // AUTHENTICATION API
    doCreateUserWithEmailAndPassword = (email, password) => {
        return this.auth.createUserWithEmailAndPassword(email, password);
    }

    doSignInWithEmailAndPassword = (email, password) => {
        return this.auth.signInWithEmailAndPassword(email, password);
    }

    doSignOut = () => {
        return this.auth.signOut();
    }

    doPasswordReset = (email) => {
        return this.auth.sendPasswordResetEmail(email);
    }

    doPasswordUpdate = (password) => {
        return this.auth.currentUser.updatePassword(password)
    }

    doEmailUpdate = (email) => {
        return this.auth.currentUser.updateEmail(email)
    }

    doDeleteAuthentication = () => {
        return this.auth.currentUser.delete()
    }

    deleteUserInDatabase = (uid) => {
        return this.db
            .ref(`users/${uid}`)
            .remove()
    }

    updateEmailInDatabase = (uid, email) => {
        return this.db
            .ref(`users/${uid}/email`)
            .set(email)
    }

    // USER API
    getUserData = (uid) => this.db.ref(`users/${uid}`);

    createUserUpstream = (submitInfo) => {
        return this.db
            .ref('/')
            .update(submitInfo)
    }

    acceptTeamRequestUpstream = (submitInfo) => {
        return this.db
            .ref('/')
            .update(submitInfo)
    }

    sendTeamRequestUpstream = (athlete, coach, message) => {
        return this.db
            .ref(`users/${coach}/teamRequests/${athlete}`)
            .set(message)
    }

    userTypes = () => this.db.ref('userTypes')

    userType = (uid) => {
        return this.db.ref(`users/${uid}/userType`)
    }

    getProgramData = (uid, programName) => {
        return this.db.ref(`users/${uid}/currentPrograms/${programName}`)
    }

    users = () => this.db.ref('users');

    exercisesName = name => this.db.ref(`exercises/${name}`)

    exercises = () => this.db.ref('exercises')

    anatomy = () => this.db.ref('anatomy')

    localExerciseData = (uid) => this.db.ref(`users/${uid}/localExercises`)


    modifyGoalUpstream = (uid, pName, goalPath, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}/goals/${goalPath}`)
            .set(value)
    }

    createSubGoalUpstream = (uid, pName, mainGoal, goalInfo) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}/goals/${mainGoal}`)
            .update(goalInfo)
    }

    createMainGoalUpstream = (uid, pName, newGoalUID, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}/goals/${newGoalUID}`)
            .set(value)
    }

    completeGoalUpstream = (uid, pName, goalPath, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}/goals/${goalPath}/completed`)
            .set(value)
    }

    updateGoalStatusesUpstream = (uid, pName, goalInfo) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}/goals`)
            .update(goalInfo)
    }

    deleteGoalUpstream = (uid, pName, goalPath) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}/goals/${goalPath}`)
            .remove()
    }

    createProgramUpstream = (uid, pName, acuteP, chronicP, lScheme, startDay, sUTS, goalList) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}`)
            .set({
                loading_scheme: lScheme,
                acutePeriod: acuteP,
                chronicPeriod: chronicP,
                startDayUTS: sUTS,
                currentDayInProgram: startDay,
                currentDayUTS: sUTS,
                goals: goalList
            })
    }

    setActiveProgram = (uid, name) => {
        return this.db
            .ref(`users/${uid}/activeProgram`)
            .set(name)

    }

    // TODO remove
    setCurrentDay = (uid, progName, day) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/currentDay`)
            .set(day)

    }

    setCurrentDayUI = (uid, progName, day) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/currentDayUI`)
            .set(day)

    }

    // TODO remove
    createExerciseUpStreamRemove = (uid, progName, week, day, exercise, exUid) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/${day}/${exUid}`)
            .set(exercise)
    }

    createExerciseUpStream = (uid, progName, day, exercise, exUid) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${day}/${exUid}`)
            .set(exercise)
    }

    createBulkExercisesUpstream = (uid, progName, days) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}`)
            .update(days)
    }

    handleSubmitDayUpstream = (uid, progName, submitInfo) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}`)
            .update(submitInfo)
    }


    createNewExerciseReferenceUpstream = (uid, exName, exData) => {
        return this.db
            .ref(`users/${uid}/localExercises/${exName}`)
            .set(exData)
    }

    pushExercisePropertiesUpstreamRemove = (uid, progName, week, day, exUid, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/${day}/${exUid}`)
            .set(value)
    }
    pushExercisePropertiesUpstream = (uid, progName, day, exUid, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${day}/${exUid}`)
            .set(value)
    }

    // TODO REMOVE
    pushWeekLoadingDataUpstream = (uid, progName, week, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/loadingData`)
            .set(value)
    }
    pushDailyLoadingDataUpstream = (uid, progName, day, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${day}/loadingData`)
            .set(value)
    }

    pushRollingAverageUpstream = (uid, progName, weeksID, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/rollingAverages/${weeksID}`)
            .set(value)
    }

    // TODO Remove
    deleteExerciseUpStreamRemove = (uid, progName, week, day, exUid) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/${day}/${exUid}`)
            .remove()
    }

    deleteExerciseUpStream = (uid, progName, day, exUid) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${day}/${exUid}`)
            .remove()
    }

    closeOffProgramUpstream = (uid, progName) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}`)
            .remove()
    }

    appendEndDateUpstream = (uid, progName, endUTS) => {
        return this.db
            .ref(`users/${uid}/pastPrograms/${progName}/endDayUTS`)
            .set(endUTS)
    }

    transferProgramToRecordsUpstream = (uid, progName, val) => {
        return this.db
            .ref(`users/${uid}/pastPrograms/${progName}`)
            .set(val)
    }

    pushPastProgramNotesUpstream = (uid, progName, val) => {
        return this.db
            .ref(`users/${uid}/pastPrograms/${progName}/notes`)
            .set(val)
    }

    // TODO REMOVE
    progressToNextWeek = (uid, progName, val) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/currentWeek`)
            .set(val)
    }


    progressToNextDay = (uid, progName, val) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/currentDayInProgram`)
            .set(val)
    }

    deleteCurrentProgramsUpstream = (payLoad) => {
        return this.db
            .ref('/')
            .update(payLoad)
    }

    deletePastProgramUpstream = (uid, progName) => {
        return this.db
            .ref(`users/${uid}/pastPrograms/${progName}`)
            .remove()
    }

    createTeamUpstream = (teamInfo) => {
        return this.db
            .ref('/')
            .update(teamInfo)
    }
}
export default Firebase