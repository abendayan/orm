jest.mock('readline', () => ({
    createInterface: jest.fn().mockReturnValue({
        question: jest.fn().mockImplementationOnce((_questionTest, cb) => cb('y')),
        close: jest.fn().mockImplementationOnce(() => undefined)
    }),
    emitKeypressEvents: jest.fn()
}))

const { selectOption, keyPressedHandler } = require('../cli/selectOption')

describe('selectOption', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('getPadding', () => {
        expect(selectOption.getPadding(3)).toEqual('    ')
    })

    test('createOptionMenu', () => {
        const spy = jest.spyOn(process.stdout, 'write').mockImplementation((object) => object)

        selectOption.createOptionMenu()
        expect(spy.mock.calls).toMatchSnapshot()
    })

    test('close', () => {
        process.stdin.setRawMode = jest.fn()
        const pause = jest.spyOn(process.stdin, 'pause').mockImplementation((object) => object)
        const exit = jest.spyOn(process, 'exit').mockImplementation(() => {})

        selectOption.close()
        expect(pause).toHaveBeenCalled()
        expect(exit).toHaveBeenCalledWith(0)
    })

    test('start', () => {
        process.stdin.setRawMode = jest.fn()
        const resume = jest.spyOn(process.stdin, 'resume').mockImplementation(() => {})
        const onKeypress = jest.spyOn(process.stdin, 'on').mockImplementation((object) => object)

        selectOption.start()
        expect(resume).toHaveBeenCalled()
        expect(onKeypress.mock.calls).toMatchSnapshot()
    })

    test('init', () => {
        const start = jest.spyOn(selectOption, 'start').mockImplementation(() => {})

        selectOption.init(jest.fn(), 'modelTest')
        expect(start).toHaveBeenCalled()
    })

    test('keyPressedHandler down', () => {
        const createOptionMenu = jest.spyOn(selectOption, 'createOptionMenu').mockImplementation(() => {})

        selectOption.selectIndex = 0
        selectOption.inSelectType = true
        keyPressedHandler('key', { name: 'down' })
        expect(selectOption.selectIndex).toEqual(1)
        expect(createOptionMenu).toHaveBeenCalled()
    })

    test('keyPressedHandler up', () => {
        const createOptionMenu = jest.spyOn(selectOption, 'createOptionMenu').mockImplementation(() => {})

        selectOption.selectIndex = 1
        selectOption.inSelectType = true
        keyPressedHandler('key', { name: 'up' })
        expect(selectOption.selectIndex).toEqual(0)
        expect(createOptionMenu).toHaveBeenCalled()
    })

    test('keyPressedHandler escape', () => {
        const callback = jest.spyOn(selectOption, 'callback').mockImplementation((object) => object)
        const close = jest.spyOn(selectOption, 'close').mockImplementation(() => {})

        keyPressedHandler('key', { name: 'escape' })
        expect(close).toHaveBeenCalled()
        expect(callback).toMatchSnapshot()
    })
})
