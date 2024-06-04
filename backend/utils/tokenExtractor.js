const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    const formattedToken = authorization.replace('Bearer ', '')
    request.token = formattedToken
  }
  next()
}

module.exports = tokenExtractor