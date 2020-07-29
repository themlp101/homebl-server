const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const AuthService = require('../auth/auth-service')
const AddressServices = require('./address-services')
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
			next()
		} catch (error) {
			next(error.message)
		}
	})

addressRouter
	.route(`/:address_id`)
	.all(requireAuth)
	.all(checkIfAddressExists)
	.get((req, res, next) => {
		res.json(res.address)
		next()
	})
	.delete(async (req, res, next) => {
		try {
			const { address_id } = req.params
			await AddressServices.deleteAddress(
				req.app.get('db'),
				address_id
			)

			res.status(204)
			next()
		} catch (error) {
			next(error.message)
		}
	})
	.patch(async (req, res, next) => {
		const {
			address_1,
			address_2,
			address_3,
			city,
			state,
			zip_code,
		} = req.body
		const { address_id } = req.params
		const newFields = {
			address_1,
			address_2,
			address_3,
			city,
			state,
			zip_code,
		}
		const response = await AddressServices.patchAddress(
			req.app.get('db'),
			address_id,
			newFields
		)

		res.status(201).json(response)
		next()
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
			next()
		} catch (error) {
			next(error)
		}
	})
	.post(async (req, res, next) => {
		try {
			const address_id = res.address.id
			const { content } = req.body

			if (
				content === null ||
				content === undefined ||
				content === ''
			)
				return res
					.status(400)
					.json({ error: `Content is required` })

			const newNote = { content, address_id }
			const postedNote = await AddressServices.postNote(
				req.app.get('db'),
				newNote
			)
			res.status(201)
				.location(
					path.posix.join(
						req.originalUrl,
						`/${postedNote.id}`
					)
				)
				.json(postedNote)
		} catch (error) {
			next(error.message)
		}
	})

module.exports = addressRouter
