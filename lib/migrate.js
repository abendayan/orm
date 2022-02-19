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

const data = 'const { Model } = require(\'ormius\')'
fs.writeFile(path.join(sourcePath, `${modelFolder}/${newModelName}/${newModelName}.js`), data, { flag: 'wx' }, function (err) {
    if (err) throw err;
    console.log("It's saved!")
})

console.log(args['--create'])