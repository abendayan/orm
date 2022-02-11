function buildModel(modelName, connection) {
  const findBy = async (column, condition, selectFields) => {
    return new Promise(function(resolve, reject) {
      connection.query('SELECT * FROM ?? WHERE ??=?', [modelName, column, condition], function (error, results, fields) {
        if (error) {
          reject(error)
        }
        resolve(results[0])
      })
    })
  }
  return ({
    findBy: findBy
  })
}

module.exports = {
  buildModel
}