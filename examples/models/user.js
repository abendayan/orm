const { Model } = require('../../lib/model')
const { TYPES } = require('../../lib/types')
const { Account } = require('./account')

class User extends Model {
  constructor(ormius) {
    const model = {
      "id": {
        "type": TYPES.INT
      },
      "email": {
        "type": TYPES.STRING
      },
      "name": {
        "type": TYPES.STRING
      },
      "accountId": {
        "type": TYPES.INT
      },
      "account": {
        "type": TYPES.BELONGS_TO,
        "parent": {
          "class": Account,
          "attribute": "id"
        },
        "from": "accountId"
      }
    }
    super('user', model, ormius)
    this.model = model
  }
}

module.exports = {
  User
}