const { Model } = require('../../lib/model')
const { TYPES } = require('../../lib/types')

class Account extends Model {
  constructor(ormius) {
    const model = {
      "id": {
        "type": TYPES.INT
      },
      "name": {
        "type": TYPES.STRING
      }
    }
    super('account', model, ormius.connection ? ormius.connection : ormius)
    this.model = model
  }
}

module.exports = {
  Account
}