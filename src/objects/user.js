import Firebase from "../components/Firebase"

class User {
    constructor(firebase) {
        this.id = undefined
        this.username = undefined
        this.email = undefined
        this.permissions = undefined
        this.firebase = firebase


    }

    getUserData = (id) => {
        this.firebase.getUser(id)
            .then(data => {
                console.log(data)
            })
    }

    clientMap(id, data) {
        this.id = id

    }





    // Getters and Setters
    setID(value) {
        this.id = value
    }

    setUsername

}

class Athlete extends User {

}

class Coach extends User {

}

export default User