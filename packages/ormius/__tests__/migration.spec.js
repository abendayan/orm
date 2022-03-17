const { Migration } = require('../lib/migration')

describe('migration', () => {
    test('setMigrationId', () => {
        const migration = new Migration()

        migration.setMigrationId('migrationTestId')
        expect(migration.migrationId).toBe('migrationTestId')
    })

    test('markAsRan', () => {
        const migration = new Migration()
        const connectionMock = { query: jest.fn() }

        migration.setMigrationId('migrationId')
        migration.setConnection(connectionMock)
        migration.markAsRan()
        expect(connectionMock.query.mock.calls).toMatchSnapshot()
    })

    test('markAsRan with error', () => {
        const migration = new Migration()
        const connectionMock = { query: jest.fn((query, migrationId, cb) => {
            cb('error')
        }) }

        migration.setMigrationId('migrationId')
        migration.setConnection(connectionMock)
        try {
            migration.markAsRan()
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toBe('error')
        }
    })

    test('addColumn', () => {
        const migration = new Migration()

        migration.modelName = 'modelName'
        const connectionMock = { query: jest.fn() }

        migration.setMigrationId('migrationId')
        migration.setConnection(connectionMock)
        migration.addColumn('columnTest', 'string')
        expect(connectionMock.query.mock.calls).toMatchSnapshot()
    })

    test('addColumn with error', () => {
        const migration = new Migration()
        const connectionMock = { query: jest.fn((query, cb) => {
            cb('error')
        }) }

        migration.modelName = 'modelName'

        migration.setMigrationId('migrationId')
        migration.setConnection(connectionMock)
        try {
            migration.addColumn('columnTest', 'string')
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toBe('error')
        }
    })

    test('createTable', () => {
        const migration = new Migration()

        migration.modelName = 'modelName'
        const connectionMock = { query: jest.fn() }

        migration.setMigrationId('migrationId')
        migration.setConnection(connectionMock)
        migration.createTable([{ type: 'string', name: 'column' }, { type: 'boolean', name: 'second_column' }])
        expect(connectionMock.query.mock.calls).toMatchSnapshot()
    })

    test('createTable with error', () => {
        const migration = new Migration()
        const connectionMock = { query: jest.fn((query, cb) => {
            cb('error')
        }) }

        migration.modelName = 'modelName'

        migration.setMigrationId('migrationId')
        migration.setConnection(connectionMock)
        try {
            migration.createTable([{ type: 'string', name: 'column' }, { type: 'boolean', name: 'second_column' }])
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toBe('error')
        }
    })
})
