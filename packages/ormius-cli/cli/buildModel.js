const { ensureDirSync, FOLDERS, capitalize } = require('./utils')
const { RELATION_TYPES } = require('ormius/lib/types')
const fs = require('fs')

const buildModel = (options, newModelName) => {
    ensureDirSync(FOLDERS.MODEL)
    const migrateDate = `${Date.now()}`

    ensureDirSync(FOLDERS.MIGRATION)
    ensureDirSync(`${FOLDERS.MIGRATION}/${migrateDate}`)
    ensureDirSync(`${FOLDERS.MODEL}/${newModelName}`)

    const migrateData = 'const { Migration } = require(\'ormius\')\n' +
      'class NewMigration extends Migration {\n\n' +
      '  constructor() {\n' +
      '    super()\n' +
      `    this.modelName='${newModelName}'\n` +
      '  }\n\n' +
      '  changes() {\n' +
      `    this.createTable(${JSON.stringify(options.filter(({ type }) => !RELATION_TYPES.includes(type)))})\n` +
      '  }\n' +
      '}\n\n' +
      'module.exports = NewMigration'

    fs.writeFileSync(`${FOLDERS.MIGRATION}/${migrateDate}/index.js`, migrateData, { flag: 'wx' })

    let model = ''

    options.filter(({ type }) => !RELATION_TYPES.includes(type)).map(({ type, name }) => {
        model += `  "${name}": {\n`
        model += `    "type": TYPES.${type.toLocaleUpperCase()}\n`
        model += '  },\n'
    })
    const data = 'const { TYPES } = require(\'ormius\')\n' +
      `const model = {\n${model}}\n` +
      '\n' +
      `const modelName = '${newModelName}'\n` +
      '\n' +
      'module.exports = {\n' +
      '    model, modelName\n' +
      '}'

    fs.writeFileSync(`${FOLDERS.MODEL}/${newModelName}/model.js`, data, { flag: 'wx' })

    const dataModel = 'const { Model } = require(\'ormius\')\n' +
      'const { TYPES } = require(\'ormius\')\n' +
      'const { model, modelName } = require(\'./model\')\n' +
      '\n' +
      `class ${capitalize(newModelName)} extends Model {\n` +
      '  constructor(ormius) {\n' +
      '    const _model = {\n' +
      '      ...model,\n' +
      '    }\n' +
      '    super(modelName, _model, ormius.connection ? ormius.connection : ormius)\n' +
      '    this.model = model\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'module.exports = {\n' +
      `  ${capitalize(newModelName)}\n` +
      '}'

    fs.writeFileSync(`${FOLDERS.MODEL}/${newModelName}/${newModelName}.js`, dataModel, { flag: 'wx' })
}

const generateModel = (newModelName) => {
    const { selectOption } = require('./selectOption')

    selectOption.init(buildModel, newModelName)
}

module.exports = {
    generateModel,
    buildModel
}
