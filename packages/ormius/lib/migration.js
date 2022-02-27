class Migration {
    #connection
    modelName
    migrationId

    setConnection(connection) {
        this.#connection = connection
    }

    setMigrationId(migrationId) {
        this.migrationId = migrationId
    }

    createTable(newTable) {
        console.log(newTable)
        const self = this
        this.#connection.query(`CREATE TABLE ${this.modelName} (${newTable.map(({ type, name }) => `${name} ${type}`).join(',')})`, function (error) {
            if (error) {
                console.log('error', error)
                throw error
            }
            self.#connection.query('INSERT INTO migrations (migration) VALUES (?)', [self.migrationId], function (error) {
                if (error) {
                    console.log('error', error)
                    throw error
                }
            })
        })
    }
}

module.exports = {
    Migration
}