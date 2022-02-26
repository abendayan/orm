const { TYPES } = require('../../../lib/types')
const model = {
    'id': {
        'type': TYPES.INT
    },
    'name': {
        'type': TYPES.STRING
    }
}

const modelName = 'account'

module.exports = {
    model, modelName
}