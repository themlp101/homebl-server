const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const AddressServices = require('../addresses/address-services')

const notesRouter = express.Router()
const jsonParser = express.json()

const checkIfAddressExists = async (req, res, next) => {
	try {
		const { note_id } = req.params
		const note = await AddressServices.getNoteById(
			req.app.get('db'),
			note_id
		)
		if (!note)
			return res.status(404).send({
				error: `Note with id:${note_id} not found`,
			})
		res.note = note
		next()
	} catch (error) {
		next(error)
	}
}
notesRouter
	.route(`/:note_id`)
	.all(requireAuth)
	.all(checkIfAddressExists)
	.get((req, res, next) => {
		res.json(res.note)
	})
	.delete(async (req, res, next) => {
		try {
			const { note_id } = req.params
			await AddressServices.deleteNote(
				req.app.get('db'),
				note_id
			)

			res.status(204).send()
		} catch (error) {
			next(error.message)
		}
	})
	.patch(jsonParser, async (req, res, next) => {
		const { note_id } = req.params
		const { content } = req.body
		const newFields = { content }
		if (!content || content.trim().startsWith(' '))
			return res.status(400).json({ error: `Content required` })

		await AddressServices.patchNote(
			req.app.get('db'),
			note_id,
			newFields
		)
		res.sendStatus(204)
	})

module.exports = notesRouter
