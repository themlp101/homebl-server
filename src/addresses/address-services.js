const xss = require('xss')

const AddressServices = {
	getAddress: (db, user_id) => {
		return db('homebl_addresses').select().where({ user_id })
	},
	getAddressById: (db, id) => {
		return db('homebl_addresses').select().where({ id }).first()
	},
	getNotes: (db, addressID) => {
		return db('homebl_notes')
			.select()
			.where('address_id', addressID)
	},
	getNoteById: (db, id) => {
		return db('homebl_notes').where({ id }).first()
	},
	postAddress: (db, newAddress) => {
		return db('homebl_addresses')
			.insert(newAddress)
			.returning('*')
			.then(([address]) => address)
			.then((address) =>
				AddressServices.getAddressById(db, address.id)
			)
	},
	postNote: (db, newNote) => {
		return db('homebl_notes')
			.insert(newNote)
			.returning('*')
			.then(([note]) => note)
			.then((note) => AddressServices.getNoteById(db, note.id))
	},
	deleteAddress: (db, id) => {
		return db('homebl_addresses').where({ id }).delete()
	},
	patchAddress: (db, id, newFields) => {
		return db('homebl_addresses').where({ id }).update(newFields)
	},
}

module.exports = AddressServices
