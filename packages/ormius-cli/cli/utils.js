import fs from 'fs'

export const ensureDirSync = (dirpath) => {
    try {
        return fs.mkdirSync(dirpath)
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err
        }
    }
}

export const capitalize = (s) => {
    return s[0].toUpperCase() + s.slice(1)
}

export const FOLDERS = {
    MODEL: './models',
    MIGRATION: './migrations'
}
