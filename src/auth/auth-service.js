const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const xss = require('xss')
/**
 * @param {database connection} db - 'homebl' database knex connection
 */
const AuthService = {
	/**
	 * retrieves user from the database
	 */
	getUser: (db, user_name) => {
		return db(`homebl_users`).where({ user_name }).first()
	},
	/**
	 * compares encrypted password with request password
	 */
	comparePasswords: (password, hash) => {
		return bcrypt.compare(password, hash)
	},
	/**
	 * creates token from the request password, returns the user_name as the subject
	 */
	createJwt: (subject, payload) => {
		return jwt.sign(payload, config.JWT_SECRET, {
			subject,
			algorithm: 'HS256',
		})
	},
	/**
	 * verify token against 'jwt secret'
	 */
	verifyJwt: (token) => {
		return jwt.verify(token, config.JWT_SECRET, {
			algorithms: ['HS256'],
		})
	},
	/**
	 * parses request token
	 */
	parstBasicToken: (token) => {
		return Buffer.from(token, 'base64').toString().split(':')
	},
	/**
	 * return false if the user does not exist, true if the user does exist
	 */
	doesUserExist: (db, user_name) => {
		return db('homebl_users')
			.where({ user_name })
			.first()
			.then((user) => !!user)
	},
	insertUser: (db, newUser) => {
		return db('homebl_users')
			.insert(newUser)
			.returning('*')
			.then(([user]) => user)
	},
	/**
	 * xss defense
	 */
	serializeUser: (user) => {
		return {
			id: user.id,
			full_name: xss(user.full_name),
			user_name: xss(user.user_name),
			logged_in: new Date(user.logged_in),
		}
	},
	hashPassword: (password) => {
		return bcrypt.hash(password, 12)
	},
}

module.exports = AuthService
