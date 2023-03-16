const express = require('express')
const personne_livreurs_controller = require('../../controllers/service/personne_livreurs.controller')

const personne_livreurs_routes = express.Router()

personne_livreurs_routes.post('/', personne_livreurs_controller.createLivreur)

module.exports = personne_livreurs_routes