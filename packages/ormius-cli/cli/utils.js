const fs = require('fs')

const ensureDirSync = (dirpath) => {
    try {
        return fs.mkdirSync(dirpath)
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err
        }
    }
}

const capitalize = (s) => {
    return s[0].toUpperCase() + s.slice(1)
}

const FOLDERS = {
    MODEL: './models',
    MIGRATION: './migrations'
}

module.exports = {
    ensureDirSync,
    capitalize,
    FOLDERS
}
