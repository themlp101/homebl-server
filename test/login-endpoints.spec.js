const knex = require('knex')
const app = require('../src/app')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const helpers = require('./helpers/test-helpers')

describe('Login/Auth endpoints', () => {
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

	describe('POST /api/auth/login', () => {
		beforeEach('insert users', () =>
			helpers.seedUsers(db, testUsers)
		)
		const requireFields = ['user_name', 'password']
		requireFields.forEach((field) => {
			const { user_name, password } = testUser
			const loginAttempt = {
				user_name,
				password,
			}
			it(`should respond 400 required error when "${field}" is missing`, () => {
				delete loginAttempt[field]

				return supertest(app)
					.post(`/api/auth/login`)
					.send(loginAttempt)
					.expect(400, {
						error: `Missing "${field}" in request body`,
					})
			})
		})
		it('should respond 400 "Invalid username or password" when bad user_name ', () => {
			const userInvalidUser = {
				user_name: 'not-a-user',
				password: 'existy',
			}
			return supertest(app)
				.post(`/api/auth/login`)
				.send(userInvalidUser)
				.expect(400, {
					error: `Incorrect username or password`,
				})
		})
		it('should respond 400 "Invalid username or password" when bad password ', () => {
			const userInvalidUser = {
				user_name: testUser.user_name,
				password: 'existy',
			}
			return supertest(app)
				.post(`/api/auth/login`)
				.send(userInvalidUser)
				.expect(400, {
					error: `Incorrect username or password`,
				})
		})
		it('should resoind 200 when using valid credentials', () => {
			const validUser = {
				user_name: testUser.user_name,
				password: testUser.password,
			}
			const expectedToken = jwt.sign(
				{ user_id: testUser.id }, // payload
				process.env.JWT_SECRET,
				{
					subject: testUser.user_name,
					algorithm: 'HS256',
				}
			)
			return supertest(app)
				.post(`/api/auth/login`)
				.send(validUser)
				.expect(200, { authToken: expectedToken })
		})
	})
})
