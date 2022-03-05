const mockOrmius = {
    connection: {
        query: jest.fn()
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
})
