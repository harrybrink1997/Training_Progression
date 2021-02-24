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
            .where('programUID', '==', snapshot.programUID)
            .get()
            .then(goalSnap => {
                if (!goalSnap.empty) {
                    var batch = admin.firestore().batch()
                    var goalRef = admin.firestore().collection('goals')

                    goalSnap.docs.forEach(doc => {
                        console.log(doc.id)
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