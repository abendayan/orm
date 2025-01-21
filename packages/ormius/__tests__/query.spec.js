import { Query } from '../lib/query'
import { TYPES } from '../lib/types'

const model = {
    id: {
        type: TYPES.INT
    },
    email: {
        type: TYPES.STRING
    },
    name: {
        type: TYPES.STRING
    },
    accountId: {
        type: TYPES.INT
    },
    wrongType: {
        type: 'unknown'
    },
    account: {
        type: TYPES.BELONGS_TO,
        parent: {
            class: {
                model: {
                    id: {
                        type: TYPES.INT
                    }
                },
                modelName: 'modelAccoutName'
            },
            attribute: 'id'
        },
        from: 'accountId'
    }
}

describe('query', () => {
    test('constructor', () => {
        const query = new Query('modelName', {}, model)

        expect(query.selectColumns).toEqual(['modelName.id', 'modelName.email', 'modelName.name', 'modelName.accountId', 'modelName.wrongType'])
    })

    test('clean', () => {
        const query = new Query('modelName', {}, model)

        query.selectColumns = ['modelName.id']
        query.clean()
        expect(query.selectColumns).toEqual(['modelName.id', 'modelName.email', 'modelName.name', 'modelName.accountId', 'modelName.wrongType'])
    })

    test('where', () => {
        const query = new Query('modelName', {}, model)

        query.where('email', 'test@test.com')
        expect(query.currentQuery).toEqual('SELECT ?? FROM ?? WHERE ??=?')
        expect(query.conditions).toEqual([[
            'modelName.id',
            'modelName.email',
            'modelName.name',
            'modelName.accountId', 'modelName.wrongType'
        ], 'modelName', 'email', 'test@test.com'])
    })

    test('where belongs to', () => {
        const query = new Query('modelName', {}, model)

        query.where('account', 3)
        expect(query.currentQuery).toEqual('SELECT ??, modelAccoutName.id as modelAccoutName_id FROM ?? LEFT JOIN ?? ON ??=?? WHERE ??=?')
        expect(query.conditions).toEqual([[
            'modelName.id',
            'modelName.email',
            'modelName.name',
            'modelName.accountId', 'modelName.wrongType'
        ], 'modelName', 'modelAccoutName', 'modelAccoutName.id', 'modelName.accountId', 'modelAccoutName.id', 3])
    })

    test('where type not supported', () => {
        const query = new Query('modelName', {}, model)

        try {
            query.where('wrongType', 'a')
            expect(false).toBe(true)
        } catch (e) {
            expect(e.message).toBe('Not supported type unknown')
        }
    })

    test('multiple where', () => {
        const query = new Query('modelName', {}, model)

        query.where('email', 'test@test.com').where('account', 3)
        expect(query.currentQuery).toEqual('SELECT ?? FROM ?? WHERE ??=? AND SELECT ??, modelAccoutName.id as modelAccoutName_id FROM ?? LEFT JOIN ?? ON ??=?? WHERE ??=?')
        expect(query.conditions).toEqual([[
            'modelName.id',
            'modelName.email',
            'modelName.name',
            'modelName.accountId', 'modelName.wrongType'
        ], 'modelName', 'email', 'test@test.com', ['modelName.id', 'modelName.email', 'modelName.name', 'modelName.accountId', 'modelName.wrongType'],
        'modelName', 'modelAccoutName', 'modelAccoutName.id', 'modelName.accountId', 'modelAccoutName.id', 3])
    })

    test('findBy', () => {
        const query = new Query('modelName', {}, model)

        query.findBy('email', 'test@test.com')
        expect(query.currentQuery).toEqual('SELECT ?? FROM ?? WHERE ??=? LIMIT 1')
        expect(query.conditions).toEqual([[
            'modelName.id',
            'modelName.email',
            'modelName.name',
            'modelName.accountId', 'modelName.wrongType'
        ], 'modelName', 'email', 'test@test.com'])
    })

    test('updateBy', () => {
        const query = new Query('modelName', {}, model)

        query.updateBy({ email: 'test@test.com' }, { email: 'test2@test.com' })
        expect(query.currentQuery).toEqual('UPDATE ?? SET email = ? WHERE email = ?')
        expect(query.conditions).toEqual(['modelName', 'test2@test.com', 'test@test.com'])
    })

    test('updateBy multiple values', () => {
        const query = new Query('modelName', {}, model)

        query.updateBy({ email: 'test@test.com' }, { email: 'test2@test.com', name: 'newName', wrongType: 'test' })
        expect(query.currentQuery).toEqual('UPDATE ?? SET email = ?, name = ? WHERE email = ?')
        expect(query.conditions).toEqual(['modelName', 'test2@test.com', 'newName', 'test@test.com'])
    })

    test('updateBy multiple conditions', () => {
        const query = new Query('modelName', {}, model)

        query.updateBy({ email: 'test@test.com', name: 'condition', wrongType: 'test' }, { email: 'test2@test.com' })
        expect(query.currentQuery).toEqual('UPDATE ?? SET email = ? WHERE email = ?, name = ?')
        expect(query.conditions).toEqual(['modelName', 'test2@test.com', 'test@test.com', 'condition'])
    })

    test('select', () => {
        const query = new Query('modelName', {}, model)

        query.select(['email', 'id'])
        expect(query.selectColumns).toEqual(['modelName.email', 'modelName.id'])
    })

    test('select with selectColumnsIds', () => {
        const query = new Query('modelName', {}, model)

        query.selectColumnsIds = [1]
        query.conditions = ['test', 'changed']
        query.select(['email', 'id'])
        expect(query.selectColumns).toEqual(['modelName.email', 'modelName.id'])
        expect(query.conditions).toEqual(['test', ['modelName.email', 'modelName.id']])
    })

    test('create', () => {
        const query = new Query('modelName', {}, model)

        query.create({ email: 'email@email.com' })
        expect(query.conditions).toEqual(['modelName', { email: 'email@email.com' }])
        expect(query.currentQuery).toEqual('INSERT INTO ?? SET ?')
    })

    test('execute without formed query', async() => {
        const query = new Query('modelName', {}, model)

        try {
            await query.execute()
            expect(false).toBe(true)
        } catch (e) {
            expect(e.message).toBe('Query not formed')
        }
    })

    test('execute with empty query', async() => {
        const query = new Query('modelName', {}, model)

        query.currentQuery = null
        try {
            await query.execute()
            expect(false).toBe(true)
        } catch (e) {
            expect(e.message).toBe('Query not formed')
        }
    })

    test('execute with error', async() => {
        const connection = { query: jest.fn((query, conditions, cb) => {
            cb('error')
        }) }
        const query = new Query('modelName', connection, model)

        query.currentQuery = 'test query'
        try {
            await query.execute()
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toBe('error')
        }
    })

    test('execute with simple result', async() => {
        const connection = { query: jest.fn((query, conditions, cb) => {
            cb(null, [{ email: 'test@test.com' }])
        }) }
        const query = new Query('modelName', connection, model)

        query.currentQuery = 'test query'
        const result = await query.execute()

        expect(result).toEqual([{ email: 'test@test.com' }])
    })

    test('execute with only one result', async() => {
        const connection = { query: jest.fn((query, conditions, cb) => {
            cb(null, [{ email: 'test@test.com' }])
        }) }
        const query = new Query('modelName', connection, model)

        query.returnNumber = 0
        query.currentQuery = 'test query'
        const result = await query.execute()

        expect(result).toEqual({ email: 'test@test.com' })
    })

    test('execute with join', async() => {
        const connection = { query: jest.fn((query, conditions, cb) => {
            cb(null, [{ email: 'test@test.com', ['account_id']: 33, ['account_name']: 'test' }])
        }) }
        const query = new Query('modelName', connection, model)

        query.currentQuery = 'test query'
        query.joins = ['account_id', 'account_name']
        const result = await query.execute()

        expect(result).toEqual([{ email: 'test@test.com', account: { id: 33, name: 'test' } }])
    })
})
