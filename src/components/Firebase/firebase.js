/*
Written: 15/10
Author: Harry Brink

Creates a firebase object with the configuration as set in the .env file. 

*/
import * as app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/'
const FieldValue = app.firestore.FieldValue

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
        this.database = app.firestore()
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

    //////////////////////////////////////////////
    //////////// FIRESTORE FUNCTIONS /////////////
    //////////////////////////////////////////////

    getUser = (id) => {
        return this.database
            .collection('users')
            .doc(id)
            .get()
    }

    createUserDB = (id, payLoad) => {
        return this.database
            .collection('users')
            .doc(id)
            .set(payLoad)
    }

    getUserPrograms = (id) => {
        return this.database
            .collection('programs')
            .where('athlete', '==', id)
            .get()
    }

    createProgramDB = (programUID, programData, goalData) => {
        const batch = this.database.batch()

        batch.set(
            this.database.collection('programs').doc(programUID),
            programData
        )

        if (goalData) {
            goalData.forEach(goal => {
                batch.set(
                    this.database.collection('goals').doc(),
                    goal
                )
            })
        }

        return batch.commit()
    }

    deleteProgramDB = (programUID) => {
        return this.database
            .collection('programs')
            .doc(programUID)
            .delete()
    }

    submitDayDB = (programUID, day, loadingData) => {
        return this.database
            .collection('programs')
            .doc(programUID)
            .collection('exercises')
            .doc(day.toString())
            .set({ loadingData: loadingData }, { merge: true })
            .then(res => {
                return this.database
                    .collection('programs')
                    .doc(programUID)
                    .update({
                        currentDay: day + 1
                    })
            })
            .catch(error => {
                return error
            })
    }

    getAnatomyData = () => {
        return this.database
            .collection('anatomy')
            .doc('ykgEqKnLxEgp3SHiOe8W')
            .get()
    }

    getExData = (owners) => {
        return this.database
            .collection('exercises')
            .where('owner', 'in', owners)
            .get()
    }

    addExerciseDB = (programID, day, exData) => {
        return this.database
            .collection('programs')
            .doc(programID)
            .collection('exercises')
            .doc(day)
            .set(exData, { merge: true })
    }

    deleteExerciseDB = (programID, day, exUID) => {

        return this.database
            .collection('programs')
            .doc(programID)
            .collection('exercises')
            .doc(day)
            .get()
            .then(snapshot => {
                const data = snapshot.data()
                console.log(data)
                if (Object.keys(data).length > 1) {
                    this.database
                        .collection('programs')
                        .doc(programID)
                        .collection('exercises')
                        .doc(day)
                        .update({
                            [exUID]: FieldValue.delete()
                        })
                        .then(res => {
                            console.log(res)
                        })
                } else {
                    this.database
                        .collection('programs')
                        .doc(programID)
                        .collection('exercises')
                        .doc(day)
                        .delete()
                }
            })



    }

    updateExerciseDB = (programID, day, exUID, exData) => {
        return this.database
            .collection('programs')
            .doc(programID)
            .collection('exercises')
            .doc(day)
            .update({
                [exUID]: exData
            })
    }

    startProgramDB = (programUID, timestamp) => {

        return this.database
            .collection('programs')
            .doc(programUID)
            .update({ startDayUTS: timestamp })
    }

    getProgGoalData = (programUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .get()
                .then(snapshot => {

                    var payLoad = {}

                    if (!snapshot.empty) {
                        snapshot.docs.forEach(doc => {
                            let data = doc.data()
                            let goalUID = data.goalProgUID
                            delete data.goalProgUID
                            payLoad[goalUID] = data
                        })
                        res(payLoad)
                    } else {
                        res(payLoad)
                    }

                })
                .catch(error => {
                    rej(error)
                })
        })

    }

    getProgramExData = (programUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .doc(programUID)
                .collection('exercises')
                .get()
                .then(snapshot => {
                    if (!snapshot.empty) {
                        var payLoad = {}
                        snapshot.docs.forEach(doc => {

                            payLoad[doc.id] = { ...doc.data() }

                        })
                        res(payLoad)
                    } else {
                        return res({})
                    }
                })
                .catch(error => {
                    rej(error)
                })

        })
    }

    getProgramExGoalData = (programUID) => {

        var promises = [this.getProgGoalData(programUID), this.getProgramExData(programUID)]

        return promises
    }

    changeGoalCompletionStatusDB = (programUID, goalProgUID, goalData) => {
        return this.database
            .collection('goals')
            .where('programUID', '==', programUID)
            .where('goalProgUID', '==', goalProgUID)
            .get()
            .then(snap => {
                var docRef = this.database.collection('goals').doc(snap.docs[0].id)
                const batch = this.database.batch()
                if (goalData.mainGoal) {
                    batch.update(docRef, { 'mainGoal.completed': goalData.mainGoal.completed })
                }

                if (goalData.subGoal) {
                    var subGoalPath = `subGoals.${goalData.subGoal.dbUID}.completed`
                    batch.update(docRef, { [subGoalPath]: goalData.subGoal.completed })
                }

                batch.commit()
            })
    }

    createMainGoalDB = (payload) => {
        return this.database.collection('goals').doc().set(payload)
    }

    createSubGoalDB = (programUID, payload) => {
        this.database
            .collection('goals')
            .where('programUID', '==', programUID)
            .where('goalProgUID', '==', payload.parentGoal)
            .get()
            .then(snap => {
                var docRef = this.database.collection('goals').doc(snap.docs[0].id)

                var subGoalPath = `subGoals.${payload.goalDBUID}`

                docRef.update({
                    [subGoalPath]: payload.data
                })
            })
    }

    deleteGoalDB = (programUID, payload) => {
        if (payload.isMainGoal) {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('goalProgUID', '==', payload.goalDBUID)
                .get()
                .then(snap => {
                    this.database.collection('goals').doc(snap.docs[0].id).delete()
                })
        } else {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('goalProgUID', '==', payload.parentGoal)
                .get()
                .then(snap => {
                    var docRef = this.database.collection('goals').doc(snap.docs[0].id)
                    var docData = snap.docs[0].data()
                    if (Object.keys(docData.subGoals).length === 1) {
                        docRef.update({
                            subGoals: FieldValue.delete()
                        })
                    } else {
                        var subGoalPath = `subGoals.${payload.goalDBUID}`
                        docRef.update({
                            [subGoalPath]: FieldValue.delete()
                        })
                    }
                })
        }
    }

    editGoalDB = (programUID, payload) => {
        if (payload.isMainGoal) {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('goalProgUID', '==', payload.goalDBUID)
                .get()
                .then(snap => {
                    this.database.collection('goals').doc(snap.docs[0].id).update({
                        mainGoal: payload.data
                    })
                })
        } else {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('goalProgUID', '==', payload.parentGoal)
                .get()
                .then(snap => {
                    var docRef = this.database.collection('goals').doc(snap.docs[0].id)

                    var subGoalPath = `subGoals.${payload.goalDBUID}`

                    docRef.update({
                        [subGoalPath]: payload.data
                    })
                })
        }
    }
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////



    // USER API
    // TODO REMOVE AFTER DATABASE MIGRATION
    getUserData = (uid) => this.db.ref(`users/${uid}`);

    getCoachCurrAthData = (uid) => this.db.ref(`users/${uid}/currentAthletes`)

    // TODO REMOVE AFTER DB MIGRATION
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

    getSharedPrograms = (coachUID, athleteUID, team) => {
        return this.db.ref(`users/${coachUID}/currentAthletes/${athleteUID}/teams/${team}`)
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

    closeOffProgramUpstream = (payLoad) => {
        return this.db
            .ref('/')
            .update(payLoad)
    }

    pushPastProgramNotesUpstream = (uid, progName, val) => {
        return this.db
            .ref(`users/${uid}/pastPrograms/${progName}/notes`)
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

    createProgramGroupUpstream = (uid, groupName, val) => {
        return this.db
            .ref(`users/${uid}/programGroups/${groupName}`)
            .set(val)
    }

    createTeamUpstream = (teamInfo) => {
        return this.db
            .ref('/')
            .update(teamInfo)
    }

    processPendingProgramsUpstream = (programData) => {
        return this.db
            .ref('/')
            .update(programData)
    }

    updateDatabaseFromRootPath = (payLoad) => {
        return this.db
            .ref('/')
            .update(payLoad)
    }
}
export default Firebase