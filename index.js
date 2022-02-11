const fs = require('fs')
const mysql = require('mysql')
const { buildModel } = require('./lib/model')

class Orm {
  constructor(configFile, params = {}) {
    if (!configFile) {
      throw new Error('The config file is required')
    }
    const {deferConnection} = params
    this.config = JSON.parse(fs.readFileSync(configFile, 'utf8'))
    console.log(this.config.config)
    this.connection = mysql.createConnection(this.config.config)
    if (!deferConnection) {
      this.connect()
    }
    this.buildKnownModels()
  }

  connect() {
    const self = this
    this.connection.connect(function(err) {
      if (err) throw err;
      console.log('connected as id ' + self.connection.threadId);
    })
  }

  close() {
    this.connection.end()
  }

  buildKnownModels() {
    this.models = {}
    Object.keys(this.config.models).forEach(model => {
      this.models[model] = {}
      this[model] = buildModel(model, this.connection)
      // Orm.prototype[model] = modelFunctions
    })
  }
}

module.exports.Orm = Orm