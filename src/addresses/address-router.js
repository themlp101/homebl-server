const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const AuthService = require('../auth/auth-service')
const AddressServices = require('./address-services')
const authRouter = require('../auth/auth-router')

const addressRouter = express.Router()

addressRouter.route(`/`).get(requireAuth, async (req, res, next) => {
	try {
		const { id } = req.user
		await AuthService.getUser(req.app.get('db'), id)

		const addresses = await AddressServices.getAddress(
			req.app.get('db'),
			id
		)
		res.json(addresses)
	} catch (error) {
		next(error)
	}
})
module.exports = addressRouter
