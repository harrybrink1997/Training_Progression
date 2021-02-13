const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.setUserPrivledges = functions.https.onCall((data, context) => {
    return admin.auth().setCustomUserClaims(context.auth.uid, { userType: data.userType })
})

exports.cleanUpDBPostProgDelete = functions.firestore
    .document('programs/{programUID}')
    .onDelete((snapshot, context) => {
        admin.firestore()
            .collection('goals')
            .where('programUID', '==', context.params.programUID)
            .get()
            .then(goalSnap => {
                if (!goalSnap.empty) {
                    console.log('going in correct location')

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