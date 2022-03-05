const { TYPES } = require('../../../ormius/lib/types')

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
    }
}

const modelName = 'user'

module.exports = {
    model, modelName
}
