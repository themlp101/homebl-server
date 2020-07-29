const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const AuthService = require('../auth/auth-service')
const AddressServices = require('./address-services')
const authRouter = require('../auth/auth-router')
const path = require('path')
const addressRouter = express.Router()
const jsonParser = express.json()

const checkIfAddressExists = async (req, res, next) => {
	try {
		const { address_id } = req.params
		const address = await AddressServices.getAddressById(
			req.app.get('db'),
			address_id
		)
		if (!address)
			return res.status(404).send({
				error: `Address with id:${address_id} not found`,
			})
		res.address = address
		next()
	} catch (error) {
		next(error)
	}
}

addressRouter
	.route(`/`)
	.all(requireAuth)
	.get(async (req, res, next) => {
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
	.post(jsonParser, async (req, res, next) => {
		try {
			const {
				address_1,
				address_2,
				address_3,
				city,
				state,
				zip_code,
			} = req.body
			const newAddress = {
				address_1,
				city,
				state,
				zip_code,
			}
			for (const [key, value] of Object.entries(newAddress))
				if (value === null || value === undefined)
					return res.status(400).json({
						error: `Missing "${key}" in request body`,
					})

			newAddress.user_id = req.user.id
			if (address_2 || address_3) {
				newAddress.address_2 = address_2
				newAddress.address_3 = address_3
			}
			const postedAddress = await AddressServices.postAddress(
				req.app.get('db'),
				newAddress
			)
			res.status(201)
				.location(
					path.posix.join(
						req.originalUrl,
						`/${postedAddress.id}`
					)
				)
				.json(postedAddress)
		} catch (error) {
			next(error.message)
		}
	})

addressRouter
	.route(`/:address_id`)
	.all(requireAuth)
	.all(checkIfAddressExists)
	.get((req, res) => {
		res.json(res.address)
	})

addressRouter
	.route(`/:address_id/notes/`)
	.all(requireAuth)
	.all(checkIfAddressExists)
	.get(async (req, res, next) => {
		try {
			const { address_id } = req.params
			const notes = await AddressServices.getNotes(
				req.app.get('db'),
				address_id
			)
			res.json(notes)
		} catch (error) {
			next(error)
		}
	})
module.exports = addressRouter
