const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
	return [
		{
			id: 1,
			user_name: 'matty',
			full_name: 'Matt Patterson',
			password: 'password1234',
			logged_in: new Date('2020-07-27T16:00:00.00'),
		},
		{
			id: 2,
			user_name: 'test_user1',
			full_name: 'Test User 1',
			password: 'test-password',
			logged_in: new Date('2020-07-27T16:00:00.00'),
		},
		{
			id: 3,
			user_name: 'test_user2',
			full_name: 'Test User 2',
			password: 'test-password',
		},
	]
}
function makeAddressesArray() {
	return [
		{
			id: 1,
			address_1: '123 Main Street',
			address_2: null,
			address_3: null,
			city: 'Denver',
			state: 'CO',
			zip_code: '80014',
			user_id: 1,
		},
		{
			id: 2,
			address_1: '58 Lucas Street',
			address_2: null,
			address_3: null,
			city: 'Denver',
			state: 'CO',
			zip_code: '80019',
			user_id: 1,
		},
		{
			id: 2,
			address_1: '1625 Cedar Brook Avenue',
			address_2: null,
			address_3: null,
			city: 'Denver',
			state: 'CO',
			zip_code: '80019',
			user_id: 2,
		},
		{
			id: 3,
			address_1: '452 Amelia Lane',
			address_2: null,
			address_3: null,
			city: 'Denver',
			state: 'CO',
			zip_code: '80019',
			user_id: 3,
		},
	]
}
function makeExpectedAddress(users, address, notes = []) {
	const user = users.find((user) => user.id === address.user_id)
	const numOfNotes = notes.filter(
		(note) => note.address_id === address.id
	).length
	const {
		id,
		address_1,
		address_2,
		address_3,
		city,
		state,
		zip_code,
		user_id,
	} = address
	return {
		id,
		address_1,
		address_2,
		address_3,
		city,
		state,
		zip_code,
		user_id,
	}
}
function makeNotesArray() {
	return [
		{
			id: 1,
			content:
				'Check schedule to view, I love the backyard for the kids',
			address_id: 1,
		},
		{
			id: 2,
			content: 'See this today -- check with realtor Bob',
			address_id: 1,
		},
		{
			id: 3,
			content: 'Interested if prices was lower',
			address_id: 2,
		},
		{
			id: 4,
			content: 'I need to find out if my furniture will fit!',
			address_id: 3,
		},
	]
}
function makeExpectedNotes(addressID, notes) {
	const expectedNotes = notes.filter(
		(note) => note.address_id === addressID
	)
	return expectedNotes.map((note) => ({
		id: note.id,
		content: note.content,
		address_id: note.address_id,
	}))
}
function cleanTables(db) {
	return db.transaction((transaction) =>
		transaction.raw(
			`TRUNCATE homebl_notes, homebl_addresses, homebl_users
        RESTART IDENTITY CASCADE`
		)
	)
}
function seedUsers(db, users) {
	const preppedUser = users.map((user) => ({
		...user,
		password: bcrypt.hashSync(user.password, 1),
	}))
	return db('homebl_users')
		.insert(preppedUser)
		.then(() =>
			db.raw(`SELECT setval('homebl_users_id_seq', ?)`, [
				users[users.length - 1].id,
			])
		)
}
function seedAddressesTable(db, users, addresses, notes = []) {
	return db.transaction(async (trx) => {
		await seedUsers(trx, users)
		await trx.into('homebl_addresses').insert(addresses)
		await trx.raw(`SELECT setval('homebl_addresses_iq_seq', ?)`, [
			addresses[addresses.length - 1].id,
		])

		if (notes.length) {
			await trx.into('homebl_notes').insert(notes)
			await trx.raw(`SELECT setval ('homebl_notes_id_seq',?)`, [
				notes[notes.length - 1].id,
			])
		}
	})
}
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
	const token = jwt.sign({ user_id: `${user.id}` }, secret, {
		subject: user.user_name,
		algorithm: 'HS256',
	})

	return `Bearer ${token}`
}
function exMachinaFictures() {
	const testUsers = makeUsersArray()
	const testAddress = makeAddressesArray()
	const testNotes = makeNotesArray()
	return { testUsers, testAddress, testNotes }
}

module.exports = {
	makeUsersArray,
	makeAddressesArray,
	makeExpectedAddress,
	makeNotesArray,
	makeExpectedNotes,

	cleanTables,
	seedUsers,
	seedAddressesTable,

	makeAuthHeader,
	exMachinaFictures,
}
