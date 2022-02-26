class Migration {
    #connection

    setConnection(connection) {
        this.#connection = connection
    }

    createTable(newTable) {
        console.log(newTable)
    }
}

module.exports = {
    Migration
}