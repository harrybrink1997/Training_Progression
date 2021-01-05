const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.setUserPrivledges = functions.https.onCall((data, context) => {
    return admin.auth().setCustomUserClaims(context.auth.uid, { userType: data.userType })
})

// exports.setUserPrivledges = functions.database.ref('/users/{userid}/userType').onWrite(event => {
//     const type = event.data.val();
// })

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     response.send("Hello from Firebase!");
// });

exports.insertIntoDB = functions.https.onRequest((req, res) => {
    const text = req.query.text;
    return admin.database().ref('/test').push({ text: text }).then(snapshot => {
        res.redirect(303, snapshot.ref);
        return null
    })
})

exports.convertToUppercase = functions.database.ref('/test/{pushid}/text').onWrite(event => {
    const text = event.data.val();
    const uppercaseText = text.toUpperCase();
    return event.data.ref.parent.child('uppercaseText').set(uppercaseText)

})
