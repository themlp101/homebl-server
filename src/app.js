require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const { NODE_ENV } = require('./config')
const logger = require('./logger')
const authRouter = require('./auth/auth-router')
const addressRouter = require('./addresses/address-router')
const notesRouter = require('./notes/notes-router')
const usersRouter = require('./auth/users-router')

const app = express()

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(
	morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
		skip: () => NODE_ENV === 'test',
	})
)
/**
 *
 * Middleware set up
 *
 */
app.use(morgan(morganOption))
app.use(express.json())
app.use(cors())
app.use(helmet())
/**
 * Routes
 *
 */
app.use(`/api/auth`, authRouter)
app.use(`/api/address`, addressRouter)
app.use(`/api/notes`, notesRouter)
app.use(`/api/users`, usersRouter)
/**
 * Error handling middleware
 */
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
	let response
	if (NODE_ENV === 'production') {
		response = { error: { message: 'server error' } }
	} else {
		logger.error(error)
		response = { message: error.message, error }
	}
	res.status(500).json(response)
})

module.exports = app
