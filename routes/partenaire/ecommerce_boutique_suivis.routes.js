const express = require('express')
const partenaires_controller = require('../../controllers/partenaire/partenaires.controller')

const ecommerce_boutique_suivis_routes = express.Router()

ecommerce_boutique_suivis_routes.put('/:ID_PARTENAIRE_SERVICE', partenaires_controller.createEcommerce_boutique_suivis)

module.exports = ecommerce_boutique_suivis_routes