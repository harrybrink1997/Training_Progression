const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { user } = require('firebase-functions/lib/providers/auth');
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
        return new Promise((res, rej) => {
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
                                    admin.firestore()
                                        .collection('users')
                                        .doc(user.uid)
                                        .delete()
                                        .then(() => {
                                            res(true)
                                            return true
                                        })
                                        .catch(error => {
                                            rej(error)
                                            console.log(error)
                                        })
                                    return true
                                })
                                .catch(error => {
                                    rej(error)
                                    console.log(error)
                                })
                        } else {
                            deleteAthleteData(userUID)
                                .then(() => {
                                    admin.firestore()
                                        .collection('users')
                                        .doc(user.uid)
                                        .delete()
                                        .then(() => {
                                            res(true)
                                            return true
                                        })
                                        .catch(error => {
                                            rej(error)
                                            console.log(error)
                                        })
                                    return true
                                })
                                .catch(error => {
                                    rej(error)
                                    console.log(error)
                                })
                        }
                    }
                    return true
                })
                .catch(error => {
                    rej(error)
                    console.log(error)
                })
        })


    })

const deleteAthleteData = (docUID) => {
    return new Promise((res, rej) => {
        Promise.all([
            deleteLocalExercises(docUID),
            deletePrograms(docUID, 'athlete'),
            deleteUserAssociations(docUID, 'athlete')
        ])
            .then(() => {
                res(true)
                return true
            })
            .catch(error => {
                rej(error)
            })
    })
}

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
                return true
            })
            .catch(error => {
                rej(error)
            })
    })
}

const deleteUserAssociations = (userUID, userType) => {
    return new Promise((res, rej) => {

        let targetUID = userType + "UID"

        admin.firestore()
            .collection('currentCoachAthletes')
            .where(targetUID, '==', userUID)
            .get()
            .then(snap => {
                if (!snap.empty) {
                    const batch = admin.firestore().batch()
                    let path = admin.firestore()
                        .collection('currentCoachAthletes')

                    snap.docs.forEach(doc => {
                        batch.delete(path.doc(doc.id))
                    })

                    batch.commit()
                        .then(() => {
                            res(true)
                            return true
                        })
                        .catch(error => {
                            rej(error)
                        })

                } else {
                    res(true)
                }
                return true
            })
            .catch(error => {
                console.log(error)
            })
    })
}

const deletePrograms = (userUID, userType) => {
    if (userType === 'coach') {
        return new Promise((res, rej) => {
            admin.firestore()
                .collection('programs')
                .where('owner', '==', userUID)
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        const batch = admin.firestore().batch()
                        let path = admin.firestore()
                            .collection('programs')

                        let promises = []

                        snap.docs.forEach(doc => {
                            if (doc.data().status !== 'past') {
                                promises.push(deleteProgramHelper(doc.id))
                                batch.delete(path.doc(doc.id))
                            }
                        })

                        Promise.all(promises)
                            .then(() => {
                                batch.commit()
                                    .then(() => {
                                        res(true)
                                        return true
                                    })
                                    .catch(error => {
                                        rej(error)
                                    })
                                return true
                            })
                            .catch(error => {
                                rej(error)
                            })

                    } else {
                        res(true)
                    }
                    return true
                })
                .catch(error => {
                    console.log(error)
                })
        })
    } else {
        return new Promise((res, rej) => {
            admin.firestore()
                .collection('programs')
                .where('athlete', '==', userUID)
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        const batch = admin.firestore().batch()
                        let path = admin.firestore()
                            .collection('programs')

                        let promises = []
                        snap.docs.forEach(doc => {
                            promises.push(deleteProgramHelper(doc.id))
                            batch.delete(path.doc(doc.id))
                        })

                        Promise.all(promises)
                            .then(() => {
                                batch.commit()
                                    .then(() => {
                                        res(true)
                                        return true
                                    })
                                    .catch(error => {
                                        rej(error)
                                    })
                                return true
                            })
                            .catch(error => {
                                rej(error)
                            })

                    } else {
                        res(true)
                    }
                    return true
                })
                .catch(error => {
                    console.log(error)
                })
        })
    }
}

const deleteProgramHelper = (docUID) => {
    return new Promise((res, rej) => {
        admin.firestore()
            .collection('programs')
            .doc(docUID)
            .collection('exercises')
            .get()
            .then(snap => {
                if (!snap.empty) {
                    const batch = admin.firestore().batch()
                    let path = admin.firestore()
                        .collection('programs')
                        .doc(docUID)
                        .collection('exercises')

                    snap.docs.forEach(doc => {
                        batch.delete(path.doc(doc.id))
                    })

                    batch.commit()
                        .then(() => {
                            res(true)
                            return true
                        })
                        .catch(error => {
                            rej(error)
                        })
                } else {
                    res(true)
                }
                return true
            })
            .catch(error => {
                console.log(error)
            })
    })
}

const deleteLocalExercises = (userUID) => {
    return new Promise((res, rej) => {
        admin.firestore()
            .collection('exercises')
            .where('owner', '==', userUID)
            .get()
            .then(snap => {
                if (!snap.empty) {
                    const batch = admin.firestore().batch()
                    let path = admin.firestore()
                        .collection('exercises')

                    snap.docs.forEach(doc => {
                        batch.delete(path.doc(doc.id))
                    })

                    batch.commit()
                        .then(() => {
                            res(true)
                            return true
                        })
                        .catch(error => {
                            rej(error)
                        })

                } else {
                    res(true)
                }
                return true
            })
            .catch(error => {
                console.log(error)
            })
    })
}

const deleteCoachTeams = (docUID) => {

    return new Promise((res, rej) => {
        admin.firestore()
            .collection('users')
            .doc(docUID)
            .collection('teams')
            .get()
            .then(snap => {
                if (!snap.empty) {
                    const batch = admin.firestore().batch()
                    let path = admin.firestore()
                        .collection('users')
                        .doc(docUID)
                        .collection('teams')

                    snap.docs.forEach(doc => {
                        batch.delete(path.doc(doc.id))
                    })

                    batch.commit()
                        .then(() => {
                            res(true)
                            return true
                        })
                        .catch(error => {
                            rej(error)
                        })

                } else {
                    res(true)
                }
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
            .collection('programGroups')
            .get()
            .then(snap => {
                if (!snap.empty) {
                    admin.firestore()
                        .collection('users')
                        .doc(docUID)
                        .collection('programGroups')
                        .doc('programGroups')
                        .delete()
                        .then(() => {
                            res(true)
                            return true
                        })
                        .catch(error => {
                            rej(error)
                        })
                } else {
                    res(true)
                }
                return true
            })
            .catch(error => {
                rej(error)
            })
    })
}