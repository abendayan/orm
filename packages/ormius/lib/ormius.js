import fs from 'fs'
import mysql from 'mysql'

export class Orm {
    constructor(configFile, params = {}) {
        if (!configFile) {
            throw new Error('The config file is required')
        }
        const { deferConnection } = params

        this.config = JSON.parse(fs.readFileSync(configFile, 'utf8'))
        this.connection = mysql.createConnection(this.config)
        if (!deferConnection) {
            this.connect()
        }
    }

    connect() {
        const self = this

        this.connection.connect((err) => {
            if (err) {
                throw err
            }
            console.log(`connected as id ${  self.connection.threadId}`)
        })
    }

    close() {
        this.connection.end()
    }
}
