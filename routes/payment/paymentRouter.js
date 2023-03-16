const express = require('express')
const ecocash_routes = require('./ecocach.routes')

const paymentRouter = express.Router()

paymentRouter.use('/ecocash', ecocash_routes)

module.exports = paymentRouter