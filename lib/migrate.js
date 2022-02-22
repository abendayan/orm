const arg = require('arg')
const fs = require('fs')
const path = require('path')
const modelFolder = './models'
const args = arg({
    // Types
    '--help': Boolean,
    '--source': String,
    '--create': String, // --name <string> or --name=<string>

    // Aliases
    '-c': '--create',
    '-s': '--source',
})

const sourcePath = args['--source']
function ensureDirSync (dirpath) {
    try {
        console.log('here', dirpath, __dirname, process.cwd(), sourcePath)
        return fs.mkdirSync(path.join(sourcePath, dirpath))
    } catch (err) {
        console.log(err, dirpath)
        if (err.code !== 'EEXIST') throw err
    }
}

const newModelName = args['--create']
if (!newModelName) {
    throw new Error('Should pass model name')
}
console.log(modelFolder)
ensureDirSync(modelFolder)
ensureDirSync(`${modelFolder}/${newModelName}`)

const data = 'const { TYPES } = require(\'ormius\')\n' +
  'const model = {}\n' +
  '\n' +
  `const modelName = \'${newModelName}\'\n` +
  '\n' +
  'module.exports = {\n' +
  '    model, modelName\n' +
  '}'
fs.writeFile(path.join(sourcePath, `${modelFolder}/${newModelName}/model.js`), data, { flag: 'wx' }, function (err) {
    if (err) throw err
    console.log('It s saved!')
})

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

fs.writeFile(path.join(sourcePath, `${modelFolder}/${newModelName}/${newModelName}.js`), dataModel, { flag: 'wx' }, function (err) {
    if (err) throw err
    console.log('It s saved!')
})

console.log(args['--create'])