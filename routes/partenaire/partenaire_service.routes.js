const express = require('express')
const partenaire_service_controller = require('../../controllers/partenaire/partenaire_service.controller')

const partenaire_service_routes = express.Router()

partenaire_service_routes.get('/', partenaire_service_controller.findAll)
partenaire_service_routes.get('/:ID_PARTENAIRE', partenaire_service_controller.findPartenaireServices)
partenaire_service_routes.post('/', partenaire_service_controller.createPartenaireService)
partenaire_service_routes.put('/:ID_PARTENAIRE_SERVICE', partenaire_service_controller.modifierPartenaireService)
partenaire_service_routes.delete('/:ID_PARTENAIRE_SERVICE', partenaire_service_controller.deletePartenaireService)

module.exports = partenaire_service_routes