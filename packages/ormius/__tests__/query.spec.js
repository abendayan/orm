const { Query } = require('../lib/query')
const { TYPES } = require('../lib/types')

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

    test('select', () => {
        const query = new Query('modelName', {}, model)

        query.select(['email', 'id'])
        expect(query.selectColumns).toEqual(['modelName.email', 'modelName.id'])
    })
})
