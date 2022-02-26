const arg = require('arg')
const fs = require('fs')
const path = require('path')
const modelFolder = './models'
const migrateFolder = './migrations'
const { selectOption } = require('./selectOption')
const { RELATION_TYPES } = require('../lib/types')
const { Orm } = require('../lib/ormius')

const args = arg({
    // Types
    '--help': Boolean,
    '--run': Boolean,
    '--source': String,
    '--config': String,
    '--create': String, // --name <string> or --name=<string>

    // Aliases
    '-c': '--create',
    '-s': '--source',
    '-r': '--run',
})

const sourcePath = args['--source']
function ensureDirSync (dirpath) {
    try {
        return fs.mkdirSync(path.join(sourcePath, dirpath))
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
}

const newModelName = args['--create']

function buildModel (options) {
    ensureDirSync(modelFolder)
    const migrateDate = `${Date.now()}`
    ensureDirSync(migrateFolder)
    ensureDirSync(`${migrateFolder}/${migrateDate}`)
    ensureDirSync(`${modelFolder}/${newModelName}`)

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
    fs.writeFileSync(path.join(sourcePath, `${migrateFolder}/${migrateDate}/index.js`), migrateData, { flag: 'wx' })

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
    fs.writeFileSync(path.join(sourcePath, `${modelFolder}/${newModelName}/model.js`), data, { flag: 'wx' })

    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1)
    }

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
    fs.writeFileSync(path.join(sourcePath, `${modelFolder}/${newModelName}/${newModelName}.js`), dataModel, { flag: 'wx' })
}

if (newModelName) {
    selectOption.init(buildModel)
}

if (args['--run']) {
    const configArg = args['--config']
    if (!configArg) {
        throw new Error('Missing argument config')
    }
    const configPath = path.join(sourcePath, 'config.json')
    console.log('run migrations', configPath)
    const dirs = fs.readdirSync(`${sourcePath}/${migrateFolder}`, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
    console.log(dirs)
    const ormius = new Orm(configPath)
    ormius.connection.query('CREATE TABLE IF NOT EXISTS migrations (migration VARCHAR(255))', function (error, results) {
        if (error) {
            console.log('error', error)
            throw error
        }
        console.log(results)
    })
    ormius.connection.query('SELECT migration FROM migrations', function (error, results) {
        if (error) {
            console.log('error', error)
            throw error
        }
        const alreadyRanMigrations = results.map(({ migration }) => migration)
        const migrationsToRun = dirs.filter(migration => !alreadyRanMigrations.includes(migration))
        console.log('====', migrationsToRun, alreadyRanMigrations)
        migrationsToRun.map(currentMigration => {
            console.log(path.join(sourcePath, `${migrateFolder}/${currentMigration}/index.js`))
            const module = require(`../${sourcePath}/migrations/${currentMigration}/index`)
            const migrationModel = new module()
            migrationModel.setConnection(ormius.connection)
            migrationModel.setMigrationId(currentMigration)
            migrationModel.changes()
        })
    })
}