const { Query } = require('./query')

class Model {
    #query
    #model
    #connection

    constructor(modelName, model, ormius, values = {}) {
        this.modelName = modelName
        this.#connection = ormius.connection ? ormius.connection : ormius
        this.#model = model
        this.#query = new Query(this.modelName, this.#connection, this.#model)
        this.values = values
    }

    setValues(values) {
        this.values = values
        return this
    }

    findBy = (column, condition) => {
        this.#query.findBy(column, condition)
        return this
    }

    where = (column, condition) => {
        this.#query.where(column, condition)
        return this
    }

    updateBy = (newValues, conditions = this.values) => {
        this.#query.updateBy(conditions, newValues)
        return this
    }

    select = (fields) => {
        this.#query.select(fields)
        return this
    }

    create = (fields) => {
        this.#query.create(fields)
        return this
    }

    execute = async () => {
        const result = await this.#query.execute()
        this.#query.clean()
        if (Array.isArray(result)) {
            return result.map(oneResult => {
                return new this.constructor(this.#connection).setValues(oneResult)
            })
        } else {
            this.values = result
            return this
        }
    }
}

module.exports = {
    Model
}