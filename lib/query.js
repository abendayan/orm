const { TYPES } = require('./types')

class Query {
  constructor(modelName, connection, model) {
    this.modelName = modelName
    this.connection = connection
    this.currentQuery = ''
    this.conditions = []
    this.model = model
    this.selectColumns = this.allowedColumns()
    this.selectColumnsIds = []
    this.joins = []
  }

  clean () {
    this.currentQuery = ''
    this.conditions = []
    this.selectColumns = this.allowedColumns()
    this.selectColumnsIds = []
    this.returnNumber = null
    this.joins = []
  }

  where (column, condition) {
    let selectQuery
    let currentCondition
    if (this.model[column].type === TYPES.BELONGS_TO) {
      const parent = new this.model[column].parent.class(this.connection)
      selectQuery = `SELECT ??, ${this.allowedColumns(parent.model, parent.modelName).join(',')} FROM ?? LEFT JOIN ?? ON ??=?? WHERE ??=?`
      currentCondition = [this.selectColumns, this.modelName, parent.modelName,
        `${parent.modelName}.${this.model[column].parent.attribute}`,
        `${this.modelName}.${this.model[column].from}`,
        `${parent.modelName}.${this.model[column].parent.attribute}`, condition]
    } else {
      selectQuery = 'SELECT ?? FROM ?? WHERE ??=?'
      currentCondition = [this.selectColumns, this.modelName, column, condition]
    }
    if (this.currentQuery !== '') {
      this.currentQuery = `${this.currentQuery} AND ${selectQuery}`
    } else {
      this.currentQuery = selectQuery
    }
    this.selectColumnsIds.push(this.conditions.length)
    this.conditions = [...this.conditions, ...currentCondition]
    console.log(this.currentQuery)
    console.log(this.conditions)
    return this
  }

  findBy (column, condition) {
    this.returnNumber = 0
    this.where(column, condition)
    this.currentQuery = `${this.currentQuery} LIMIT 1`
    return this
  }

  updateBy (conditions, values) {
    this.currentQuery = 'UPDATE ?? SET ? WHERE ?'
    this.conditions = [this.modelName, values, conditions]
    return this
  }

  select(fields) {
    this.selectColumns = this.allowedColumns(fields)
    this.selectColumnsIds.forEach(id => {
      this.conditions[id] = this.selectColumns
    })
    console.log(this.currentQuery)
    return this
  }

  allowedColumns (fields, modelName = this.modelName) {
    const otherModel = modelName !== this.modelName
    let currentFields
    if (otherModel) {
      currentFields = Object.keys(fields)
    } else {
      currentFields = fields || Object.keys(this.model)
    }
    const model = (otherModel) ? fields : this.model
    return currentFields.filter(field => {
      // otherModel ? `${modelName}.${field} as ${modelName}_${field}` :
      return model[field].type !== TYPES.BELONGS_TO
    }).map(field => {
      if (otherModel) {
        this.joins.push(`${modelName}_${field}`)
      }
      return otherModel ? `${modelName}.${field} as ${modelName}_${field}` : `${modelName}.${field}`
    })
  }

  create (fields) {
    this.clean()
    const filteredFields = {}
    Object.keys(fields).filter(filter => this.allowedColumns().includes(filter)).forEach(field => {
      filteredFields[field] = fields[field]
    })
    this.currentQuery = 'INSERT INTO ?? SET ?'
    this.conditions = [this.modelName, filteredFields]
    console.log(this.currentQuery)
    return this
  }

  async execute() {
    if (this.currentQuery === '' || !this.currentQuery) {
      throw new Error('Query not formed')
    }
    const self = this
    console.log('executed query', this.currentQuery, this.conditions)
    return new Promise(function(resolve, reject) {
      self.connection.query(self.currentQuery, self.conditions, function (error, results) {
        if (error) {
          reject(error)
        }
        const filtered = results.map(result => {
          return Object.keys(result).reduce((obj, key) => {
            if(!self.joins.includes(key)) {
              obj[key] = result[key]
              return obj
            } else {
              const [object, identity] = key.split('_')
              if (!obj[object]) {
                obj[object] = {}
              }
              obj[object][identity] = result[key]
              return obj
            }
          }, {})
        })
        if (self.returnNumber === 0) {
          resolve(filtered[0])
        } else {
          resolve(filtered)
        }
      })
    })
  }
}

module.exports = {
  Query
}