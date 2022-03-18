const mockConnection = {
    connect: jest.fn((cb) => {
        cb()
    }),
    end: jest.fn(),
    threadId: 'threadId'
}

const mockCreateConnection = jest.fn(() => {
    return mockConnection
})

jest.mock('mysql', () => ({
    createConnection: mockCreateConnection
}))

jest.mock('fs', () => ({
    readFileSync: jest.fn(() => {
        return '{\n' +
          '  "user": "user",\n' +
          '  "password": "password",\n' +
          '  "host": "127.0.0.1",\n' +
          '  "port": 3306,\n' +
          '  "database": "database"\n' +
          '}'
    })
}))

const { Orm } = require('../lib/ormius')

describe('ormius', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('without defer connection', () => {
        new Orm('file')

        expect(mockCreateConnection).toHaveBeenCalled()
        expect(mockConnection.connect).toHaveBeenCalled()
    })

    test('with defer connection', () => {
        new Orm('file', { deferConnection: true })

        expect(mockCreateConnection).toHaveBeenCalled()
        expect(mockConnection.connect).not.toHaveBeenCalled()
    })

    test('without config file', () => {
        try {
            new Orm()
            expect(false).toBe(true)
        } catch (e) {
            expect(e.message).toBe('The config file is required')
        }
    })

    test('close', () => {
        const ormius = new Orm('file')

        ormius.close()
        expect(mockConnection.end).toHaveBeenCalled()
    })

    test('connect', () => {
        const ormius = new Orm('file', { deferConnection: true })

        ormius.connect()
        expect(mockConnection.connect.mock.calls).toMatchSnapshot()
    })

    test('connect with error', () => {
        const ormius = new Orm('file', { deferConnection: true })

        mockConnection.connect = jest.fn((cb) => {
            cb('error')
        })
        try {
            ormius.connect()
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toBe('error')
        }
    })
})
