const express = require('express')
const AuthService = require('./auth-service')
const path = require('path')
const { hashPassword } = require('./auth-service')
// const AuthService = require('./auth-service')

const usersRouter = express.Router()
const jsonParser = express.json()

usersRouter.route('/').post(jsonParser, async (req, res, next) => {
	try {
		const { user_name, full_name, password } = req.body
		const newUser = {
			user_name,
			password,
			full_name,
			logged_in: new Date(),
		}

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

		const userExist = await AuthService.doesUserExist(
			req.app.get('db'),
			user_name
		)
		if (userExist)
			return res
				.status(400)
				.json({ error: `Username already taken` })

		const hashedPassword = await AuthService.hashPassword(
			password
		)

		newUser.password = hashedPassword
		const createdUser = await AuthService.insertUser(
			req.app.get('db'),
			newUser
		)
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
