const TYPES = {
  INT: 'int',
  STRING: 'string',
  BELONGS_TO: 'belongs_to',
  HAS_MANY: 'has_many'
}

const RELATION_TYPES = [TYPES.BELONGS_TO, TYPES.HAS_MANY]

module.exports = {
  TYPES,
  RELATION_TYPES
}