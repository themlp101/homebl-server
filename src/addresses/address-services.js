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
}

module.exports = AddressServices
