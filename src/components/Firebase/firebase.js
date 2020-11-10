/*
Written: 15/10
Author: Harry Brink

Creates a firebase object with the configuration as set in the .env file. 

*/
import * as app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

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

    // USER API
    getUserData = (uid) => this.db.ref(`users/${uid}`);

    getProgramData = (uid, programName) => {
        return this.db.ref(`users/${uid}/currentPrograms/${programName}`)
    }

    users = () => this.db.ref('users');

    exercisesName = name => this.db.ref(`exercises/${name}`)

    exercises = () => this.db.ref('exercises')

    createProgramUpstream = (uid, pName, acuteP, chronicP, lScheme, sUTS) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${pName}`)
            .set({
                loading_scheme: lScheme,
                acutePeriod: acuteP,
                chronicPeriod: chronicP,
                startDayUTS: sUTS,
                currentDayInProgram: 1,
                currentDayUTS: sUTS,
                currentDay: 1, // TODO remove after handover
                currentWeek: 1, // TODO remove after handover
            })
    }

    setActiveProgram = (uid, name) => {
        return this.db
            .ref(`users/${uid}/activeProgram`)
            .set(name)

    }

    setCurrentDay = (uid, progName, day) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/currentDay`)
            .set(day)

    }

    createExerciseUpStream = (uid, progName, week, day, exercise, exUid) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/${day}/${exUid}`)
            .set(exercise)
    }

    pushExercisePropertiesUpstream = (uid, progName, week, day, exUid, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/${day}/${exUid}`)
            .set(value)
    }

    pushWeekLoadingDataUpstream = (uid, progName, week, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/loadingData`)
            .set(value)
    }

    pushRollingAverageUpstream = (uid, progName, weeksID, value) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/rollingAverages/${weeksID}`)
            .set(value)
    }

    deleteExerciseUpStream = (uid, progName, week, day, exUid) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/${week}/${day}/${exUid}`)
            .remove()
    }

    closeOffProgramUpstream = (uid, progName) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}`)
            .remove()
    }

    transferProgramToRecordsUpstream = (uid, progName, val) => {
        return this.db
            .ref(`users/${uid}/pastPrograms/${progName}`)
            .set(val)
    }

    progressToNextWeek = (uid, progName, val) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}/currentWeek`)
            .set(val)
    }

    deleteCurrentProgramUpstream = (uid, progName) => {
        return this.db
            .ref(`users/${uid}/currentPrograms/${progName}`)
            .remove()
    }

    deletePastProgramUpstream = (uid, progName) => {
        return this.db
            .ref(`users/${uid}/pastPrograms/${progName}`)
            .remove()
    }
}
export default Firebase