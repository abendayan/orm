import { TYPES, RELATION_TYPES } from './types'

export class Query {
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

    clean() {
        this.currentQuery = ''
        this.conditions = []
        this.selectColumns = this.allowedColumns()
        this.selectColumnsIds = []
        this.returnNumber = null
        this.joins = []
    }

    where(column, condition) {
        let selectQuery
        let currentCondition

        switch (this.model[column].type) {
            case TYPES.STRING:
            case TYPES.INT:
            case TYPES.BOOLEAN:
                selectQuery = 'SELECT ?? FROM ?? WHERE ??=?'
                currentCondition = [this.selectColumns, this.modelName, column, condition]
                break
            case TYPES.BELONGS_TO:
                selectQuery = `SELECT ??, ${this.allowedColumns(this.model[column].parent.class.model, this.model[column].parent.class.modelName).join(',')} FROM ?? LEFT JOIN ?? ON ??=?? WHERE ??=?`
                currentCondition = [this.selectColumns, this.modelName, this.model[column].parent.class.modelName,
                    `${this.model[column].parent.class.modelName}.${this.model[column].parent.attribute}`,
                    `${this.modelName}.${this.model[column].from}`,
                    `${this.model[column].parent.class.modelName}.${this.model[column].parent.attribute}`, condition]
                break
            default:
                throw new Error(`Not supported type ${this.model[column].type}`)
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

    findBy(column, condition) {
        this.returnNumber = 0
        this.where(column, condition)
        this.currentQuery = `${this.currentQuery} LIMIT 1`
        return this
    }

    updateBy(conditions, values) {
        this.currentQuery = 'UPDATE ?? SET '
        this.conditions = [this.modelName]
        Object.keys(values).reduce((currentQuery, valueKey) => {
            if ([TYPES.BOOLEAN, TYPES.INT, TYPES.STRING].includes(this.model[valueKey].type)) {
                if (currentQuery !== '') {
                    this.currentQuery += ', '
                }
                currentQuery += `${valueKey} = '${values[valueKey]}'`
                this.currentQuery += `${valueKey} = ?`
                this.conditions.push(values[valueKey])
            }
            return currentQuery
        }, '')
        this.currentQuery += ' WHERE '
        Object.keys(conditions).reduce((currentQuery, condition) => {
            if ([TYPES.BOOLEAN, TYPES.INT, TYPES.STRING].includes(this.model[condition].type)) {
                if (currentQuery !== '') {
                    this.currentQuery += ', '
                }
                currentQuery += `${condition} = '${conditions[condition]}'`
                this.currentQuery += `${condition} = ?`
                this.conditions.push(conditions[condition])
            }
            return currentQuery
        }, '')
        return this
    }

    select(fields) {
        this.selectColumns = this.allowedColumns(fields)
        this.selectColumnsIds.forEach((id) => {
            this.conditions[id] = this.selectColumns
        })
        console.log(this.currentQuery)
        return this
    }

    allowedColumns(fields, modelName = this.modelName) {
        const otherModel = modelName !== this.modelName
        let currentFields

        if (otherModel) {
            currentFields = Object.keys(fields)
        } else {
            currentFields = fields || Object.keys(this.model)
        }
        const model = (otherModel) ? fields : this.model

        return currentFields.filter((field) => {
            // otherModel ? `${modelName}.${field} as ${modelName}_${field}` :
            return !RELATION_TYPES.includes(model[field].type)
        }).map((field) => {
            if (otherModel) {
                this.joins.push(`${modelName}_${field}`)
            }
            return otherModel ? `${modelName}.${field} as ${modelName}_${field}` : `${modelName}.${field}`
        })
    }

    create(fields) {
        this.clean()
        const filteredFields = {}

        Object.keys(fields).filter((filter) => this.allowedColumns().includes(`${this.modelName}.${filter}`)).forEach((field) => {
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
        return new Promise((resolve, reject) => {
            self.connection.query(self.currentQuery, self.conditions, (error, results) => {
                if (error) {
                    reject(error)
                }
                const filtered = results.map((result) => {
                    return Object.keys(result).reduce((obj, key) => {
                        if (!self.joins.includes(key)) {
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
