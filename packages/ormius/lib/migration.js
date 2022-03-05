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

    markAsRan() {
        this.#connection.query('INSERT INTO migrations (migration) VALUES (?)', this.migrationId, (error) => {
            if (error) {
                console.log('error', error)
                throw error
            }
        })
    }

    addColumn(columnName, columnType) {
        console.log('add column', this.modelName, columnName, columnType)
        this.#connection.query(`ALTER TABLE ${this.modelName} ADD ${columnName} ${columnType}`, (error) => {
            if (error) {
                console.log('error', error)
                throw error
            }
        })
    }

    createTable(newTable) {
        console.log(newTable)
        this.#connection.query(`CREATE TABLE ${this.modelName} (${newTable.map(({ type, name }) => `${name} ${type}`).join(',')})`, (error) => {
            if (error) {
                console.log('error', error)
                throw error
            }
        })
    }
}

module.exports = {
    Migration
}
