const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { user } = require('firebase-functions/lib/providers/auth');
const { auth } = require('firebase');
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
                return
            })
            .catch(error => {
                console.log(error)
            })

    })


exports.scrubUserFromDatabase = functions.auth.user()
    .onDelete(user => {
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