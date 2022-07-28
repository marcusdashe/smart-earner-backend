const errorResponder = (err, req, res, next) => {
    res.header("Content-Type", 'application/json')
    res.status(err.statusCode).send(JSON.stringify(err, null, 4)) // pretty print
  }

  module.exports = errorResponder