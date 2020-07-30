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

	describe('GET api/notes/:note_id', () => {
		beforeEach(() =>
			helpers.seedAddressesTable(
				db,
				testUsers,
				testAddresses,
				testNotes
			)
		)
		it('should respond 200 and the note', () => {
			const { id } = testNotes[0]
			return supertest(app)
				.get(`/api/notes/${id}`)
				.set(
					'authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.expect(200, testNotes[0])
		})
	})
	describe('DELETE /api/notes/note_id', () => {
		beforeEach(() =>
			helpers.seedAddressesTable(
				db,
				testUsers,
				testAddresses,
				testNotes
			)
		)
		it('should respond 204 and the note is delete', () => {
			const { id } = testNotes[0]
			return supertest(app)
				.delete(`/api/notes/${id}`)
				.set(
					'authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.expect(204)
				.then(() =>
					supertest(app)
						.get(`/api/notes/${id}`)
						.set(
							'authorization',
							helpers.makeAuthHeader(testUsers[0])
						)
						.expect(404)
				)
		})
	})
	describe('PATCH /api/notes/note_id', () => {
		beforeEach(() =>
			helpers.seedAddressesTable(
				db,
				testUsers,
				testAddresses,
				testNotes
			)
		)
		it('should respond 204 and the note updated', () => {
			const { id } = testNotes[0]
			const newField = {
				content: 'This is test content',
			}
			return supertest(app)
				.patch(`/api/notes/${id}`)
				.set(
					'authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.send(newField)
				.expect(204)
				.then(() =>
					supertest(app)
						.get(`/api/notes/${id}`)
						.set(
							'authorization',
							helpers.makeAuthHeader(testUsers[0])
						)
						.expect({
							...testNotes[0],
							content: 'This is test content',
						})
				)
		})
		it.only('should respond 400 if content is empty', () => {
			const { id } = testNotes[0]
			const newField = {
				content: '',
			}
			return supertest(app)
				.patch(`/api/notes/${id}`)
				.set(
					'authorization',
					helpers.makeAuthHeader(testUsers[0])
				)
				.send(newField)
				.expect(400, { error: `Content required` })
		})
	})
})
