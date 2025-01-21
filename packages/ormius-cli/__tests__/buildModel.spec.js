import { buildModel } from '../cli/buildModel'
import { ensureDirSync, FOLDERS, capitalize } from '../cli/utils'
import { RELATION_TYPES } from 'ormius/lib/types'
import fs from 'fs'

jest.mock('../cli/utils', () => ({
    ensureDirSync: jest.fn(),
    FOLDERS: {
        MODEL: './mockModels',
        MIGRATION: './mockMigrations',
    },
    capitalize: jest.fn((str) => str.charAt(0).toUpperCase() + str.slice(1)),
}))

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
}))

describe('buildModel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const options = [
        { type: 'string', name: 'firstName' },
        { type: 'number', name: 'age' },
        { type: 'belongsTo', name: 'user' }, // RELATION_TYPE
    ]

    const newModelName = 'testModel'

    test('should create necessary directories', () => {
        buildModel(options, newModelName)

        expect(ensureDirSync).toHaveBeenCalledWith(FOLDERS.MODEL)
        expect(ensureDirSync).toHaveBeenCalledWith(FOLDERS.MIGRATION)
        expect(ensureDirSync).toHaveBeenCalledWith(expect.stringContaining(FOLDERS.MIGRATION))
        expect(ensureDirSync).toHaveBeenCalledWith(`${FOLDERS.MODEL}/${newModelName}`)
    })

    test('should write migration file with filtered options', () => {
        buildModel(options, newModelName)

        const migrationFilePath = `${FOLDERS.MIGRATION}/${expect.any(String)}/index.js`
        const migrationContent = expect.stringContaining(
            `this.createTable([{"type":"string","name":"firstName"},{"type":"number","name":"age"}])`
        )

        expect(fs.writeFileSync).toHaveBeenCalledWith(migrationFilePath, migrationContent, { flag: 'wx' })
    })

    test('should write model file with correct fields', () => {
        buildModel(options, newModelName)

        const modelFilePath = `${FOLDERS.MODEL}/${newModelName}/model.js`
        const modelContent = expect.stringContaining(`
          "firstName": {
            "type": TYPES.STRING
          },
          "age": {
            "type": TYPES.NUMBER
          }
        `)

        expect(fs.writeFileSync).toHaveBeenCalledWith(modelFilePath, modelContent, { flag: 'wx' })
    })

    test('should write model class file with correct name and content', () => {
        buildModel(options, newModelName)

        const classFilePath = `${FOLDERS.MODEL}/${newModelName}/${newModelName}.js`
        const classContent = expect.stringContaining(`class TestModel extends Model {`)

        expect(fs.writeFileSync).toHaveBeenCalledWith(classFilePath, classContent, { flag: 'wx' })
        expect(capitalize).toHaveBeenCalledWith(newModelName)
    })
})