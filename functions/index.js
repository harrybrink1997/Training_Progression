const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.setUserPrivledges = functions.https.onCall((data, context) => {
    return admin.auth().setCustomUserClaims(context.auth.uid, { userType: data.userType })
})

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
                return
            })
            .catch(error => {
                console.log(error)
            })

    })


exports.scrubUserFromDatabase = functions.auth.user().onDelete(user => {
    console.log(user.uid)
    admin.firestore()
        .collection('users')
        .doc(user.uid)
        .delete()
        .then(() => {
            return
        })
        .catch(error => {
            console.log(error)
        })
})
    // exports.removeUnverifiedAccounts = functions.firestore