class PageHistory {
    constructor() {
        this.pageHistory = []
    }

    back() {
        return this.pageHistory.pop()
    }

    next(page) {
        this.pageHistory.push(page)
    }
}

export default PageHistory