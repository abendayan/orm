import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default [...compat.extends('eslint:recommended'), {
    languageOptions: {
        globals: {
            ...globals.commonjs,
            ...globals.node,
            ...globals.jest
        },

        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        indent: ['error', 4, {
            SwitchCase: 1
        }],

        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'comma-dangle': ['error'],
        'no-debugger': ['error'],

        'key-spacing': ['error', {
            beforeColon: false,
            afterColon: true
        }],

        'no-multiple-empty-lines': ['error', {
            max: 2,
            maxEOF: 1
        }],

        'no-trailing-spaces': ['error', {
            skipBlankLines: true
        }],

        'spaced-comment': ['error', 'always'],
        'no-var': ['error'],
        'no-constant-condition': ['error'],
        'no-control-regex': ['error'],
        'no-dupe-keys': ['error'],
        'no-duplicate-case': ['error'],
        'no-empty-character-class': ['error'],
        'no-empty': ['error'],
        'no-extra-boolean-cast': ['error'],
        'no-extra-semi': ['error'],
        'no-func-assign': ['error'],
        'no-inner-declarations': ['error'],
        'no-invalid-regexp': ['error'],
        'no-irregular-whitespace': ['error'],
        'no-negated-in-lhs': ['error'],
        'no-unreachable': ['error'],
        'use-isnan': ['error'],
        'valid-typeof': ['error'],
        'accessor-pairs': ['error'],
        'block-scoped-var': ['error'],
        curly: ['error'],
        'dot-notation': ['error'],
        'default-case': ['error'],
        'dot-location': ['error', 'property'],
        'block-spacing': ['error', 'always'],

        'brace-style': ['error', '1tbs', {
            allowSingleLine: false
        }],

        'no-new-require': ['error'],
        'array-bracket-spacing': ['error', 'never'],

        camelcase: ['error', {
            properties: 'always'
        }],

        'comma-spacing': ['error', {
            before: false,
            after: true
        }],

        'comma-style': ['error', 'last'],
        'computed-property-spacing': ['error', 'never'],
        'consistent-this': ['error', 'self'],
        'eol-last': ['error'],
        'func-style': ['error', 'expression'],
        'new-cap': ['error'],
        'new-parens': ['error'],
        'newline-after-var': ['error', 'always'],
        'no-array-constructor': ['error'],
        'no-bitwise': ['error'],
        'no-continue': ['error'],
        'no-lonely-if': ['error'],
        'no-mixed-spaces-and-tabs': ['error'],
        'no-nested-ternary': ['error'],
        'no-new-object': ['error'],
        'no-spaced-func': ['error'],
        'no-unneeded-ternary': ['error'],
        'object-curly-spacing': ['error', 'always'],
        'operator-linebreak': ['error', 'after'],
        'quote-props': ['error', 'as-needed'],

        'keyword-spacing': ['error', {
            before: true,
            after: true
        }],

        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', 'never'],
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': ['error'],

        'space-unary-ops': ['error', {
            words: true,
            nonwords: false
        }],

        'arrow-parens': ['error', 'always'],
        'arrow-spacing': ['error'],
        'constructor-super': ['error'],

        'generator-star-spacing': ['error', {
            before: true,
            after: false
        }],

        'no-confusing-arrow': ['error'],
        'no-class-assign': ['error'],
        'no-const-assign': ['error'],
        'no-dupe-class-members': ['error'],
        'no-this-before-super': ['error'],
        'prefer-arrow-callback': ['warn'],
        'prefer-spread': ['error'],
        'prefer-template': ['error'],
        'require-yield': ['error']
    }
}]
