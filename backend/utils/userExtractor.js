const jwt = require('jsonwebtoken')

const userExtractor = async (request, response, next) => {
  if (request.token === undefined) {
    return response.status(401).json({ error: 'Authorization header missing' })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  request.user = decodedToken.id
  
  next()
}

module.exports = userExtractor