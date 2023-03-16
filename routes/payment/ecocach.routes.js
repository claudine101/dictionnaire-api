const express = require('express')
const ecocach_controller = require('../../controllers/payment/ecocach.controller')

const ecocash_routes = express.Router()

ecocash_routes.get('/confirmation/:txni_d', ecocach_controller.confirmEcocash)

module.exports = ecocash_routes