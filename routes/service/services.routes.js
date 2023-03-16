const express = require('express')
const services_controller = require('../../controllers/service/services.controller')

const services_routes = express.Router()

services_routes.get('/', services_controller.findAll)
services_routes.get('/services_categories', services_controller.findServicesCategories)
services_routes.get('/count/ecommerce/:ID_PARTENAIRE_SERVICE', services_controller.getEcommerceServiceCounts)
services_routes.get('/count/restaurant/:ID_PARTENAIRE_SERVICE', services_controller.getRestoServiceCounts)

module.exports = services_routes