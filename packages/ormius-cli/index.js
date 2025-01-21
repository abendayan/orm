#!/usr/bin/env node

import arg from 'arg'
import { runMigration } from './cli/runMigration'
import { generateModel } from './cli/buildModel'

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
