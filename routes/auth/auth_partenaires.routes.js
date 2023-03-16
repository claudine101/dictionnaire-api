const express = require('express')
const auth_partenaires_controller = require('../../controllers/auth/auth_partenaires.controller')
const auth_partenaires_routes = express.Router()

/**
 * Une route pour controller la connnexion d'un client
 *@method POST
 * @url /auth/partenaires/login
 */
auth_partenaires_routes.post('/login', auth_partenaires_controller.login)
/**
 * Une route à appeller lors de l'inscription du client
 *@method POST
 * @url /auth/users
 */
auth_partenaires_routes.post('/', auth_partenaires_controller.createUser)

module.exports = auth_partenaires_routes