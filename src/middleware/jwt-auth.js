const AuthService = require('../auth/auth-service')
/**
 * Basic jwt authentication middleware
 * Retrieves authToken from the HTTP 'Authorization' header
 * @param {promise} req - HTTP request header
 * @param {promise} res - HTTP response
 * @callback next - calls next route
 */
function requireAuth(req, res, next) {
	const authToken = req.get('Authorization') || ''
	/**
	 * Parses bearer token 'bearer <encrypted token>'
	 */
	let bearerToken
	if (!authToken.toLowerCase().startsWith('bearer ')) {
		return res.status(401).json({ error: `Missing bearer token` })
	} else {
		bearerToken = authToken.slice(7, authToken.length)
	}

	try {
		/**
		 * Verify bearer token
		 * @param {object} payload - {algorithm, sub}
		 */
		const payload = AuthService.verifyJwt(bearerToken)
		/**
		 * Queries database to find the user with the same user_name as
		 * the payload subject
		 */
		AuthService.getUser(req.app.get('db'), payload.sub)
			.then((user) => {
				if (!user)
					/**
					 * if no user is found return response error message
					 */
					return res
						.status(401)
						.json({ error: `Unauthorized request` })
				/**
				 * return the request and add the found user
				 * to use in next route
				 */
				req.user = user
				next()
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error(err)
				next(err)
			})
	} catch (error) {
		res.status(401).json({ error: `Unauthorized request` })
	}
}

module.exports = {
	requireAuth,
}
