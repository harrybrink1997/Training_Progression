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
import { thomsonCrossSectionDependencies } from 'mathjs'
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

    validCoachRequest = (email, athleteUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .where('email', '==', email)
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res({
                            success: false,
                            error: 'invalidEmail'
                        })
                    } else {
                        const userData = snap.docs[0].data()
                        const coachUID = snap.docs[0].id

                        if (userData.userType !== 'coach') {
                            res({
                                success: false,
                                error: 'invalidEmail'
                            })
                        } else {

                            Promise.all([
                                this.currCoachAthleteRel(coachUID, athleteUID),
                                this.currCoachRequest(coachUID, athleteUID),
                            ]).then(snap => {
                                if (!snap[0]) {
                                    res({
                                        success: false,
                                        error: 'alreadyMember'
                                    })
                                } else if (!snap[1]) {
                                    res({
                                        success: false,
                                        error: 'alreadyRequested'
                                    })
                                } else {
                                    res({
                                        success: true,
                                        error: undefined,
                                        coachUID: coachUID,
                                        coachUsername: userData.username
                                    })
                                }
                            })
                        }
                    }
                })
        })

    }

    createCurrentCoachAthlete = (coachUID, athleteUID, payload) => {
        return new Promise((res, rej) => {
            this.database
                .collection('coachRequests')
                .where('coachUID', '==', coachUID)
                .where('athleteUID', '==', athleteUID)
                .get()
                .then(snap => {
                    const docID = snap.docs[0].id
                    const batch = this.database.batch()
                    const currAthRef = this.database.collection('currentCoachAthletes').doc()
                    const requestRef = this.database.collection('coachRequests').doc(docID)

                    batch.delete(requestRef)
                    batch.set(currAthRef, payload)

                    batch.commit().then(() => {
                        res(true)
                    })
                })
        })


    }

    getCoachTeamOverviewData = (coachUID) => {
        return this.database
            .collection('users')
            .doc(coachUID)
            .collection('teams')
            .get()
            .then(snap => {
                if (snap.empty) {
                    return []
                } else {
                    var payload = []
                    snap.docs.forEach(doc => {
                        payload.push(doc.data())
                    })
                    return payload
                }
            })
    }

    getCoachRequestData = (uid, idType) => {
        return this.database
            .collection('coachRequests')
            .where(idType, '==', uid)
            .get()
            .then(snap => {
                if (snap.empty) {
                    return []
                } else {
                    return snap.docs.map(doc => {
                        return doc.data()
                    })
                }
            })
    }

    createCoachRequestDB = (payload) => {
        return this.database
            .collection('coachRequests')
            .doc()
            .set(payload)
    }

    currCoachAthleteRel = (coachUID, athleteUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('athleteUID', '==', athleteUID)
                .where('coachUID', '==', coachUID)
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res(true)
                    } else {
                        res(false)
                    }
                })
        })
    }

    currCoachRequest = (coachUID, athleteUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('coachRequests')
                .where('athleteUID', '==', athleteUID)
                .where('coachUID', '==', coachUID)
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res(true)
                    } else {
                        res(false)
                    }
                })
        })
    }

    getUser = (id) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .doc(id)
                .get()
                .then(snap => {
                    res(snap)
                })
        })
    }

    createUserDB = (id, payLoad) => {
        return this.database
            .collection('users')
            .doc(id)
            .set(payLoad)
    }


    getUserPrograms = (id, userType) => {
        if (userType !== 'coach') {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('athlete', '==', id)
                    .get()
                    .then(snap => {
                        if (snap.empty) {
                            res([])
                        } else {
                            var payload = []
                            snap.docs.forEach(doc => {
                                payload.push(doc.data())
                            })
                            res(payload)
                        }
                    })
            })
        } else {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('owner', '==', id)
                    .where('athlete', '==', id)
                    .get()
                    .then(snap => {
                        if (snap.empty) {
                            res([])
                        } else {
                            var payload = []
                            snap.docs.forEach(doc => {
                                payload.push(doc.data())
                            })
                            res(payload)
                        }
                    })
            })
        }
    }

    createProgramGroupDB = (coachUID, groupName, payload) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .doc(coachUID)
                .collection('programGroups')
                .doc('programGroups')
                .set({
                    [groupName]: payload
                }, { merge: true })
                .then(() => {
                    this.database
                        .collection('users')
                        .doc(coachUID)
                        .collection('programGroups')
                        .doc('programGroups')
                        .get()
                        .then(snap => {
                            res(snap.data())
                        })
                })
        })
    }

    createProgramDB = (programData, goalData) => {
        return new Promise((res, rej) => {
            const batch = this.database.batch()

            batch.set(
                this.database.collection('programs').doc(),
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

            batch.commit().then(() => {
                res(true)
            })
        })

    }

    getCurrentTeamNames = (coachUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .doc(coachUID)
                .collection('teams')
                .get()
                .then(snap => {
                    var payload = ['none']

                    if (!snap.empty) {

                        snap.docs.forEach(doc => {
                            payload.push(doc.data().teamName)
                        })
                    }

                    res(payload)
                })
        })
    }

    getCreateTeamData = (coachUID) => {

        return new Promise((res, rej) => {
            Promise.all([
                this.getCoachProgramGroups(coachUID),
                this.getCoachCurrentAthletes(coachUID),
                this.getUserPrograms(coachUID, 'coach'),
                this.getCurrentTeamNames(coachUID)
            ]).then(snap => {
                res({
                    programGroups: snap[0],
                    currentAthletes: snap[1],
                    programs: snap[2],
                    currentTeamNames: snap[3]
                })
            })
        })
    }

    getCoachProgramGroups = (coachUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .doc(coachUID)
                .collection('programGroups')
                .doc('programGroups')
                .get()
                .then(snap => {
                    if (snap.exists) {
                        res(snap.data())
                    } else {
                        res(undefined)
                    }
                })
        })
    }

    getCoachCurrentAthletes = (coachUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('coachUID', '==', coachUID)
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res([])
                    } else {
                        var promises = []
                        var athleteData = []
                        snap.docs.forEach(doc => {
                            let athData = {
                                joiningDate: doc.data().joiningDate,
                                athleteUID: doc.data().athleteUID
                            }
                            athleteData.push(athData)

                            promises.push(
                                this.getUser(doc.data().athleteUID)
                            )
                        })

                        Promise.all(promises)
                            .then(athleteSnaps => {
                                var payload = []
                                var index = 0
                                athleteSnaps.forEach(athleteSnap => {
                                    var athleteInfo = athleteSnap.data()
                                    athleteInfo.athleteUID = athleteData[index].athleteUID
                                    athleteInfo.joiningDate = athleteData[index].joiningDate

                                    payload.push(athleteInfo)
                                    index++
                                })
                                res(payload)

                            })
                    }
                })
        })
    }

    deployAthletePrograms = (coachUID, athleteUID, programData) => {
        return new Promise((res, rej) => {
            const batch = this.database.batch()

            var programUIDList = Object.keys(programData)

            var currentPendingPromises = []

            currentPendingPromises.push(
                this.removeAthleteAssignedPendingProgramList(
                    coachUID,
                    athleteUID,
                    programUIDList
                )
            )


            Promise.all(currentPendingPromises).then(result => {
                var completeProgramData = []

                programUIDList.forEach(programUID => {
                    completeProgramData.push(
                        this.generateProgDeploymentData(coachUID, programUID)
                    )
                })

                Promise.all(completeProgramData).then(data => {
                    data.forEach(program => {
                        var feProgObj = programData[program.programInfo.programUID]

                        var programRef = this.database.collection('programs').doc()

                        let progAthInfo = { ...program.programInfo }

                        if (!feProgObj.isUnlimited) {
                            progAthInfo.order = feProgObj.order
                            progAthInfo.isActiveInSequence = feProgObj.isActiveInSequence
                        }

                        progAthInfo.deploymentDate = feProgObj.deploymentDate
                        progAthInfo.athlete = athleteUID
                        progAthInfo.status = 'pending'
                        progAthInfo.team = 'none'

                        batch.set(programRef, progAthInfo)
                        Object.keys(program.exData).forEach(day => {
                            var dayRef = programRef.collection('exercises').doc(day)
                            batch.set(dayRef, program.exData[day])
                        })
                    })
                    batch.commit().then(() => {
                        this.getCoachAthletePrograms(coachUID, athleteUID).then(updatedProgramData => {
                            res(updatedProgramData)
                        })
                    })
                })

            })
        })
    }

    createTeamDB = (coachUID, coachPayload, athletePayload, athleteList, progInfo) => {

        return new Promise((res, rej) => {
            const batch = this.database.batch()

            var promises = []
            Object.keys(progInfo).forEach(prog => {
                promises.push(this.generateProgDeploymentData(coachUID, prog))
            })

            Promise.all(promises).then(data => {

                var programUIDList = Object.keys(progInfo)
                let currProgDelPromises = []
                athleteList.forEach(athlete => {
                    currProgDelPromises.push(
                        this.removeAthleteAssignedPendingProgramList(
                            coachUID,
                            athlete,
                            programUIDList
                        )
                    )
                })

                Promise.all(currProgDelPromises).then(() => {

                    if (data.length !== 0) {
                        data.forEach(program => {
                            console.log(program)
                            program.programInfo.status = 'pending'
                            program.programInfo.deploymentDate = progInfo[program.programInfo.programUID].deploymentDate
                            program.programInfo.team = coachPayload.teamName

                            if (!progInfo[program.programInfo.programUID].isUnlimited) {
                                program.programInfo.order = progInfo[program.programInfo.programUID].order
                                program.programInfo.isActiveInSequence = progInfo[program.programInfo.programUID].isActiveInSequence
                            }

                            athleteList.forEach(athlete => {
                                var progData = { ...program.programInfo }
                                progData.athlete = athlete

                                var progRef = this.database.collection('programs').doc()

                                batch.set(progRef, progData)
                                var exRef = progRef.collection('exercises')

                                Object.keys(program.exData).forEach(day => {
                                    batch.set(exRef.doc(day), program.exData[day])
                                })
                            })
                        })
                    }

                    var coachRef = this.database
                        .collection('users')
                        .doc(coachUID)
                        .collection('teams')
                        .doc()

                    batch.set(coachRef, coachPayload)

                    if (athleteList.length > 0) {
                        var athPromises = []

                        athleteList.forEach(athlete => {
                            athPromises.push(this.getCurrentCoachAthDocUID(athlete, coachUID))
                        })

                        Promise.all(athPromises).then(athData => {
                            athData.forEach(docUID => {
                                var currCoachAthDocRef = this.database
                                    .collection('currentCoachAthletes')
                                    .doc(docUID)

                                var teamPath = `currentTeams.${athletePayload.teamName}.joiningDate`

                                batch.update(
                                    currCoachAthDocRef,
                                    {
                                        [teamPath]: athletePayload.joiningDate
                                    }
                                )
                            })

                            batch.commit().then(() => {
                                res(true)
                            })
                        })

                    } else {
                        batch.commit().then(() => {
                            res(true)
                        })
                    }
                })
            })
        })
    }

    getCurrentCoachAthDocUID = (athleteUID, coachUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('athleteUID', '==', athleteUID)
                .where('coachUID', '==', coachUID)
                .get()
                .then(snap => {
                    var docUID = snap.docs[0].id
                    res(docUID)
                })
        })
    }

    getAthleteTeamPrograms = (coachUID, athleteUID, teamName) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('owner', '==', coachUID)
                .where('athlete', '==', athleteUID)
                .where('team', '==', teamName)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res([])
                    } else {
                        var payload = []
                        var programPromises = []

                        snap.docs.forEach(doc => {
                            payload.push(doc.data())
                            programPromises.push(
                                this.getProgramExData(
                                    false,
                                    athleteUID,
                                    doc.data().programUID
                                )
                            )
                        })

                        Promise.all(programPromises).then(exData => {
                            for (var i in payload) {
                                payload[i] = { ...payload[i], ...exData[i] }
                            }
                            res(payload)
                        })
                    }
                })
        })
    }

    getAthleteTeamFullProgramData = (athleteUID, programUID, teamName) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('athlete', '==', athleteUID)
                .where('programUID', '==', programUID)
                .where('team', '==', teamName)
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        var progInfo = snap.docs[0].data()

                        this.getProgramExData(
                            false,
                            athleteUID,
                            programUID,
                        ).then(exData => {

                            res({ ...progInfo, ...exData })
                        })
                    } else {
                        console.log("nothing")
                        res(true)
                    }
                })

        })
    }

    generateProgDeploymentData = (coachUID, programUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('owner', '==', coachUID)
                .where('athlete', '==', coachUID)
                .where('programUID', '==', programUID)
                .get()
                .then(snap => {
                    var progInfo = snap.docs[0].data()

                    this.getProgramExData(
                        true,
                        coachUID,
                        programUID,
                    ).then(exData => {

                        res({ programInfo: progInfo, exData: exData })
                    })

                })

        })
    }

    deleteProgramGroupsDB = (coachUID, groupNames) => {
        return new Promise((res, rej) => {
            let docRef = this.database
                .collection('users')
                .doc(coachUID)
                .collection('programGroups')
                .doc('programGroups')

            docRef
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        if (Object.keys(snap.data()).length === groupNames.length) {
                            docRef.delete().then(() => {
                                res(true)
                            })
                        } else {
                            const batch = this.database.batch()

                            groupNames.forEach(group => {
                                batch.update(docRef, {
                                    [group]: FieldValue.delete()
                                })
                            })

                            batch.commit().then(() => {
                                res(true)
                            })
                        }
                    } else {
                        res(true)
                    }
                })

        })
    }

    getUserProgramsAndGroups = (userUID, userType) => {
        return new Promise((res, rej) => {

            if (userType === 'athlete') {
                this.getUserPrograms(userUID, userType).then(snap => {
                    res({
                        programs: snap,
                        programGroups: undefined
                    })
                })
            } else {
                Promise.all([
                    this.getUserPrograms(userUID, userType),
                    this.getCoachProgramGroups(userUID)
                ]).then(data => {
                    res({
                        programs: data[0],
                        programGroups: data[1]
                    })
                })
            }
        })
    }

    appendEndDayToProgramGoals = (programUID, athleteUID, endDayUTS) => {
        return new Promise((res, rej) => {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('athleteUID', '==', athleteUID)
                .where('programStatus', '==', 'current')
                .get()
                .then(snapshot => {
                    if (!snapshot.empty) {
                        const batch = this.database.batch()

                        snapshot.docs.forEach(doc => {
                            let docRef = this.database.collection('goals').doc(doc.id)

                            batch.update(docRef,
                                {
                                    programEndDay: endDayUTS
                                }
                            )


                        })
                        batch.commit().then(() => {
                            res(true)
                        })
                    } else {
                        res(true)
                    }

                })
                .catch(error => {
                    rej(error)
                })
        })
    }

    appendCloseOffPropertiesToProgram = (programUID, athleteUID, closeDayUTS) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('programUID', '==', programUID)
                .where('athlete', '==', athleteUID)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        let docUID = snap.docs[0].id
                        this.database
                            .collection("programs")
                            .doc(docUID)
                            .update({
                                endDayUTS: closeDayUTS,
                                status: 'past'
                            })
                            .then(() => {
                                res(true)
                            })
                    }
                })
        })
    }

    closeOffProgramDB = (programUID, athleteUID, endDayUTS, programUIDToActivate) => {
        return new Promise((res, rej) => {
            Promise.all([
                this.appendCloseOffPropertiesToProgram(programUID, athleteUID, endDayUTS),
                this.appendEndDayToProgramGoals(programUID, athleteUID, endDayUTS)
            ]).then(() => {
                if (programUIDToActivate) {
                    this.database
                        .collection('programs')
                        .where('programUID', '==', programUIDToActivate)
                        .where('athlete', '==', athleteUID)
                        .where('status', '==', 'current')
                        .get()
                        .then(snap => {
                            if (!snap.empty && snap.docs.length === 1) {
                                let docUID = snap.docs[0].id
                                this.database
                                    .collection("programs")
                                    .doc(docUID)
                                    .update({
                                        isActiveInSequence: true
                                    })
                                    .then(() => {
                                        res(true)
                                    })

                            } else {
                                res(true)
                            }

                        })
                } else {
                    res(true)
                }
            })
        })
    }

    deleteProgramDB = (programUID, userType, userUID, status, endDayUTS = undefined) => {

        if (userType === 'athlete' && !endDayUTS) {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('programUID', '==', programUID)
                    .where('athlete', '==', userUID)
                    .where('status', '==', status)
                    .get()
                    .then(snap => {
                        if (!snap.empty) {
                            const batch = this.database.batch()
                            const docUID = snap.docs[0].id
                            var progRef = this.database.collection('programs').doc(docUID)

                            batch.delete(progRef)

                            progRef
                                .collection('exercises')
                                .get()
                                .then(coll => {
                                    if (!coll.empty) {
                                        coll.docs.forEach(doc => {
                                            var dayRef = progRef.collection('exercises').doc(doc.id)
                                            batch.delete(dayRef)
                                        })
                                    }
                                    batch.commit().then(() => {
                                        res(true)
                                    })
                                })
                        }
                    })
            })
        } else if (userType === 'athlete' && endDayUTS) {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('programUID', '==', programUID)
                    .where('athlete', '==', userUID)
                    .where('status', '==', status)
                    .where('endDayUTS', '==', endDayUTS)
                    .get()
                    .then(snap => {
                        if (!snap.empty) {
                            const batch = this.database.batch()
                            const docUID = snap.docs[0].id
                            var progRef = this.database.collection('programs').doc(docUID)

                            batch.delete(progRef)

                            progRef
                                .collection('exercises')
                                .get()
                                .then(coll => {
                                    if (!coll.empty) {
                                        coll.docs.forEach(doc => {
                                            var dayRef = progRef.collection('exercises').doc(doc.id)
                                            batch.delete(dayRef)
                                        })
                                    }
                                    batch.commit().then(() => {
                                        res(true)
                                    })
                                })
                        }
                    })
            })
        } else {
            return new Promise((res, rej) => {

                let progDel = new Promise((res, rej) => {
                    this.database
                        .collection('programs')
                        .where('programUID', '==', programUID)
                        .where('owner', '==', userUID)
                        .where('athlete', '==', userUID)
                        .where('status', '==', status)
                        .get()
                        .then(snap => {
                            if (!snap.empty) {
                                const batch = this.database.batch()
                                const docUID = snap.docs[0].id
                                var progRef = this.database.collection('programs').doc(docUID)
                                batch.delete(progRef)

                                progRef
                                    .collection('exercises')
                                    .get()
                                    .then(coll => {
                                        if (!coll.empty) {
                                            coll.docs.forEach(doc => {
                                                var dayRef = progRef.collection('exercises').doc(doc.id)
                                                batch.delete(dayRef)
                                            })
                                        }
                                        batch.commit().then(() => {
                                            res(true)
                                        })
                                    })
                            }
                        })
                })

                let progGroupDel = new Promise((res, rej) => {
                    this.database
                        .collection('users')
                        .doc(userUID)
                        .collection('programGroups')
                        .get()
                        .then(groupSnap => {
                            if (!groupSnap.empty && groupSnap.docs.length === 1) {
                                let groups = groupSnap.docs[0].data()
                                let groupDeleteList = []
                                Object.keys(groups).forEach(group => {
                                    if (groups[group].sequential) {
                                        if (Object.keys(groups[group].sequential).includes(programUID)) {
                                            groupDeleteList.push(group)
                                        }
                                    }

                                    if (groups[group].unlimited) {
                                        if (groups[group].unlimited.includes(programUID)) {
                                            groupDeleteList.push(group)
                                        }
                                    }
                                })
                                if (groupDeleteList.length > 0) {
                                    console.log('going into delete list')
                                    console.log(groupDeleteList)
                                    const batch = this.database.batch()
                                    const docRef = this.database.collection('users').doc(userUID).collection('programGroups').doc('programGroups')

                                    if (Object.keys(groups).length === groupDeleteList.length) {
                                        batch.delete(docRef)
                                    } else {
                                        groupDeleteList.forEach(group => {
                                            batch.update(docRef, {
                                                [group]: FieldValue.delete()
                                            })
                                        })
                                    }

                                    batch.commit().then(() => {
                                        res(true)
                                    })
                                } else {
                                    res(true)
                                }
                            } else {
                                res(true)
                            }
                        })
                })

                Promise.all([progDel, progGroupDel]).then(() => {
                    res(true)
                })
            })
        }
    }

    submitDayDB = (isCoach, userUID, programUID, day, loadingData) => {
        if (isCoach) {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('programUID', '==', programUID)
                    .where('owner', '==', userUID)
                    .where('athlete', '==', userUID)
                    .where('status', '==', 'current')
                    .get()
                    .then(snap => {
                        if (!snap.empty && snap.docs.length === 1) {
                            let docUID = snap.docs[0].id
                            const batch = this.database.batch()
                            let progRef = this.database
                                .collection('programs')
                                .doc(docUID)

                            let dayRef = progRef
                                .collection('exercises')
                                .doc(day.toString())

                            batch.set(
                                dayRef,
                                { loadingData: loadingData },
                                { merge: true }
                            )

                            batch.update(
                                progRef,
                                { currentDay: day + 1 }
                            )

                            batch.commit().then(() => {
                                res(true)
                            })
                        }
                    })
            })
        } else {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('programUID', '==', programUID)
                    .where('athlete', '==', userUID)
                    .where('status', '==', 'current')
                    .get()
                    .then(snap => {
                        if (!snap.empty && snap.docs.length === 1) {
                            let docUID = snap.docs[0].id
                            const batch = this.database.batch()
                            let progRef = this.database
                                .collection('programs')
                                .doc(docUID)

                            let dayRef = progRef
                                .collection('exercises')
                                .doc(day.toString())

                            batch.set(
                                dayRef,
                                { loadingData: loadingData },
                                { merge: true }
                            )

                            batch.update(
                                progRef,
                                { currentDay: day + 1 }
                            )

                            batch.commit().then(() => {
                                res(true)
                            })
                        }
                    })
            })
        }
    }

    getAnatomyData = () => {
        return new Promise((res, rej) => {
            this.database
                .collection('anatomy')
                .doc('ykgEqKnLxEgp3SHiOe8W')
                .get()
                .then(snap => {
                    res(snap)
                })
        })
    }

    getExData = (owners) => {
        return this.database
            .collection('exercises')
            .where('owner', 'in', owners)
            .get()
    }

    addExerciseDB = (isCoach, userUID, programUID, day, exData) => {

        if (isCoach) {
            return this.database
                .collection('programs')
                .where('owner', '==', userUID)
                .where('athlete', '==', userUID)
                .where('programUID', '==', programUID)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        var docUID = snap.docs[0].id
                        this.database
                            .collection('programs')
                            .doc(docUID)
                            .collection('exercises')
                            .doc(day)
                            .set(exData, { merge: true })
                    } else {
                        console.log("no doc returned")
                    }
                })
        } else {
            return this.database
                .collection('programs')
                .where('athlete', '==', userUID)
                .where('programUID', '==', programUID)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        var docUID = snap.docs[0].id
                        this.database
                            .collection('programs')
                            .doc(docUID)
                            .collection('exercises')
                            .doc(day)
                            .set(exData, { merge: true })
                    } else {
                        console.log("no doc returned")
                    }
                })
        }

    }

    deleteExerciseDBHelper = (docUID, day, exUID) => {
        return this.database
            .collection('programs')
            .doc(docUID)
            .collection('exercises')
            .doc(day)
            .get()
            .then(snapshot => {
                if (snapshot.exists) {
                    const data = snapshot.data()
                    if (Object.keys(data).length > 1) {
                        this.database
                            .collection('programs')
                            .doc(docUID)
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
                            .doc(docUID)
                            .collection('exercises')
                            .doc(day)
                            .delete()
                    }
                }

            })
    }

    deleteExerciseDB = (isCoach, userUID, programUID, day, exUID) => {

        if (isCoach) {
            return this.database
                .collection('programs')
                .where('owner', '==', userUID)
                .where('athlete', '==', userUID)
                .where('programUID', '==', programUID)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        var docUID = snap.docs[0].id

                        return this.deleteExerciseDBHelper(docUID, day, exUID)
                    }

                })
        } else {
            return this.database
                .collection('programs')
                .where('athlete', '==', userUID)
                .where('programUID', '==', programUID)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {

                        var docUID = snap.docs[0].id

                        return this.deleteExerciseDBHelper(docUID, day, exUID)
                    }
                })
        }
    }

    updateExerciseDB = (isCoach, userUID, programUID, day, exUID, exData) => {

        if (isCoach) {
            return this.database
                .collection('programs')
                .where('athlete', '==', userUID)
                .where('owner', '==', userUID)
                .where('programUID', '==', programUID)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    var docUID = snap.docs[0].id

                    this.database
                        .collection('programs')
                        .doc(docUID)
                        .collection('exercises')
                        .doc(day)
                        .update({
                            [exUID]: exData
                        })
                })

        } else {
            return this.database
                .collection('programs')
                .where('athlete', '==', userUID)
                .where('programUID', '==', programUID)
                .where('status', '==', 'current')
                .get()
                .then(snap => {
                    var docUID = snap.docs[0].id

                    this.database
                        .collection('programs')
                        .doc(docUID)
                        .collection('exercises')
                        .doc(day)
                        .update({
                            [exUID]: exData
                        })
                })
        }

    }

    startProgramDB = (athleteUID, programUID, timestamp) => {
        console.log(athleteUID)
        console.log(programUID)
        return this.database
            .collection('programs')
            .where('athlete', '==', athleteUID)
            .where('programUID', '==', programUID)
            .where('status', '==', 'current')
            .get()
            .then(snap => {
                if (!snap.empty) {
                    var docUID = snap.docs[0].id
                    return this.database
                        .collection('programs')
                        .doc(docUID)
                        .update({ startDayUTS: timestamp })
                }
            })

    }

    getProgGoalData = (programUID, athleteUID, programStatus, endDayUTS = undefined) => {
        if (programStatus === 'current') {
            return new Promise((res, rej) => {
                this.database
                    .collection('goals')
                    .where('programUID', '==', programUID)
                    .where('athleteUID', '==', athleteUID)
                    .where('programStatus', '==', 'current')
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
        } else {
            return new Promise((res, rej) => {
                this.database
                    .collection('goals')
                    .where('programUID', '==', programUID)
                    .where('athleteUID', '==', athleteUID)
                    .where('programStatus', '==', 'current')
                    .where('programEndDay', '==', endDayUTS)
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
    }

    getProgramExData = (isCoach, userUID, programUID, status = 'current') => {
        console.log(status)
        console.log(userUID)
        console.log(programUID)
        if (isCoach) {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('owner', '==', userUID)
                    .where('athlete', '==', userUID)
                    .where('programUID', '==', programUID)
                    .where('status', '==', status)
                    .get()
                    .then(snap => {
                        if (!snap.empty) {

                            var docUID = snap.docs[0].id

                            this.database
                                .collection('programs')
                                .doc(docUID)
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
                        }

                    })

            })
        } else {
            return new Promise((res, rej) => {
                this.database
                    .collection('programs')
                    .where('athlete', '==', userUID)
                    .where('programUID', '==', programUID)
                    .where('status', '==', status)
                    .get()
                    .then(snap => {
                        if (!snap.empty) {
                            var docUID = snap.docs[0].id

                            this.database
                                .collection('programs')
                                .doc(docUID)
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
                        }

                    })

            })
        }
    }

    getPastProgramExData = (programUID, athleteUID, endDayUTS) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('programUID', '==', programUID)
                .where('athlete', '==', athleteUID)
                .where('status', '==', 'past')
                .where('endDayUTS', '==', endDayUTS)
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        let docUID = snap.docs[0].id

                        this.database
                            .collection('programs')
                            .doc(docUID)
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
                    } else {
                        console.log("going in")
                        res(true)
                    }
                })
        })
    }

    getPastProgramNotes = (programUID, athleteUID, endDayUTS) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('programUID', '==', programUID)
                .where('athlete', '==', athleteUID)
                .where('status', '==', 'past')
                .where('endDayUTS', '==', endDayUTS)
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        res(snap.docs[0].data().notes)
                    } else {
                        console.log("going in ")
                        res(true)
                    }
                })
        })
    }

    updatePastProgramNotes = (programUID, athleteUID, endDayUTS, value) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('programUID', '==', programUID)
                .where('athlete', '==', athleteUID)
                .where('status', '==', 'past')
                .where('endDayUTS', '==', endDayUTS)
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        let docUID = snap.docs[0].id

                        this.database
                            .collection('programs')
                            .doc(docUID)
                            .update({
                                notes: value
                            })
                            .then(() => {
                                res(true)
                            })
                    } else {
                        res(true)
                    }
                })
        })
    }

    getUserExerciseData = (userUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('exercises')
                .where("owner", '==', userUID)
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res([])
                    } else {
                        let payload = snap.docs.map(doc => {
                            return doc.data()
                        })
                        res(payload)
                    }
                })
        })
    }

    getPastProgramViewData = (programUID, athleteUID, endDayUTS) => {
        console.log(programUID)
        console.log(athleteUID)
        console.log(endDayUTS)
        return new Promise((res, rej) => {
            Promise.all([
                this.getProgGoalData(programUID, athleteUID, 'past', endDayUTS),
                this.getPastProgramExData(programUID, athleteUID, endDayUTS),
                this.getPastProgramNotes(programUID, athleteUID, endDayUTS),
                this.getAnatomyData()
            ]).then(data => {
                res({
                    goalData: data[0],
                    exData: data[1],
                    notes: data[2],
                    anatomy: data[3].data().anatomy
                })
            })
        })
    }

    getProgramExGoalData = (isCoach, userUID, programUID, programStatus) => {

        var promises = [this.getProgGoalData(programUID, userUID, programStatus), this.getProgramExData(isCoach, userUID, programUID, programStatus)]

        return promises
    }

    changeGoalCompletionStatusDB = (programUID, goalProgUID, goalData, athleteUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('goalProgUID', '==', goalProgUID)
                .where('athleteUID', '==', athleteUID)
                .where('programStatus', '==', 'current')
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        var docRef = this.database.collection('goals').doc(snap.docs[0].id)
                        const batch = this.database.batch()
                        if (goalData.mainGoal) {
                            batch.update(docRef, { 'mainGoal.completed': goalData.mainGoal.completed })
                        }

                        if (goalData.subGoal) {
                            var subGoalPath = `subGoals.${goalData.subGoal.dbUID}.completed`
                            batch.update(docRef, { [subGoalPath]: goalData.subGoal.completed })
                        }
                        batch.commit().then(() => {
                            res(true)
                        })
                    } else {
                        res(true)
                    }
                })
        })

    }

    createMainGoalDB = (payload) => {
        return this.database.collection('goals').doc().set(payload)
    }

    createSubGoalDB = (programUID, payload, athleteUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('athleteUID', '==', athleteUID)
                .where('programStatus', '==', 'current')
                .where('goalProgUID', '==', payload.parentGoal)
                .get()
                .then(snap => {
                    var docRef = this.database.collection('goals').doc(snap.docs[0].id)
                    const batch = this.database.batch()

                    var subGoalPath = `subGoals.${payload.goalDBUID}`

                    batch.update(docRef, {
                        [subGoalPath]: payload.data
                    })

                    batch.update(docRef, {
                        'mainGoal.completed': false
                    })

                    batch.commit().then(() => {
                        res(true)
                    })
                })
        })

    }

    deleteGoalDB = (programUID, payload, athleteUID, toggleMainGoalCompleted) => {
        if (payload.isMainGoal) {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('athleteUID', '==', athleteUID)
                .where('programStatus', '==', 'current')
                .where('goalProgUID', '==', payload.goalDBUID)
                .get()
                .then(snap => {
                    this.database.collection('goals').doc(snap.docs[0].id).delete()
                })
        } else {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('athleteUID', '==', athleteUID)
                .where('programStatus', '==', 'current')
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

                        if (toggleMainGoalCompleted) {
                            docRef.update({
                                'mainGoal.completed': true
                            })
                        }
                    }
                })
        }
    }

    editGoalDB = (programUID, payload, athleteUID) => {
        if (payload.isMainGoal) {
            this.database
                .collection('goals')
                .where('programUID', '==', programUID)
                .where('goalProgUID', '==', payload.goalDBUID)
                .where('athleteUID', '==', athleteUID)
                .where('programStatus', '==', 'current')
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
                .where('athleteUID', '==', athleteUID)
                .where('programStatus', '==', 'current')
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

    assignNewAthletesToTeam = (athleteList, coachUID, teamName, timestamp) => {

        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('athleteUID', 'in', athleteList)
                .where('coachUID', '==', coachUID)
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        const batch = this.database.batch()

                        snap.docs.forEach(doc => {
                            let docRef = this.database.collection('currentCoachAthletes')
                                .doc(doc.id)

                            let path = `currentTeams.${teamName}.joiningDate`
                            batch.update(docRef, {
                                [path]: timestamp
                            })
                        })

                        batch.commit().then(() => {
                            res(true)
                        })
                    }
                })
        })
    }

    getTeamData = (coachUID, teamName) => {
        return new Promise((res, rej) => {
            Promise.all([
                this.getTeamCurrentAthletes(coachUID, teamName),
                this.getTeamProgramData(coachUID, teamName),
                this.getCoachProgramGroups(coachUID),
                this.getUserPrograms(coachUID, 'coach'),
                this.getCoachCurrentAthletes(coachUID),
                this.getAnatomyData()
            ]).then(data => {
                console.log(data[5])
                res({
                    athleteData: data[0],
                    programData: data[1],
                    deployProgramGroupData: data[2],
                    deployProgramData: data[3],
                    allAthletes: data[4],
                    anatomy: data[5].data().anatomy
                })
            })
        })
    }

    removeAthleteFromTeam = (coachUID, athleteUID, team) => {
        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('coachUID', '==', coachUID)
                .where('athleteUID', '==', athleteUID)
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        let docUID = snap.docs[0].id
                        let path
                        let docRef = this.database
                            .collection('currentCoachAthletes')
                            .doc(docUID)

                        docRef
                            .get()
                            .then(teamData => {
                                if (Object.keys(teamData.data().currentTeams).length === 1) {
                                    path = `currentTeams`

                                } else {
                                    path = `currentTeams.${team}`

                                }

                                docRef.update({
                                    [path]: FieldValue.delete()
                                }).then(() => {
                                    res(true)
                                })
                            })

                    }
                })
        })
    }

    assignAthleteNewTeam = (coachUID, athleteUID, team, joiningDate) => {

        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('coachUID', '==', coachUID)
                .where('athleteUID', '==', athleteUID)
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        let docUID = snap.docs[0].id
                        let path = `currentTeams.${team}.joiningDate`

                        this.database
                            .collection('currentCoachAthletes')
                            .doc(docUID)
                            .update({
                                [path]: joiningDate
                            })
                            .then(() => {
                                res(true)
                            })
                    }
                })

        })
    }

    getAvailableCoachTeams = (coachUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .doc(coachUID)
                .collection('teams')
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        let payload = []
                        snap.docs.forEach(doc => {
                            payload.push({
                                name: doc.data().teamName,
                                description: doc.data().description
                            })
                        })
                        res(payload)
                    } else {
                        res([])
                    }
                })
        })
    }

    getIndividualAthleteProfileAndManagementData = (coachUID, athleteUID) => {
        return new Promise((res, rej) => {
            Promise.all([
                this.getAnatomyData(),
                this.getAthleteTeams(coachUID, athleteUID),
                this.getCoachAthletePrograms(coachUID, athleteUID),
                this.getAvailableCoachTeams(coachUID)
            ]).then(data => {
                res({
                    anatomyObject: data[0].data(),
                    teams: data[1],
                    programs: data[2],
                    currentCoachTeams: data[3]
                })
            })
        })
    }

    getCoachAthletePrograms = (coachUID, athleteUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('owner', '==', coachUID)
                .where('athlete', '==', athleteUID)
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        let payload = snap.docs.map(doc => {
                            return doc.data()
                        })
                        res(payload)
                    } else {
                        res([])
                    }
                })
        })
    }

    getAthleteTeams = (coachUID, athleteUID) => {
        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('athleteUID', '==', athleteUID)
                .where('coachUID', '==', coachUID)
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        let athleteData = snap.docs[0].data()

                        athleteData.currentTeams ? res(athleteData.currentTeams) : res({})
                    }
                })
        })
    }

    getAthleteManagementData = (coachUID) => {
        return new Promise((res, rej) => {
            Promise.all([
                this.getCoachProgramGroups(coachUID),
                this.getCoachCurrentAthletes(coachUID),
                this.getUserPrograms(coachUID, 'coach'),
            ]).then(data => {
                res({
                    programGroups: data[0],
                    athletes: data[1],
                    programs: data[2]
                })
            })
        })
    }

    handleAcceptPendingProgramFutureReplace = (athleteUID, firstProgramUID, firstProgramOrder, dayThreshold, deletePendingList, deleteCurrentList, acceptPendingList) => {

        return new Promise((res, rej) => {

            Promise.all([
                this.getProgramExData(false, athleteUID, firstProgramUID, 'pending')
            ]).then(exData => {
                let pendingExData = exData[0]
                let maxPendingDay = 0
                Object.keys(pendingExData).forEach(day => {
                    if (parseInt(day) > maxPendingDay) {
                        maxPendingDay = parseInt(day)
                    }
                })

                let exPayload = {}
                for (let day = dayThreshold; day <= maxPendingDay; day++) {
                    if (pendingExData[day.toString()] !== undefined) {
                        exPayload[day.toString()] = pendingExData[day.toString()]
                    }
                }

                this.database
                    .collection('programs')
                    .where('programUID', '==', firstProgramUID)
                    .where('athlete', '==', athleteUID)
                    .where('status', '==', 'current')
                    .get()
                    .then(snap => {
                        if (!snap.empty && snap.docs.length === 1) {
                            // Get the document of the first program in the sequence to be accepted. This will get a future replace. 
                            let docUID = snap.docs[0].id
                            const batch = this.database.batch()
                            console.log(docUID)
                            // If the first program is a sequence then update the sequence name in the database and set the is active in sequence property to true.
                            let progRef = this.database.collection('programs').doc(docUID)
                            let exRef = progRef.collection('exercises')


                            if (firstProgramOrder) {
                                batch.update(
                                    progRef,
                                    { order: firstProgramOrder }
                                )
                                batch.update(
                                    progRef,
                                    { isActiveInSequence: true }
                                )
                            } else {
                                let progRawData = snap.docs[0].data()
                                if (progRawData.order) {
                                    batch.update(
                                        progRef,
                                        { order: FieldValue.delete() }
                                    )
                                    batch.update(
                                        progRef,
                                        { isActiveInSequence: FieldValue.delete() }
                                    )
                                }
                            }

                            this.clearFutureProgExData(docUID, dayThreshold).then(clearedData => {

                                Object.keys(exPayload).forEach(day => {
                                    batch.set(exRef.doc(day), exPayload[day])
                                })


                                let promises = []

                                deleteCurrentList.forEach(progUID => {
                                    promises.push(
                                        this.deleteProgramDB(progUID, 'athlete', athleteUID, 'current')
                                    )
                                })

                                deletePendingList.forEach(progUID => {
                                    promises.push(
                                        this.deleteProgramDB(progUID, 'athlete', athleteUID, 'pending')
                                    )
                                })

                                acceptPendingList.forEach(progUID => {
                                    promises.push(
                                        this.changeAthleteProgramStatus(
                                            progUID,
                                            athleteUID,
                                            'pending',
                                            'current'
                                        )
                                    )
                                })

                                Promise.all(promises).then(result => {
                                    batch.commit().then(() => {
                                        res(true)
                                    })
                                })
                            })
                        }
                    })
            })
        })
    }

    changeAthleteProgramStatus = (programUID, athleteUID, currentStatus, futureStatus) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('programUID', '==', programUID)
                .where('athlete', '==', athleteUID)
                .where('status', '==', currentStatus)
                .get()
                .then(snap => {
                    if (!snap.empty && snap.docs.length === 1) {
                        let docUID = snap.docs[0].id

                        this.database.collection('programs').doc(docUID).update({
                            status: futureStatus
                        }).then(result => {
                            res(true)
                        })
                    }
                })
        })
    }

    clearFutureProgExData = (docUID, day) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .doc(docUID)
                .collection('exercises')
                .get()
                .then(snap => {
                    if (!snap.empty) {

                        const batch = this.database.batch()

                        let exRef = this.database.collection('programs').doc(docUID).collection('exercises')

                        snap.docs.forEach(doc => {
                            if (parseInt(doc.id) >= parseInt(day)) {
                                batch.delete(exRef.doc(doc.id))
                            }
                        })

                        batch.commit().then(() => {
                            res(true)
                        })
                    } else {
                        res(true)
                    }
                })
        })
    }

    handleAcceptPendingProgramCompleteReplace = (athleteUID, delCurrentList, delPendingList, acceptPendingList) => {

        return new Promise((res, rej) => {
            var promises = []

            delCurrentList.forEach(programUID => {
                promises.push(
                    this.deleteProgramDB(
                        programUID,
                        'athlete',
                        athleteUID,
                        'current'
                    )
                )
            })

            delPendingList.forEach(programUID => {
                promises.push(
                    this.deleteProgramDB(
                        programUID,
                        'athlete',
                        athleteUID,
                        'pending'
                    )
                )
            })

            Promise.all(promises).then(result => {
                this.database
                    .collection('programs')
                    .where('programUID', 'in', acceptPendingList)
                    .where('athlete', '==', athleteUID)
                    .where('status', '==', 'pending')
                    .get()
                    .then(snap => {
                        if (!snap.empty) {
                            const batch = this.database.batch()
                            snap.docs.forEach(doc => {
                                var progRef = this.database
                                    .collection('programs')
                                    .doc(doc.id)

                                batch.update(
                                    progRef,
                                    { status: 'current' }
                                )
                            })

                            batch.commit().then(() => {
                                res(true)
                            })
                        }
                    })

                res(true)
            })

        })
    }

    handlePendingProgramDenied = (athleteUID, programUIDList) => {
        return new Promise((res, rej) => {
            var promises = []

            programUIDList.forEach(programUID => {
                promises.push(this.deleteProgramDB(programUID, 'athlete', athleteUID, 'pending'))
            })

            Promise.all(promises).then(result => {
                res(true)
            })
        })
    }

    deployTeamPrograms = (coachUID, athleteData, programData, coachData, teamName) => {
        return new Promise((res, rej) => {
            const batch = this.database.batch()
            var coachRef = this.database
                .collection('users')
                .doc(coachUID)

            coachRef
                .collection('teams')
                .where('teamName', '==', teamName)
                .get()
                .then(teamDocs => {

                    var teamDocUID = teamDocs.docs[0].id

                    batch.update(
                        coachRef.collection('teams').doc(teamDocUID),
                        { programs: coachData }
                    )
                    var programUIDList = Object.keys(programData)

                    var currentPendingPromises = []

                    athleteData.forEach(athlete => {
                        currentPendingPromises.push(
                            this.removeAthleteAssignedPendingProgramList(
                                coachUID,
                                athlete,
                                programUIDList
                            )
                        )
                    })

                    Promise.all(currentPendingPromises).then(result => {
                        var completeProgramData = []

                        programUIDList.forEach(programUID => {
                            completeProgramData.push(
                                this.generateProgDeploymentData(coachUID, programUID)
                            )
                        })

                        Promise.all(completeProgramData).then(data => {
                            data.forEach(program => {
                                var feProgObj = programData[program.programInfo.programUID]
                                console.log(program)
                                athleteData.forEach(altheteUID => {

                                    var programRef = this.database.collection('programs').doc()

                                    let progAthInfo = { ...program.programInfo }

                                    if (!feProgObj.isUnlimited) {
                                        progAthInfo.order = feProgObj.order
                                        progAthInfo.isActiveInSequence = feProgObj.isActiveInSequence
                                    }

                                    progAthInfo.deploymentDate = feProgObj.deploymentDate
                                    progAthInfo.athlete = altheteUID
                                    progAthInfo.status = 'pending'
                                    progAthInfo.team = teamName

                                    batch.set(programRef, progAthInfo)
                                    Object.keys(program.exData).forEach(day => {
                                        var dayRef = programRef.collection('exercises').doc(day)
                                        batch.set(dayRef, program.exData[day])
                                    })
                                })
                            })
                            batch.commit().then(() => {
                                res(true)
                            })
                        })

                    })
                })
        })
    }

    removeAthleteAssignedPendingProgramList = (
        coachUID,
        athleteUID,
        programList
    ) => {
        return new Promise((res, rej) => {
            this.database
                .collection('programs')
                .where('owner', '==', coachUID)
                .where('athlete', '==', athleteUID)
                .where('status', '==', 'pending')
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res(true)
                    } else {
                        let promises = []
                        let deleteList = []

                        snap.docs.forEach(doc => {
                            if (programList.includes(doc.data().programUID)) {
                                if (doc.data().order) {
                                    let seqProgIDs = this.getProgramsInSequenceIDs(
                                        doc.data().order,
                                        snap.docs
                                    )
                                    seqProgIDs.forEach(id => {
                                        if (!deleteList.includes(id)) {
                                            deleteList.push(id)
                                        }
                                    })
                                } else {
                                    deleteList.push(doc.data().programUID)
                                }
                            }
                        })

                        deleteList.forEach(id => {
                            promises.push(
                                this.deleteProgramDB(
                                    id,
                                    'athlete',
                                    athleteUID,
                                    'pending'
                                )
                            )
                        })

                        Promise.all(promises).then(() => {
                            res(true)
                        })
                        res(true)
                    }
                })
        })
    }

    getProgramsInSequenceIDs = (order, docs) => {

        var seqOrderArray = order.split('_')
        seqOrderArray.shift()
        var sequenceString = seqOrderArray.join("_")
        var relatedPrograms = []

        docs.forEach(doc => {
            if (doc.data().order) {
                var currOrderArray = doc.data().order.split('_')
                currOrderArray.shift()
                var currSeqString = currOrderArray.join("_")

                if (sequenceString === currSeqString) {
                    relatedPrograms.push(doc.data().programUID)
                }
            }
        })

        return relatedPrograms


    }

    getTeamProgramData = (coachUID, teamName) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .doc(coachUID)
                .collection('teams')
                .where('teamName', '==', teamName)
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res({})
                    } else {
                        res(snap.docs[0].data().programs)
                    }
                })
        })
    }

    // getCoachCurrentAthletes = (coachUID) => {
    //     return new Promise((res, rej) => {
    //         this.database
    //             .collection('currentCoachAthletes')
    //             .where('coachUID', '==', coachUID)
    //             .get()
    //             .then(snap => {
    //                 if (snap.empty) {
    //                     res([])
    //                 } else {
    //                     var promises = []
    //                     snap.docs.forEach(doc => {
    //                         var data = doc.data()

    //                         var insertObj = {
    //                             athleteUID: data.athleteUID,
    //                             joiningDate: data.joiningDate
    //                         }

    //                         promises.push(this.getAthleteDetails(insertObj.athleteUID, insertObj))
    //                     })

    //                     Promise.all(promises).then(athleteInfo => {
    //                         res(athleteInfo)
    //                     })
    //                 }
    //             })
    //     })
    // }

    getTeamCurrentAthletes = (coachUID, teamName) => {
        return new Promise((res, rej) => {
            this.database
                .collection('currentCoachAthletes')
                .where('coachUID', '==', coachUID)
                .get()
                .then(snap => {
                    if (snap.empty) {
                        res([])
                    } else {
                        var promises = []
                        snap.docs.forEach(doc => {
                            var data = doc.data()
                            if (data.currentTeams && data.currentTeams[teamName]) {
                                var insertObj = {
                                    athleteUID: data.athleteUID,
                                    joiningDate: data.currentTeams[teamName].joiningDate
                                }

                                promises.push(this.getAthleteDetails(insertObj.athleteUID, insertObj))
                            }
                        })

                        Promise.all(promises).then(athleteInfo => {
                            res(athleteInfo)
                        })
                    }
                })
        })
    }

    getAthleteDetails = (athleteUID, currentDetails) => {
        return new Promise((res, rej) => {
            this.database
                .collection('users')
                .doc(athleteUID)
                .get()
                .then(snap => {
                    currentDetails.email = snap.data().email
                    currentDetails.username = snap.data().username

                    res(currentDetails)
                })
        })
    }

    copyExerciseDataDB = (isCoach, userUID, programUID, payload) => {
        return new Promise((res, rej) => {

            if (isCoach) {
                this.database
                    .collection('programs')
                    .where('owner', '==', userUID)
                    .where('athlete', '==', userUID)
                    .where('programUID', '==', programUID)
                    .where('status', '==', 'current')
                    .get()
                    .then(snap => {
                        if (!snap.empty) {
                            var docUID = snap.docs[0].id
                            const batch = this.database.batch()

                            Object.keys(payload).forEach(day => {
                                let docRef = this.database
                                    .collection('programs')
                                    .doc(docUID)
                                    .collection('exercises')
                                    .doc(day.toString())
                                if (Object.keys(payload[day]).length !== 0) {
                                    batch.set(docRef, payload[day])
                                } else {
                                    batch.delete(docRef)
                                }
                            })
                            batch.commit().then(() => {
                                res(true)
                            })
                        } else {
                            res(true)
                        }
                    })
            } else {
                this.database
                    .collection('programs')
                    .where('athlete', '==', userUID)
                    .where('programUID', '==', programUID)
                    .where('status', '==', 'current')
                    .get()
                    .then(snap => {
                        if (!snap.empty) {
                            var docUID = snap.docs[0].id
                            const batch = this.database.batch()

                            Object.keys(payload).forEach(day => {
                                let docRef = this.database
                                    .collection('programs')
                                    .doc(docUID)
                                    .collection('exercises')
                                    .doc(day.toString())
                                if (Object.keys(payload[day]).length !== 0) {
                                    batch.set(docRef, payload[day])
                                } else {
                                    batch.delete(docRef)
                                }
                            })
                            batch.commit().then(() => {
                                res(true)
                            })
                        } else {
                            res(true)
                        }
                    })
            }
        })
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