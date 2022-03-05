const { TYPES } = require('ormius')

const model = {
    id: {
        type: TYPES.INT
    },
    name: {
        type: TYPES.STRING
    }
}

const modelName = 'account'

module.exports = {
    model, modelName
}
