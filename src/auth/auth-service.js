const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const xss = require('xss')

const AuthService = {
	getUser: (db, user_name) => {
		return db(`homebl_users`).where({ user_name }).first()
	},
	comparePasswords: (password, hash) => {
		return bcrypt.compare(password, hash)
	},
	createJwt: (subject, payload) => {
		return jwt.sign(payload, config.JWT_SECRET, {
			subject,
			algorithm: 'HS256',
		})
	},
	verifyJwt: (token) => {
		return jwt.verify(token, config.JWT_SECRET, {
			algorithms: ['HS256'],
		})
	},
	parstBasicToken: (token) => {
		return Buffer.from(token, 'base64').toString().split(':')
	},
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
