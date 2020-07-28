const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers/test-helpers')
const supertest = require('supertest')
const { makeExpectedAddress } = require('./helpers/test-helpers')

describe.only('Addressess Endpoint', () => {
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
})
