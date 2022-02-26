class Migration {
    #connection
    modelName

    setConnection(connection) {
        this.#connection = connection
    }

    createTable(newTable) {
        console.log(newTable)
        this.#connection.query(`CREATE TABLE ${this.modelName} (${newTable.map(({ type, name }) => `${name} ${type}`).join(',')})`, function (error, results) {
            if (error) {
                console.log('error', error)
                throw error
            }
            console.log(results)
        })
    }
}

module.exports = {
    Migration
}