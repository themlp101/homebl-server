const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const AddressServices = require('./address-services')
const path = require('path')

const addressRouter = express.Router()
/**
 * prepare request body
 */
const jsonParser = express.json()
/**
 * Checks if address exists, if it does return a response error message
 * @param {promise} req - using params from the HTTP request url
 * @param {promise} res - HTTP response body
 * @callback next - calls next middleware
 */
const checkIfAddressExists = async (req, res, next) => {
	try {
		const { address_id } = req.params
		const address = await AddressServices.getAddressById(
			req.app.get('db'),
			address_id
		)
		if (!address)
			/**
			 * if address does not exist, return a response error message
			 */
			return res.status(404).send({
				error: `Address with id:${address_id} not found`,
			})
		/**
		 * add address to the response body if address exists
		 * call next route
		 */
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
			/**
			 * destructure id from the request body
			 * passed from requireAuth middleware
			 */
			const { id } = req.user
			/**
			 * retrieve all addresses that match with user id
			 */
			const addresses = await AddressServices.getAddress(
				req.app.get('db'),
				id
			)
			/**
			 * return 200 response and the addresses
			 */
			res.json(addresses)
		} catch (error) {
			next(error)
		}
	})
	.post(jsonParser, async (req, res, next) => {
		try {
			/**
			 * destructure request body
			 * and create a new address from the request fields
			 *
			 * currently address_2 and address_3 are not used in the database, default [null]
			 */
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
			/**
			 * verify all required fields are not empty
			 */
			for (const [key, value] of Object.entries(newAddress))
				if (value === null || value === undefined)
					return res.status(400).json({
						error: `Missing "${key}" in request body`,
					})

			/**
			 * add user_id to the new address object
			 */
			newAddress.user_id = req.user.id
			/**
			 * if address_2 or address_3 are present add to the object as well
			 */
			if (address_2 || address_3) {
				newAddress.address_2 = address_2
				newAddress.address_3 = address_3
			}
			/**
			 * insert new address into the database
			 */
			const postedAddress = await AddressServices.postAddress(
				req.app.get('db'),
				newAddress
			)
			/**
			 * return 'created' response
			 * the location and the new address from the database
			 * {id, address_1, address_2, address_3, city, state, zip_code, user_id}
			 */
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
	.delete(async (req, res, next) => {
		try {
			/**
			 * destructure address_id from request url params
			 */
			const { address_id } = req.params
			/**
			 * delete the address in the database
			 */
			await AddressServices.deleteAddress(
				req.app.get('db'),
				address_id
			)
			/**
			 * return 'no content'
			 */
			res.status(204).send()
		} catch (error) {
			next(error.message)
		}
	})
	.patch(jsonParser, async (req, res, next) => {
		try {
			/**
			 * destructure request body and create new address feilds
			 */
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
			/**
			 * update database address with new address fields
			 */
			await AddressServices.patchAddress(
				req.app.get('db'),
				address_id,
				newFields
			)
			/**
			 * return 'no content'
			 */
			res.status(204).end()
		} catch (error) {
			next(error.message)
		}
	})

addressRouter
	.route(`/:address_id/notes/`)
	.all(requireAuth)
	.all(checkIfAddressExists)
	.get(async (req, res, next) => {
		try {
			/**
			 * destructure id from the request body
			 */
			const { address_id } = req.params

			/**
			 * retrieve the notes from the database that have matching address_id
			 */
			const notes = await AddressServices.getNotes(
				req.app.get('db'),
				address_id
			)
			/**
			 * return 'ok' response and the notes
			 */
			res.json(notes)
		} catch (error) {
			next(error)
		}
	})
	.post(async (req, res, next) => {
		try {
			/**
			 * destructure content from the request body
			 * set up address_id variable from the response address passed from check middleware
			 */
			const address_id = res.address.id
			const { content } = req.body
			/**
			 * verify content is not blank
			 */
			if (
				content === null ||
				content === undefined ||
				content === ''
			)
				/**
				 * if content field is empty return a response error message
				 */
				return res
					.status(400)
					.json({ error: `Content is required` })

			const newNote = { content, address_id }
			/**
			 * insert new note into the database
			 */
			const postedNote = await AddressServices.postNote(
				req.app.get('db'),
				newNote
			)
			/**
			 * return 'created', the location and the new note
			 */
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
