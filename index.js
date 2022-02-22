const { Orm } = require('./lib/ormius')
const { TYPES, RELATION_TYPES } = require('./lib/types')
const { Model } = require('./lib/model')

module.exports = {
  Orm,
  Model,
  TYPES,
  RELATION_TYPES
}