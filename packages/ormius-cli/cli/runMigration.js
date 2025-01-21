import fs from 'fs'
import { Orm } from 'ormius/lib/ormius'
import { FOLDERS } from './utils'

export const runMigration = (configArg) => {
    if (!configArg) {
        throw new Error('Missing argument config')
    }
    console.log('run migrations', configArg)
    const dirs = fs.readdirSync(FOLDERS.MIGRATION, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

    console.log(dirs)
    const ormius = new Orm(configArg)

    ormius.connection.query('CREATE TABLE IF NOT EXISTS migrations (migration VARCHAR(255))', (error, results) => {
        if (error) {
            console.log('error', error)
            throw error
        }
        console.log(results)
    })
    ormius.connection.query('SELECT migration FROM migrations', (error, results) => {
        if (error) {
            console.log('error', error)
            throw error
        }
        const alreadyRanMigrations = results.map(({ migration }) => migration)
        const migrationsToRun = dirs.filter((migration) => !alreadyRanMigrations.includes(migration))

        migrationsToRun.map((currentMigration) => {
            executeMigration(ormius.connection, currentMigration)
        })
    })
}

export const executeMigration = (connection, migration) => {
    const Module = require(`${FOLDERS.MIGRATION}/${migration}/index`)
    const migrationModel = new Module()

    migrationModel.setConnection(connection)
    migrationModel.setMigrationId(migration)
    migrationModel.changes()
    migrationModel.markAsRan()
}
