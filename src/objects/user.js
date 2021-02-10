
class User {
    constructor(id, data) {
        this.id = id
        this.username = data.username
        this.email = data.email
        this.permissions = data.permissions
        this.userType = data.userType
    }

    userInfoClientMap(id, data) {
        this.id = id

    }

    // Getters and Setters
    setId(value) {
        this.id = value
    }

    getId() {
        return this.id
    }

    getUsername() {
        return this.username
    }

    getUserType() {
        return this.userType
    }

    setEmail(value) {
        this.email = value
    }

    getEmail() {
        return this.email
    }

    setPermissions(value) {
        this.permissions = value
    }

    getPermissions() {
        return this.permissions
    }

}

class Athlete extends User {
    constructor(id, data) {
        super(id, data)
    }
}

class Coach extends User {
    constructor(id, data) {
        super(id, data)
    }
}

const createUserObject = (id, data) => {
    if (data.userType === 'athlete') {
        return new Athlete(id, data)
    } else {
        return new Coach(id, data)
    }
}

export { Athlete, Coach, createUserObject }