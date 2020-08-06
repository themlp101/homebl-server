/* eslint-disable eqeqeq */
const express = require('express')
const AuthService = require('./auth-service')
const path = require('path')

const usersRouter = express.Router()
/**
 * set up json parser to parse request body into an object
 */
const jsonParser = express.json()

usersRouter.route('/').post(jsonParser, async (req, res, next) => {
	try {
		/**
		 * Destructure request body and create a new user
		 */
		const { user_name, full_name, password } = req.body
		const newUser = {
			user_name,
			password,
			full_name,
			logged_in: new Date(),
		}
		/**
		 * Checks if keys are appropriate or if missing
		 */

		for (const [key, value] of Object.entries(newUser))
			if (value == null)
				return res.status(400).json({
					error: `Missing "${key}" in request body`,
				})
		if (password.length < 5)
			return res.status(400).json({
				error: `Password must be longer than 5 characters`,
			})
		if (password.length > 72)
			return res.status(400).json({
				error: `Password must be less than 72 characters`,
			})
		if (password.startsWith(' ') || password.endsWith(' '))
			return res.status(400).send({
				error: `Password must not begin or end with a blank space`,
			})
		/**
		 * verify the user_name is not already taken
		 */
		const userExist = await AuthService.doesUserExist(
			req.app.get('db'),
			user_name
		)
		if (userExist)
			/**
			 * if user exists then return response error
			 */
			return res
				.status(400)
				.json({ error: `Username already taken` })
		/**
		 * encrypt password
		 */
		const hashedPassword = await AuthService.hashPassword(
			password
		)
		/**
		 * Update new user's password to the hashed password
		 */
		newUser.password = hashedPassword
		/**
		 * insert user into user database table
		 */
		const createdUser = await AuthService.insertUser(
			req.app.get('db'),
			newUser
		)
		/**
		 * return 'created' response, the location of the user and the new user
		 */
		res.status(201)
			.location(
				path.posix.join(req.originalUrl, `/${createdUser.id}`)
			)
			.json(AuthService.serializeUser(createdUser))
	} catch (error) {
		next(error.message)
	}
})

module.exports = usersRouter
