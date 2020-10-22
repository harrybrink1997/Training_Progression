/*
Written: 15/10
Author: Harry Brink

Creates a react context object for the firebase object.
This allows a firebase object to be passed around rather then creating one in each component.

Firebase object will be called at the start of the app once.

*/

import React from 'react'

const FirebaseContext = React.createContext(null);

export const withFirebase = Component => props => (
    <FirebaseContext.Consumer>
        {firebase => <Component {...props} firebase={firebase} />}
    </FirebaseContext.Consumer>
);

export default FirebaseContext;