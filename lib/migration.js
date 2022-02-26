class Migration {
    #connection

    setConnection(connection) {
        this.#connection = connection
    }

    createTable(newTable) {

    }
}

module.exports = {
    Migration
}