// const firebase = require("firebase");
// // Required for side-effects
// require("firebase/firestore");
// const importData = require("./jsonObject")

// // Initialize Cloud Firestore through Firebase
// firebase.initializeApp({
//     apiKey: "AIzaSyDLaYt4b5MnmE6AsIx-4zT-wawYiGo0mak",
//     authDomain: "training-progression.firebaseapp.com",
//     projectId: "training-progression"
// });

// var db = firebase.firestore();
// // console.log(importData)

// Object.keys(importData.importData).forEach(data => {

//     var dbObject = importData.importData[data]

//     dbObject.name = data
//     dbObject.owner = 'none'

//     db.collection("exercises").add(dbObject).then(function (docRef) {
//         console.log("Document written with ID: ", docRef.id);
//     })
//         .catch(function (error) {
//             console.error("Error adding document: ", error);
//         });
// });