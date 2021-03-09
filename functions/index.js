const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const { user } = require('firebase-functions/lib/providers/auth');
// const { auth } = require('firebase');
admin.initializeApp(functions.config().firebase);

exports.cleanUpDBPostProgDelete = functions.firestore
    .document('programs/{docUID}')
    .onDelete((snapshot, context) => {
        admin.firestore()
            .collection('goals')
            .where('programUID', '==', snapshot.data().programUID)
            .where('programStatus', '==', snapshot.data().status)
            .where('athleteUID', '==', snapshot.data().athlete)
            .get()
            .then(goalSnap => {
                if (!goalSnap.empty) {
                    var batch = admin.firestore().batch()
                    var goalRef = admin.firestore().collection('goals')

                    goalSnap.docs.forEach(doc => {
                        batch.delete(goalRef.doc(doc.id))
                    })

                    batch.commit()
                }
                return true
            })
            .catch(error => {
                console.log(error)
            })
    })

exports.scrubUserFromDatabase = functions.auth.user()
    .onDelete(user => {
        let userUID = user.uid
        admin.firestore()
            .collection('users')
            .doc(user.uid)
            .get()
            .then(snap => {
                if (!snap.empty) {
                    const userType = snap.data().userType
                    if (userType === 'coach') {
                        deleteCoachData(userUID)
                            .then(() => {
                                return true
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    } else {

                    }
                }
                return
            })
        //             admin.firestore()
        //                 .collection('users')
        //                 .doc(user.uid)
        //                 .delete()
        //                 .then(() => {
        //                     return true
        //                 })
        //                 .catch(error => {
        //                     console.log(error)
        //                 })
    })

const deleteCoachData = (docUID) => {
    return new Promise((res, rej) => {
        Promise.all([
            deleteCoachTeams(docUID),
            deleteCoachProgramGroups(docUID),
            deleteLocalExercises(docUID),
            deletePrograms(docUID, 'coach'),
            deleteUserAssociations(docUID, 'coach')
        ])
            .then(() => {
                res(true)
            })
            .catch(error => {
                rej(error)
            })
    })
}

const deleteUserAssociations = (userUID, userType) => {

}

const deletePrograms = (userUID, userType) => {

}

const deleteCoachTeams = (docUID) => {

    return new Promise((res, rej) => {
        admin.firestore()
            .collection('users')
            .doc(docUID)
            .delete()
            .then(() => {
                return true
            })
            .catch(error => {
                console.log(error)
            })
    })
}

const deleteCoachProgramGroups = (docUID) => {
    return new Promise((res, rej) => {
        admin.firestore()
            .collection('users')
            .doc(docUID)
            .delete()
            .then(() => {
                return true
            })
            .catch(error => {
                console.log(error)
            })
    })
}