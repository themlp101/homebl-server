module.exports = {
	PORT: process.env.PORT || 3000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	API_KEY: process.env.API_KEY || null,
	DATABASE_URL: process.env.DATABASE_URL || '',
	JWT_SECRET:
		process.env.JWT_SECRET ||
		'8d475ffa-7f7f-4357-889f-1053a79e4283',
}
