const readline = require('readline')
const { TYPES } = require('../index')
const { RELATION_TYPES } = require('../lib/types')
const input = process.stdin
const output = process.stdout

const rl = readline.createInterface({
    input: input,
    output: output,
    prompt: '> '
})
const selectOption = {}

selectOption.selectIndex = 0
selectOption.options = Object.values(TYPES).filter(value => !RELATION_TYPES.includes(value))
selectOption.selector = '*'
selectOption.selects = []
selectOption.inSelectType = true

const askForName = type => {
    rl.question(`Type name for entry of type ${type}> `, function(line) {
        selectOption.selects[selectOption.selects.length - 1]['name'] = line
        selectOption.inSelectType = true
        input.setRawMode(true)
        input.resume()
        selectOption.selectIndex = 0
        selectOption.createOptionMenu()
    })
}

const keyPressedHandler = (_, key) => {
    if (key && selectOption.inSelectType) {
        const optionLength = selectOption.options.length - 1
        if ( key.name === 'down' && selectOption.selectIndex < optionLength) {
            selectOption.selectIndex += 1
            selectOption.createOptionMenu()
        }
        else if (key.name === 'up' && selectOption.selectIndex > 0 ) {
            selectOption.selectIndex -= 1
            selectOption.createOptionMenu()
        }
        else if (key.name === 'return') {
            selectOption.inSelectType = false
            selectOption.selects.push({ type: selectOption.options[selectOption.selectIndex] })
            console.clear()
            input.setRawMode(false)
            askForName(selectOption.options[selectOption.selectIndex])
        }
        else if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) {
            selectOption.callback(selectOption.selects)
            selectOption.close()
        }
    }
}

const ansiColors = (text, color) => {
    const colors = {
        'green': 32,
        'blue': 34,
        'yellow': 33
    }
    if (colors[color]) `\x1b[${colors[color]}m${text}\x1b[0m`
    //default for colors not included
    return `\x1b[32m${text}\x1b[0m`
}

selectOption.init = callback => {
    selectOption.callback = callback

    readline.emitKeypressEvents(input)
    selectOption.start()
}

selectOption.start = () => {
    //setup the input for reading
    input.setRawMode(true)
    input.resume()
    input.on('keypress', keyPressedHandler)

    if (selectOption.selectIndex >= 0) {
        selectOption.createOptionMenu()
    }
}

selectOption.close = () => {
    input.setRawMode(false)
    input.pause()
    process.exit(0)
}

selectOption.getPadding = (num = 10) => {
    let text = ' '
    for (let i = 0; i < num.length; i++) {
        text += ' '
    }
    return text
}

selectOption.createOptionMenu = () => {
    output.write("\u001b[3J\u001b[2J\u001b[1J")
    console.clear()
    const question = 'Choose type'
    console.log(question)
    const optionLength = selectOption.options.length
    const padding = selectOption.getPadding(20)
    const cursorColor = ansiColors(selectOption.selector, 'green')

    for (let i = 0; i < optionLength; i++) {
        const selectedOption = i === selectOption.selectIndex
          ? `${cursorColor} ${selectOption.options[i]}`
          : selectOption.options[i]
        const ending = i !== optionLength-1 ? '\n' : ''
        output.write(padding + selectedOption + ending)
    }
}

module.exports = {
    selectOption
}