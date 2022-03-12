const mockSelectOption = {
    init: jest.fn()
}

const mockUtils = {
    ensureDirSync: jest.fn(),
    capitalize: jest.fn(),
    FOLDERS: {
        MODEL: './models',
        MIGRATION: './migrations'
    }
}

const mockFs = {
    writeFileSync: jest.fn()
}

jest.mock('fs', () => (
    mockFs
))

const { generateModel, buildModel } = require('../cli/buildModel')

jest.mock('../cli/selectOption', () => (
    { selectOption: mockSelectOption }
))

jest.mock('../cli/utils', () => (
    mockUtils
))

describe('buildModel', () => {
    test('generateModel', () => {
        generateModel('test')
        expect(mockSelectOption.init.mock.calls).toMatchSnapshot()
    })

    test('buildModel', () => {
        Date.now = jest.fn(() => 1647098090769)
        buildModel([{ type: 'string', name: 'test' }], 'modelTest')
        expect(mockFs.writeFileSync.mock.calls).toMatchSnapshot()
        expect(mockUtils.capitalize.mock.calls).toMatchSnapshot()
        expect(mockUtils.ensureDirSync.mock.calls).toMatchSnapshot()
    })
})
