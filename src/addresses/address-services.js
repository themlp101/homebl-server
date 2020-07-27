const xss = require('xss')

const AddressServices = {
	getAddress(db, user_id) {
		return db('homebl_addresses').select().where({ user_id })
	},
}

module.exports = AddressServices
