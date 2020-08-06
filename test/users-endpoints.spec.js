const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const helpers = require('./helpers/test-helpers')
const bcrypt = require('bcryptjs')

describe('Users endpoints', () => {
	let db

	const { testUsers } = helpers.exMachinaFictures()
	const testUser = testUsers[0]
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

	describe('POST /api/users', () => {
		beforeEach('insert users', () =>
			helpers.seedUsers(db, testUsers)
		)
		context('Error path', () => {
			const requireFields = ['user_name', 'password']
			requireFields.forEach((field) => {
				const { user_name, password, full_name } = testUser
				const registerAttempt = {
					user_name,
					password,
					full_name,
				}
				it(`should respond 400 required error when "${field}" is missing`, () => {
					delete registerAttempt[field]

					return supertest(app)
						.post(`/api/users`)
						.send(registerAttempt)
						.expect(400, {
							error: `Missing "${field}" in request body`,
						})
				})
			})
			it('should respond 400 "Password must be longer than 5 characters" when short password ', () => {
				const userShortPassword = {
					user_name: 'TestUser',
					password: '1234',
					full_name: 'test user',
				}
				return supertest(app)
					.post(`/api/users`)
					.send(userShortPassword)
					.expect(400, {
						error: `Password must be longer than 5 characters`,
					})
			})
			it('should respond 400 "Password must be less than 72 characters"', () => {
				const userLongPassword = {
					user_name: 'TestUser',
					password: '*'.repeat(73),
					full_name: 'test user',
				}
				return supertest(app)
					.post(`/api/users`)
					.send(userLongPassword)
					.expect(400, {
						error:
							'Password must be less than 72 characters',
					})
			})

			it('should respond 400 error when password starts with a space ', () => {
				const userInvalidUser = {
					user_name: 'TestUser',
					password: '  existy',
					full_name: 'test user',
				}
				return supertest(app)
					.post(`/api/users`)
					.send(userInvalidUser)
					.expect(400, {
						error: `Password must not begin or end with a blank space`,
					})
			})
			it('should responds 400 "Username already taken" when user_name is taken', () => {
				const duplicateUser = {
					user_name: testUser.user_name,
					password: 'testPassword',
					full_name: 'test user',
				}
				return supertest(app)
					.post(`/api/users`)
					.send(duplicateUser)
					.expect(400, { error: `Username already taken` })
			})
		})
		context('Happy path', () => {
			it('should respond 201 with password bcrypted', () => {
				const newUser = {
					user_name: 'TestUser',
					full_name: 'Test User',
					password: 'testpassword',
				}
				return supertest(app)
					.post(`/api/users`)
					.send(newUser)
					.expect(201)
					.expect((res) => {
						expect(res.body).to.have.property('id')
						expect(res.body).to.not.have.property(
							'password'
						)
						expect(res.headers.location).to.eql(
							`/api/users/${res.body.id}`
						)
					})
					.expect((res) =>
						db('homebl_users')
							.select('*')
							.where({ id: res.body.id })
							.first()
							.then(async (row) => {
								try {
									expect(row.user_name).to.eql(
										newUser.user_name
									)
									expect(row.full_name).to.eql(
										newUser.full_name
									)
									expect(row.logged_in).to.eql(
										new Date(row.logged_in)
									)
									return await bcrypt.compare(
										newUser.password,
										row.password
									)
								} catch (error) {
									// eslint-disable-next-line no-console
									console.log(error.message)
								}
							})
							.then((compateMatch) => {
								expect(compateMatch).to.be.true
							})
					)
			})
		})
	})
})
