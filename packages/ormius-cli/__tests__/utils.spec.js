const { ensureDirSync, capitalize } = require('../cli/utils')

jest.mock('fs', () => ({
    mkdirSync: jest.fn((dirName) => {
        if (dirName === 'exist') {
            const error = new Error('error')

            error.code = 'EEXIST'
            throw error
        } else if (dirName === 'error') {
            throw new Error('error')
        } else {
            return true
        }
    })
}))

describe('utils test', () => {
    test('does not throw error if folder does not exist', () => {
        try {
            ensureDirSync('test')
        } catch (e) {
            expect(false).toBe(true)
        }
    })

    test('does not throw error if folder exist', () => {
        try {
            ensureDirSync('exist')
        } catch (e) {
            expect(false).toBe(true)
        }
    })

    test('throw unexpected error', () => {
        try {
            ensureDirSync('error')
            expect(false).toBe(true)
        } catch (e) {
            expect(e.message).toBe('error')
        }
    })

    test('capitalize', () => {
        expect(capitalize('test')).toBe('Test')
    })
})
