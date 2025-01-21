import { Orm } from '../lib/ormius'
import fs from 'fs'
import mysql from 'mysql'

jest.mock('fs')
jest.mock('mysql')

describe('Orm Class', () => {
    let mockConnection

    beforeEach(() => {
        // Mock the MySQL connection object
        mockConnection = {
            connect: jest.fn((callback) => callback(null)),
            end: jest.fn(),
            threadId: 12345
        }
        mysql.createConnection = jest.fn(() => mockConnection)

        // Mock fs readFileSync
        fs.readFileSync.mockImplementation((path) => {
            if (path === 'validConfig.json') {
                return JSON.stringify({
                    host: 'localhost',
                    user: 'root',
                    password: 'password',
                    database: 'test_db'
                })
            }
            throw new Error('File not found')
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('should throw an error if configFile is not provided', () => {
        expect(() => new Orm()).toThrow('The config file is required')
    })

    test('should read the configuration file and create a MySQL connection', () => {
        new Orm('validConfig.json')

        expect(fs.readFileSync).toHaveBeenCalledWith('validConfig.json', 'utf8')
        expect(mysql.createConnection).toHaveBeenCalledWith({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'test_db'
        })
        expect(mockConnection.connect).toHaveBeenCalled()
    })

    test('should not connect if deferConnection is true', () => {
        new Orm('validConfig.json', { deferConnection: true })

        expect(fs.readFileSync).toHaveBeenCalledWith('validConfig.json', 'utf8')
        expect(mysql.createConnection).toHaveBeenCalled()
        expect(mockConnection.connect).not.toHaveBeenCalled()
    })

    test('should throw an error if MySQL connection fails', () => {
        mockConnection.connect.mockImplementationOnce((callback) =>
            callback(new Error('Connection error'))
        )

        expect(() => new Orm('validConfig.json')).toThrow('Connection error')
    })

    test('should log connection thread ID on successful connection', () => {
        console.log = jest.fn()
        new Orm('validConfig.json')
        expect(console.log).toHaveBeenCalledWith('connected as id 12345')
    })

    test('should close the connection when close() is called', () => {
        const orm = new Orm('validConfig.json')

        orm.close()
        expect(mockConnection.end).toHaveBeenCalled()
    })
})
