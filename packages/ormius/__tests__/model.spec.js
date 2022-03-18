let mockReturnValue = { test: 'value' }

const mockQuery = {
    findBy: jest.fn(),
    where: jest.fn(),
    updateBy: jest.fn(),
    select: jest.fn(),
    create: jest.fn(),
    clean: jest.fn(),
    execute: jest.fn().mockResolvedValue(mockReturnValue)
}

jest.mock('../lib/query', () => ({
    Query: jest.fn().mockImplementation(() => {
        return mockQuery
    })
}))

const { Model } = require('../lib/model')

describe('Model class', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('setValues', () => {
        const connectionMock = { query: jest.fn((query, migrationId, cb) => {
            cb()
        }) }
        const model = new Model('modelName', {}, connectionMock)
        const mockValues = { value: 'test' }

        expect(model.setValues(mockValues).values).toBe(mockValues)
    })

    test('findBy', () => {
        const connectionMock = { connection: {
            query: jest.fn((query, migrationId, cb) => {
                cb()
            })
        } }
        const model = new Model('modelName', {}, connectionMock)

        model.findBy('column', 1)
        expect(mockQuery.findBy.mock.calls).toMatchSnapshot()
    })

    test('where', () => {
        const connectionMock = { connection: {
            query: jest.fn((query, migrationId, cb) => {
                cb()
            })
        } }
        const model = new Model('modelName', {}, connectionMock)

        model.where('column', 1)
        expect(mockQuery.where.mock.calls).toMatchSnapshot()
    })

    test('updateBy with values', () => {
        const connectionMock = { connection: {
            query: jest.fn((query, migrationId, cb) => {
                cb()
            })
        } }
        const model = new Model('modelName', {}, connectionMock)

        model.setValues({ test: 4 })
        model.updateBy(3)
        expect(mockQuery.updateBy.mock.calls).toMatchSnapshot()
    })

    test('updateBy', () => {
        const connectionMock = { connection: {
            query: jest.fn((query, migrationId, cb) => {
                cb()
            })
        } }
        const model = new Model('modelName', {}, connectionMock)

        model.updateBy(3, { column: 2 })
        expect(mockQuery.updateBy.mock.calls).toMatchSnapshot()
    })

    test('select', () => {
        const connectionMock = { connection: {
            query: jest.fn((query, migrationId, cb) => {
                cb()
            })
        } }
        const model = new Model('modelName', {}, connectionMock)

        model.select(['email', 'id'])
        expect(mockQuery.select.mock.calls).toMatchSnapshot()
    })

    test('create', () => {
        const connectionMock = { connection: {
            query: jest.fn((query, migrationId, cb) => {
                cb()
            })
        } }
        const model = new Model('modelName', {}, connectionMock)

        model.create({ test: 'value' })
        expect(mockQuery.create.mock.calls).toMatchSnapshot()
    })

    test('execute', async() => {
        const connectionMock = { connection: {
            query: jest.fn((query, migrationId, cb) => {
                cb()
            })
        } }
        const model = new Model('modelName', {}, connectionMock)

        await model.execute()
        expect(mockQuery.clean).toHaveBeenCalled()
        expect(model.values).toBe(mockReturnValue)
    })

    test('execute multiple results', async() => {
        const connectionMock = { query: jest.fn((query, migrationId, cb) => {
            cb()
        }) }

        mockReturnValue = [{ test: 'one' }, { test: 'two' }]
        mockQuery.execute = jest.fn().mockResolvedValue(mockReturnValue)
        const model = new Model('modelName', {}, connectionMock)

        jest.spyOn(model, 'constructor').mockImplementation(() => ({
            setValues: jest.fn()
        }))
        const results = await model.execute()

        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBe(2)
        expect(mockQuery.clean).toHaveBeenCalled()
    })
})
