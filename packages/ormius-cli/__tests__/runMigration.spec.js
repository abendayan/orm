import fs from 'fs'
import { Orm } from 'ormius/lib/ormius'
import { FOLDERS } from '../cli/utils'
import { runMigration, executeMigration } from '../cli/runMigration' 

jest.mock('fs', () => ({
    readdirSync: jest.fn(),
}))

jest.mock('ormius/lib/ormius', () => ({
    Orm: jest.fn(() => ({
        connection: {
            query: jest.fn(),
        },
    })),
}))

jest.mock('../cli/utils', () => ({
    FOLDERS: {
        MIGRATION: './mockMigrations',
    },
}))

jest.mock('./mockMigrations/testMigration/index', () => {
    return class MockMigration {
        setConnection = jest.fn()
        setMigrationId = jest.fn()
        changes = jest.fn()
        markAsRan = jest.fn()
    }
}, { virtual: true })

describe('runMigration', () => {
    let mockOrmInstance
    const configArg = { host: 'localhost', user: 'root', password: '' }

    beforeEach(() => {
        jest.clearAllMocks()
        mockOrmInstance = new Orm(configArg)
    })

    test('should throw an error if configArg is missing', () => {
        expect(() => runMigration()).toThrow('Missing argument config')
    })

    test('should create migrations table and fetch already ran migrations', () => {
        fs.readdirSync.mockReturnValueOnce([
            { isDirectory: () => true, name: 'testMigration' },
        ])

        mockOrmInstance.connection.query.mockImplementationOnce((query, callback) => {
            if (query.includes('CREATE TABLE')) callback(null, [])
        })

        mockOrmInstance.connection.query.mockImplementationOnce((query, callback) => {
            if (query.includes('SELECT migration')) callback(null, [])
        })

        runMigration(configArg)

        expect(fs.readdirSync).toHaveBeenCalledWith(FOLDERS.MIGRATION, { withFileTypes: true })
        expect(mockOrmInstance.connection.query).toHaveBeenCalledWith(
            'CREATE TABLE IF NOT EXISTS migrations (migration VARCHAR(255))',
            expect.any(Function)
        )
        expect(mockOrmInstance.connection.query).toHaveBeenCalledWith(
            'SELECT migration FROM migrations',
            expect.any(Function)
        )
    })

    test('should execute migrations that are not already ran', () => {
        fs.readdirSync.mockReturnValueOnce([
            { isDirectory: () => true, name: 'testMigration' },
        ])

        mockOrmInstance.connection.query.mockImplementationOnce((query, callback) => {
            if (query.includes('CREATE TABLE')) callback(null, [])
        })

        mockOrmInstance.connection.query.mockImplementationOnce((query, callback) => {
            if (query.includes('SELECT migration')) callback(null, [{ migration: 'otherMigration' }])
        })

        runMigration(configArg)

        expect(mockOrmInstance.connection.query).toHaveBeenCalledWith(
            'CREATE TABLE IF NOT EXISTS migrations (migration VARCHAR(255))',
            expect.any(Function)
        )
        expect(mockOrmInstance.connection.query).toHaveBeenCalledWith(
            'SELECT migration FROM migrations',
            expect.any(Function)
        )
    })
})

describe('executeMigration', () => {
    let mockConnection

    beforeEach(() => {
        mockConnection = {
            query: jest.fn(),
        }
    })

    test('should execute migration correctly', () => {
        const migration = 'testMigration'

        executeMigration(mockConnection, migration)

        const MockMigration = require(`${FOLDERS.MIGRATION}/${migration}/index`)
        const migrationInstance = new MockMigration()

        expect(migrationInstance.setConnection).toHaveBeenCalledWith(mockConnection)
        expect(migrationInstance.setMigrationId).toHaveBeenCalledWith(migration)
        expect(migrationInstance.changes).toHaveBeenCalled()
        expect(migrationInstance.markAsRan).toHaveBeenCalled()
    })
})