const { Orm } = require('../index')
const path = require('path')
const { User } = require('./models/user/user')

const orm = new Orm(path.join(__dirname, 'config.json'))
const user = new User(orm)
user.findBy('account', 1).select(['email', 'id']).execute().then(success => {
    console.log('success', success.values)
}).catch(error => {
    console.log('error', error)
})