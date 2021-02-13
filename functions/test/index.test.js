const test = require('firebase-functions-test')({
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET
}, 'path/to/serviceAccountKey.json');

test.mockConfig()
adminInitStub = sinon.stub(admin, 'initializeApp')

const functions = require('../index.js')

const program = test.firestore.makeDocumentSnapshot({ foo: 'bar' }, 'programs/testProgram')

const goal = test.firestore.makeDocumentSnapshot({ programUID: 'testProgram' }, 'goals/goal1')

const wrapped = test.wrap(functions.cleanUpDBPostProgDelete)

wrapped(program)
wrapped(goal)