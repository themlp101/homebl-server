/* eslint-disable eqeqeq */
const express = require('express')
const AuthService = require('./auth-service')

const authRouter = express.Router()
/**
 * prepare request body
 */
const jsonParser = express.json()

authRouter.post(`/login`, jsonParser, async (req, res, next) => {
	try {
		/**
		 * destructure request body and create log in user variable
		 */
		const { user_name, password } = req.body
		const loginUser = { user_name, password }
		/**
		 * if fields are left blank, send an error
		 */
		for (const [key, value] of Object.entries(loginUser))
			if (value == null)
				return res.status(400).json({
					error: `Missing "${key}" in request body`,
				})

		/**
		 * check if user exists
		 */

		const user = await AuthService.getUser(
			req.app.get('db'),
			user_name
		)
		if (!user)
			/**
			 * if no user is found, send an response error message
			 */
			return res
				.status(400)
				.json({ error: `Incorrect username or password` })
		/**
		 * verify password matches the encrypted password in the database
		 */
		const compareMatch = await AuthService.comparePasswords(
			loginUser.password,
			user.password
		)

		if (!compareMatch)
			/**
			 * if the passwords do not match, send a response error message
			 */
			return res
				.status(400)
				.json({ error: `Incorrect username or password` })

		const sub = user.user_name
		const payload = { user_id: user.id }
		/**
		 * after verifications
		 * return {authToken: authToken} as response
		 * the front-end will save the token in the browser
		 */
		return res.send({
			authToken: AuthService.createJwt(sub, payload),
		})
	} catch (error) {
		next(error)
	}
})

module.exports = authRouter
