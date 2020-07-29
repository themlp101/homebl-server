const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers/test-helpers')
const supertest = require('supertest')

describe('Addressess Endpoint', () => {
	let db

	const {
		testUsers,
		testAddresses,
		testNotes,
	} = helpers.exMachinaFictures()

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL,
		})
		app.set('db', db)
	})
	after('disconnect from db', () => db.destroy())

	before('cleanup', () => helpers.cleanTables(db))

	afterEach('cleanup', () => helpers.cleanTables(db))
	describe('GET /api/address', () => {
		context('Given No Addresses', () => {
			beforeEach(() => helpers.seedUsers(db, testUsers))
			it('should respond 200 and an empty array ', () => {
				return supertest(app)
					.get(`/api/address`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(200, [])
			})
		})

		context('Given there are addresses in the database', () => {
			beforeEach('insert articles', () =>
				helpers.seedAddressesTable(
					db,
					testUsers,
					testAddresses,
					testNotes
				)
			)
			it('should respond 200 and all the addresses for the user ', () => {
				const { id } = testUsers[0]
				const expectedAddresses = helpers.makeExpectedAddresses(
					id,
					testAddresses
				)
				return supertest(app)
					.get(`/api/address`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(200, expectedAddresses)
			})
		})
	})
	describe('GET /api/address/:address_id', () => {
		context('Given no addresses', () => {
			beforeEach(() => {
				helpers.seedUsers(db, testUsers)
			})
			it('should respond with 404 "Address does not exist"', () => {
				const address_id = 99099
				return supertest(app)
					.get(`/api/address/${address_id}`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(404, {
						error: `Address with id:${address_id} not found`,
					})
			})
		})
		describe('Given addresses in the database', () => {
			beforeEach('insert addresses', () =>
				helpers.seedAddressesTable(
					db,
					testUsers,
					testAddresses,
					testNotes
				)
			)
			it('should respond with 404 "Address does not exist"', () => {
				const address_id = 99099
				return supertest(app)
					.get(`/api/address/${address_id}`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(404, {
						error: `Address with id:${address_id} not found`,
					})
			})
			it('should respond 200 and the expected address', () => {
				const { id } = testAddresses[0]
				const expectedAddress = testAddresses[0]
				return supertest(app)
					.get(`/api/address/${id}`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(200, expectedAddress)
			})
		})
	})
	describe('GET /api/address/:address_id/notes', () => {
		context('Given no notes', () => {
			beforeEach(() => {
				helpers.seedUsers(db, testUsers)
			})
			it('should respond 404 "No notes found"', async () => {
				const id = 99909
				await supertest(app)
					.get(`/api/address/${id}/notes`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(404, {
						error: `Address with id:${id} not found`,
					})
			})
		})
		context('Given notes in the database', () => {
			beforeEach(() =>
				helpers.seedAddressesTable(
					db,
					testUsers,
					testAddresses,
					testNotes
				)
			)
			it('should respond with 404 "Address does not exist"', () => {
				const address_id = 99099
				return supertest(app)
					.get(`/api/address/${address_id}/notes/`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(404, {
						error: `Address with id:${address_id} not found`,
					})
			})
			it('should respond 200 and the notes for the address', () => {
				const { id } = testAddresses[0]
				const expectedNotes = helpers.makeExpectedNotes(
					id,
					testNotes
				)
				return supertest(app)
					.get(`/api/address/${id}/notes`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.expect(200, expectedNotes)
			})
		})
	})

	describe('POST /api/address', () => {
		describe('Given no addresses', () => {
			beforeEach(() => helpers.seedUsers(db, testUsers))
			it('should respond 200 and address posted', () => {
				const {
					address_1,
					state,
					zip_code,
					city,
				} = testAddresses[0]
				return supertest(app)
					.post(`/api/address`)
					.set(
						'Authorization',
						helpers.makeAuthHeader(testUsers[0])
					)
					.send({
						address_1,
						state,
						zip_code,
						city,
					})
					.expect(201)
					.expect((res) => {
						expect(res.body).to.have.property('id')
						expect(res.headers.location).to.eql(
							`/api/address/${res.body.id}`
						)
					})
					.expect((res) =>
						db('homebl_addresses')
							.select('*')
							.where({ id: 1 })
							.first()
							.then((row) => {
								expect(row.id).to.eql(1)
								expect(row.user_id).to.eql(
									testUsers[0].id
								)
							})
					)
			})
			const requiredFields = [
				'address_1',
				'city',
				'state',
				'zip_code',
			]
			requiredFields.forEach((field) => {
				const newAddress = {
					address_1: '1234 Test Avenue',
					city: 'Denver',
					state: 'CO',
					zip_code: '80014',
				}
				it(`should resond 400 and an required error when ${field} is missing`, () => {
					delete newAddress[field]

					return supertest(app)
						.post(`/api/address`)
						.set(
							'authorization',
							helpers.makeAuthHeader(testUsers[0])
						)
						.send(newAddress)
						.expect(400, {
							error: `Missing "${field}" in request body`,
						})
				})
			})
		})
	})
	describe('POST /api/address/:address_id/notes', () => {
		beforeEach(() =>
			helpers.seedAddressesTable(db, testUsers, testAddresses)
		)

		it('should create a note, responding with 201 and the note', () => {
			const { content } = testNotes[0]
			const { id } = testAddresses[0]
			return supertest(app)
				.post(`/api/address/${id}/notes`)
				.set(
					'Authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.send({
					content,
				})
				.expect(201)
				.expect((res) => {
					expect(res.body).to.have.property('id')
					expect(res.headers.location).to.eql(
						`/api/address/${id}/notes/${res.body.id}`
					)
				})
				.expect((res) =>
					db('homebl_notes')
						.select('*')
						.where({ id: 1 })
						.first()
						.then((row) => {
							expect(row.id).to.eql(1)
							expect(row.address_id).to.eql(
								testAddresses[0].id
							)
						})
				)
		})
		it('should respond 400 when content is empty', () => {
			return supertest(app)
				.post(`/api/address/1/notes`)
				.set(
					'authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.send({ content: '' })
				.expect(400, { error: `Content is required` })
		})
		it('should respond 400 when no content is provided', () => {
			return supertest(app)
				.post(`/api/address/1/notes`)
				.set(
					'authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.send({})
				.expect(400, { error: `Content is required` })
		})
	})
	describe.only('DELETE /api/address/:address_id', () => {
		beforeEach(() =>
			helpers.seedAddressesTable(
				db,
				testUsers,
				testAddresses,
				testNotes
			)
		)
		it('should respond 204 and the address was deleted', async () => {
			const { id } = testAddresses[0]
			const expectedAddresses = testAddresses.filter(
				(address) =>
					address.id !== id &&
					address.user_id === testUsers[0].id
			)
			return await supertest(app)
				.delete(`/api/address/${id}`)
				.set(
					'authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.expect(204)
				.then(() =>
					supertest(app)
						.get(`/api/address/`)
						.set(
							'authorization',
							helpers.makeAuthHeader(testUsers[0])
						)
						.expect(expectedAddresses)
				)
		})
	})
})
