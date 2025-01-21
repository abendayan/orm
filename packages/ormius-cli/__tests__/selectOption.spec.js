import readline from 'readline'
import { selectOption, handleLine, keyPressedHandler, ansiColors } from '../cli/selectOption'
jest.mock('readline', () => ({
    createInterface: jest.fn(() => ({
        question: jest.fn(),
        close: jest.fn(),
    })),
    emitKeypressEvents: jest.fn(),
}))

const mockInput = {
    setRawMode: jest.fn(),
    resume: jest.fn(),
    pause: jest.fn(),
    on: jest.fn(),
}

const mockOutput = {
    write: jest.fn(),
}

describe('selectOption', () => {
    beforeAll(() => {
        // Mock process.stdin and stdout
        global.process.stdin = mockInput
        global.process.stdout = mockOutput
    })

    beforeEach(() => {
        jest.clearAllMocks()
        selectOption.selects = []
        selectOption.selectIndex = 0
        selectOption.inSelectType = true
    })

    test('ansiColors should format text with correct color codes', () => {
        expect(ansiColors('Hello', 'green')).toBe('\x1b[32mHello\x1b[0m')
        expect(ansiColors('World', 'blue')).toBe('\x1b[34mWorld\x1b[0m')
        expect(ansiColors('Yellow', 'yellow')).toBe('\x1b[33mYellow\x1b[0m')
    })

    test('handleLine should update selects and reset state', () => {
        selectOption.selects = [{ type: 'STRING' }]
        handleLine('name')

        expect(selectOption.selects).toEqual([{ type: 'STRING', name: 'name' }])
        expect(selectOption.inSelectType).toBe(true)
        expect(mockInput.setRawMode).toHaveBeenCalledWith(true)
        expect(mockInput.resume).toHaveBeenCalled()
    })

    test('keyPressedHandler should navigate and select options', () => {
        selectOption.options = ['STRING', 'NUMBER', 'BOOLEAN']
        selectOption.selectIndex = 0

        // Navigate down
        keyPressedHandler(null, { name: 'down' })
        expect(selectOption.selectIndex).toBe(1)

        // Navigate up
        keyPressedHandler(null, { name: 'up' })
        expect(selectOption.selectIndex).toBe(0)

        // Select an option (return key)
        const mockQuestion = jest.fn()
        readline.createInterface.mockReturnValueOnce({ question: mockQuestion })

        keyPressedHandler(null, { name: 'return' })
        expect(selectOption.inSelectType).toBe(false)
        expect(selectOption.selects).toEqual([{ type: 'STRING' }])
        expect(mockInput.setRawMode).toHaveBeenCalledWith(false)
        expect(mockQuestion).toHaveBeenCalled()
    })

    test('keyPressedHandler should exit on escape or Ctrl+C', () => {
        const mockCallback = jest.fn()
        selectOption.callback = mockCallback
        selectOption.close = jest.fn()

        keyPressedHandler(null, { name: 'escape' })
        expect(selectOption.callback).toHaveBeenCalled()
        expect(selectOption.close).toHaveBeenCalled()

        keyPressedHandler(null, { name: 'c', ctrl: true })
        expect(selectOption.callback).toHaveBeenCalledTimes(2)
        expect(selectOption.close).toHaveBeenCalledTimes(2)
    })

    test('createOptionMenu should display the menu', () => {
        selectOption.options = ['STRING', 'NUMBER', 'BOOLEAN']
        selectOption.selectIndex = 1

        selectOption.createOptionMenu()

        expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('Choose type'))
        expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('* STRING'))
        expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('* NUMBER'))
        expect(mockOutput.write).toHaveBeenCalledWith(expect.stringContaining('BOOLEAN'))
    })

    test('init should start the menu and set callback', () => {
        const mockCallback = jest.fn()
        selectOption.start = jest.fn()

        selectOption.init(mockCallback, 'TestModel')
        expect(selectOption.callback).toBe(mockCallback)
        expect(selectOption.modelName).toBe('TestModel')
        expect(readline.emitKeypressEvents).toHaveBeenCalledWith(mockInput)
        expect(selectOption.start).toHaveBeenCalled()
    })

    test('start should configure input and create menu', () => {
        selectOption.createOptionMenu = jest.fn()

        selectOption.start()
        expect(mockInput.setRawMode).toHaveBeenCalledWith(true)
        expect(mockInput.resume).toHaveBeenCalled()
        expect(mockInput.on).toHaveBeenCalledWith('keypress', keyPressedHandler)
        expect(selectOption.createOptionMenu).toHaveBeenCalled()
    })

    test('close should reset input and exit process', () => {
        jest.spyOn(process, 'exit').mockImplementation(() => {})
        selectOption.close()

        expect(mockInput.setRawMode).toHaveBeenCalledWith(false)
        expect(mockInput.pause).toHaveBeenCalled()
        expect(process.exit).toHaveBeenCalledWith(0)
    })
})