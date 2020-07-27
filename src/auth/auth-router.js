const express = require('express')
const AuthService = require('./auth-service')

const authRouter = express.Router()
const jsonParser = express.json()

authRouter.post(`/login`, jsonParser, async (req, res, next) => {
	try {
		const { user_name, password } = req.body
		const loginUser = { user_name, password }

		for (const [key, value] of Object.entries(loginUser))
			if (value == null)
				return res.status(400).json({
					error: `Missing "${key}" in request body`,
				})
		const user = await AuthService.getUser(
			req.app.get('db'),
			user_name
		)
		if (!user)
			return res
				.status(400)
				.json({ error: `Incorrect username or password` })

		const compareMatch = await AuthService.comparePasswords(
			loginUser.password,
			user.password
		)

		if (!compareMatch)
			return res
				.status(400)
				.json({ error: `Incorrect username or password` })

		const sub = user.user_name
		const payload = { user_id: user.id }
		return res.send({
			authToken: AuthService.createJwt(sub, payload),
		})
	} catch (error) {
		next(error)
	}
})

module.exports = authRouter
