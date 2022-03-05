#!/usr/bin/env node

const arg = require('arg')
const { runMigration } = require('./cli/runMigration')
const { generateModel } = require('./cli/buildModel')

const args = arg({
    // Types
    '--help': Boolean,
    '--run': Boolean,
    '--config': String,
    '--generate': String,

    // Aliases
    '-g': '--generate',
    '-c': '--config',
    '-r': '--run'
})

const newModelName = args['--generate']

if (newModelName) {
    generateModel(newModelName)
}

if (args['--run']) {
    const configArg = args['--config']

    runMigration(configArg)
}
