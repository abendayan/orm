const fs = require('fs')
const mysql = require('mysql')

class Orm {
  constructor(configFile, params = {}) {
    if (!configFile) {
      throw new Error('The config file is required')
    }
    const { deferConnection } = params
    this.config = JSON.parse(fs.readFileSync(configFile, 'utf8'))
    this.connection = mysql.createConnection(this.config)
    if (!deferConnection) {
      this.connect()
    }
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
}

module.exports.Orm = Orm