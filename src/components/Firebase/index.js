/*
Written: 15/10
Author: Harry Brink

Encapsulates all the firebase objects and exports all the necessary functionalities. 

*/


import FirebaseContext, { withFirebase } from './context'
import Firebase from './firebase'

export default Firebase;

export { FirebaseContext, withFirebase }