const express = require('express')
const auth_riders_controller = require('../../controllers/auth/auth_riders.controller')
const auth_riders_routes = express.Router()

/**
 * Une route pour controller la connnexion d'un riders
 *@method POST
 * @url /auth/riders/login
 */
auth_riders_routes.post('/login', auth_riders_controller.login)
/**
 * Une route à appeller lors de l'inscription d'un  riders
 *@method POST
 * @url /auth/riders
 */
auth_riders_routes.post('/', auth_riders_controller.createRiders)

/**
 * Une route à appeller lors de la modification  d'un riders
 *@method PUT
 * @url /auth/riders
 */
 auth_riders_routes.put('/update/:ID_RIDER', auth_riders_controller.updateRiders)
module.exports = auth_riders_routes