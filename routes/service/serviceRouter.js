const express = require('express')
const personne_livreurs_routes = require('./personne_livreurs.routes')
const services_routes = require('./services.routes')
const serviceRouter = express.Router()

serviceRouter.use('/', services_routes)
serviceRouter.use('/personne_livreurs', personne_livreurs_routes)

module.exports = serviceRouter