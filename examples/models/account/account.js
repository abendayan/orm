const { Model } = require('../../../lib/model')
const { TYPES } = require('../../../lib/types')
const { model: modelUser, modelName: modelUserName } = require('../user/model')
const { model, modelName } = require('./model')

class Account extends Model {
  constructor(ormius) {
    const _model = {
      ...model,
      "users": {
        "type": TYPES.HAS_MANY,
        "children": {
          "class": {
            "model": modelUser,
            "modelName": modelUserName
          },
          "attribute": "accountId"
        },
        "from": "id"
      }
    }
    super(modelName, _model, ormius.connection ? ormius.connection : ormius)
    this.model = model
  }
}

module.exports = {
  Account
}