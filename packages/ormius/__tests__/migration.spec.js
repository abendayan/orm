import { Migration } from '../lib/migration'

describe('Migration Class', () => {
    let migration
    let mockConnection

    beforeEach(() => {
        // Mock the database connection
        mockConnection = {
            query: jest.fn((query, params, callback) => {
                if (typeof callback === 'function') {
                    callback(null) // Simulate a successful query
                }
            })
        }

        // Create an instance of Migration and set up initial state
        migration = new Migration()
        migration.setConnection(mockConnection)
        migration.modelName = 'test_table'
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('should set the migration ID', () => {
        migration.setMigrationId('migration_001')
        expect(migration.migrationId).toBe('migration_001')
    })

    test('should mark migration as ran', () => {
        migration.setMigrationId('migration_001')
        migration.markAsRan()
        expect(mockConnection.query).toHaveBeenCalledWith(
            'INSERT INTO migrations (migration) VALUES (?)',
            'migration_001',
            expect.any(Function)
        )
    })

    test('should throw an error if markAsRan query fails', () => {
        mockConnection.query.mockImplementationOnce((query, params, callback) => {
            callback(new Error('Query failed'))
        })

        migration.setMigrationId('migration_001')
        expect(() => migration.markAsRan()).toThrow('Query failed')
    })

    test('should add a column successfully', () => {
        const successCallback = jest.fn()

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null)
            successCallback()
        })
        migration.addColumn('new_column', 'VARCHAR(255)')
        expect(mockConnection.query).toHaveBeenCalledWith(
            'ALTER TABLE test_table ADD new_column VARCHAR(255)',
            expect.any(Function)
        )
        expect(successCallback).toHaveBeenCalled()
    })

    test('should handle error when adding a column', () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Query failed'))
        })

        expect(() => migration.addColumn('new_column', 'VARCHAR(255)')).toThrow('Query failed')
        expect(mockConnection.query).toHaveBeenCalledWith(
            'ALTER TABLE test_table ADD new_column VARCHAR(255)',
            expect.any(Function)
        )
    })

    test('should create a table', () => {
        const newTable = [
            { name: 'id', type: 'INT AUTO_INCREMENT PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(255)' }
        ]
        const successCallback = jest.fn()

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null)
            successCallback()
        })
        migration.createTable(newTable)
        expect(mockConnection.query).toHaveBeenCalledWith(
            'CREATE TABLE test_table (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255))',
            expect.any(Function)
        )
        expect(successCallback).toHaveBeenCalled()
    })

    test('should throw an error if createTable query fails', () => {
        const newTable = [
            { name: 'id', type: 'INT AUTO_INCREMENT PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(255)' }
        ]

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Query failed'))
        })

        expect(() => migration.createTable(newTable)).toThrow('Query failed')
    })
})
