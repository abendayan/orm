let mockError = null
let mockErrorSecond = null

const mockCallback = (query, callback) => {
    if (query === 'CREATE TABLE IF NOT EXISTS migrations (migration VARCHAR(255))') {
        callback(mockError, [])
    } else if (query === 'SELECT migration FROM migrations') {
        callback(mockErrorSecond, [{ migration: 'test' }])
    }
}

const mockOrmius = {
    connection: {
        query: jest.fn((query, callback) => mockCallback(query, callback))
    }
}

const { runMigration, executeMigration } = require('../cli/runMigration')

const mockMigration = {
    setConnection: jest.fn(),
    setMigrationId: jest.fn(),
    changes: jest.fn(),
    markAsRan: jest.fn()
}

jest.mock('fs', () => ({
    readdirSync: jest.fn(() => {
        const directory = { name: 'migration' }

        directory.isDirectory = () => true
        return [directory]
    })
}))

jest.mock('../cli/migrations/test/index', () => (
    jest.fn(() => mockMigration)
), { virtual: true })

jest.mock('../cli/migrations/migration/index', () => (
    jest.fn(() => mockMigration)
), { virtual: true })

jest.mock('ormius/lib/ormius', () => ({
    Orm: jest.fn(() => mockOrmius)
}))

describe('run migration test', () => {
    test('expect argument', () => {
        try {
            runMigration()
            expect(false).toBe(true)
        } catch (e) {
            expect(e.message).toBe('Missing argument config')
        }
    })

    test('executeMigration', () => {
        const mockConnection = {}

        executeMigration(mockConnection, 'test')
        expect(mockMigration.setConnection).toHaveBeenCalledWith(mockConnection)
        expect(mockMigration.setMigrationId).toHaveBeenCalledWith('test')
        expect(mockMigration.changes).toHaveBeenCalled()
        expect(mockMigration.markAsRan).toHaveBeenCalled()
    })

    test('runMigration', () => {
        runMigration('config.json')
        expect(mockOrmius.connection.query.mock.calls).toMatchSnapshot()
    })

    test('runMigration with error', () => {
        mockError = 'Error'
        try {
            runMigration('config.json')
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toBe('Error')
        }
    })

    test('runMigration with error', () => {
        mockError = null
        mockErrorSecond = 'Error'
        try {
            runMigration('config.json')
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toBe('Error')
            expect(mockOrmius.connection.query.mock.calls).toMatchSnapshot()
        }
    })
})
