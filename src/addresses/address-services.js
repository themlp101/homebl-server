/**
 * Database services for the /address routes
 */
const AddressServices = {
	/**
	 * use database connection and user_id
	 * return the user
	 * returns and empty pbject of no user is found
	 */
	getAddress: (db, user_id) => {
		return db('homebl_addresses').select().where({ user_id })
	},
	/**
	 * retirves address by id
	 * @param {number} id - table sequence number
	 */
	getAddressById: (db, id) => {
		return db('homebl_addresses').select().where({ id }).first()
	},
	/**
	 * retrives all the notes from the database
	 * notes table has a relationship with the address table
	 * pass in the address_id
	 */
	getNotes: (db, address_id) => {
		return db('homebl_notes').select().where({ address_id })
	},
	/**
	 * retrieves a specific note
	 * @param {number} id - database sequence number
	 */
	getNoteById: (db, id) => {
		return db('homebl_notes').where({ id }).first()
	},
	/**
	 * inserts new address into address table
	 * @param {object} newAddress - {address_1, address_2, address_3, city, state, zip_code, user_id}
	 * returns the new address from the database
	 */
	postAddress: (db, newAddress) => {
		return db('homebl_addresses')
			.insert(newAddress)
			.returning('*')
			.then(([address]) => address)
			.then((address) =>
				AddressServices.getAddressById(db, address.id)
			)
	},
	/**
	 * inserts notes into the database
	 * @param {object} newNote - {content, address_id}
	 * returns the new note from the databse {content, id, address_id}
	 */
	postNote: (db, newNote) => {
		return db('homebl_notes')
			.insert(newNote)
			.returning('*')
			.then(([note]) => note)
			.then((note) => AddressServices.getNoteById(db, note.id))
	},
	/**
	 * patches note in the database
	 * @param {object} newFields - {content}
	 */
	patchNote: (db, id, newFields) => {
		return db('homebl_notes').where({ id }).update(newFields)
	},
	/**
	 * deletes the address in the database
	 * @param {number} id - database sequence number
	 */
	deleteAddress: (db, id) => {
		return db('homebl_addresses').where({ id }).delete()
	},
	/**
	 * updates the address in the database
	 * @param {number} id - database sequence number
	 */
	patchAddress: (db, id, newFields) => {
		return db('homebl_addresses').where({ id }).update(newFields)
	},
	/**
	 * deletes note from the databse
	 * @param {number} id - database sequence number
	 */
	deleteNote: (db, id) => {
		return db('homebl_notes').where({ id }).delete()
	},
}

module.exports = AddressServices
