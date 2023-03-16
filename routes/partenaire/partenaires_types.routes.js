const express = require('express')
const partenaires_controller = require('../../controllers/partenaire/partenaires.controller')

const partenaires_types_routes = express.Router()

partenaires_types_routes.get('/', partenaires_controller.findPartenairesTypes)

module.exports = partenaires_types_routes