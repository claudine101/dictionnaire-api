const express = require('express')
const auth_drivers_controller = require('../../controllers/auth/auth_drivers.controller')
const auth_drivers_routes = express.Router()

/**
 * Une route pour controller la connnexion d'un drivers
 *@method POST
 * @url /auth/drivers/login
 */
auth_drivers_routes.post('/login', auth_drivers_controller.login)
/**
 * Une route à appeller lors de l'inscription d'un  drivers
 *@method POST
 * @url /auth/drivers
 */
auth_drivers_routes.post('/', auth_drivers_controller.createDrivers)

/**
 * Une route à appeller lors de la modification  d'un drivers
 *@method PUT
 * @url /auth/drivers
 */
 auth_drivers_routes.put('/update/:ID_DRIVER', auth_drivers_controller.updateDrivers)
module.exports = auth_drivers_routes