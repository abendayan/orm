const { Model } = require('../../../ormius/lib/model')
const { TYPES } = require('../../../ormius/lib/types')
const { model: modelAccount, modelName: modelAccoutName } = require('../account/model')
const { model, modelName } = require('./model')

class User extends Model {
    constructor(ormius) {
        const _model = {
            ...model,
            account: {
                type: TYPES.BELONGS_TO,
                parent: {
                    class: {
                        model: modelAccount,
                        modelName: modelAccoutName
                    },
                    attribute: 'id'
                },
                from: 'accountId'
            }
        }

        super(modelName, _model, ormius)
        this.model = model
    }
}

module.exports = {
    User
}
