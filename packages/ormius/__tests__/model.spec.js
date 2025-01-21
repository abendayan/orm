import { Model } from '../lib/model'
import { Query } from '../lib/query'

jest.mock('../lib/query') // Mock the Query class

describe('Model Class', () => {
    let model
    let mockQueryInstance
    const modelName = 'test_model'
    const modelSchema = { id: 'number', name: 'string' }
    const initialValues = { id: 1, name: 'Test' }

    beforeEach(() => {
        mockQueryInstance = {
            findBy: jest.fn(),
            where: jest.fn(),
            updateBy: jest.fn(),
            select: jest.fn(),
            create: jest.fn(),
            execute: jest.fn().mockResolvedValue([]),
            clean: jest.fn()
        }
        Query.mockImplementation(() => mockQueryInstance)

        model = new Model(modelName, modelSchema, { connection: {} }, initialValues)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('should initialize with correct values', () => {
        expect(model.modelName).toBe(modelName)
        expect(model.values).toEqual(initialValues)
        expect(Query).toHaveBeenCalledWith(modelName, {}, modelSchema)
    })

    test('setValues should update the values', () => {
        const newValues = { id: 2, name: 'Updated Test' }

        model.setValues(newValues)
        expect(model.values).toEqual(newValues)
    })

    test('findBy should call Query.findBy with correct arguments and return the model', () => {
        model.findBy('name', 'Test')
        expect(mockQueryInstance.findBy).toHaveBeenCalledWith('name', 'Test')
        expect(model).toBeInstanceOf(Model)
    })

    test('where should call Query.where with correct arguments and return the model', () => {
        model.where('id', 1)
        expect(mockQueryInstance.where).toHaveBeenCalledWith('id', 1)
        expect(model).toBeInstanceOf(Model)
    })

    test('updateBy should call Query.updateBy with correct arguments and return the model', () => {
        const newValues = { name: 'Updated Test' }

        model.updateBy(newValues)
        expect(mockQueryInstance.updateBy).toHaveBeenCalledWith(initialValues, newValues)
        expect(model).toBeInstanceOf(Model)
    })

    test('select should call Query.select with correct arguments and return the model', () => {
        const fields = ['id', 'name']

        model.select(fields)
        expect(mockQueryInstance.select).toHaveBeenCalledWith(fields)
        expect(model).toBeInstanceOf(Model)
    })

    test('create should call Query.create with correct arguments and return the model', () => {
        const fields = { id: 3, name: 'New Record' }

        model.create(fields)
        expect(mockQueryInstance.create).toHaveBeenCalledWith(fields)
        expect(model).toBeInstanceOf(Model)
    })

    test('execute should call Query.execute and return mapped results for arrays', async() => {
        const resultData = [{ id: 4, name: 'Result 1' }, { id: 5, name: 'Result 2' }]

        mockQueryInstance.execute.mockResolvedValue(resultData)

        const results = await model.execute()

        expect(mockQueryInstance.execute).toHaveBeenCalled()
        expect(mockQueryInstance.clean).toHaveBeenCalled()
        expect(results).toHaveLength(resultData.length)
        expect(results[0]).toBeInstanceOf(Model)
        expect(results[0].values).toEqual(resultData[0])
    })

    test('execute should call Query.execute and return the model for single result', async() => {
        const singleResult = { id: 6, name: 'Single Result' }

        mockQueryInstance.execute.mockResolvedValue(singleResult)

        const result = await model.execute()

        expect(mockQueryInstance.execute).toHaveBeenCalled()
        expect(mockQueryInstance.clean).toHaveBeenCalled()
        expect(result).toBeInstanceOf(Model)
        expect(result.values).toEqual(singleResult)
    })
})
