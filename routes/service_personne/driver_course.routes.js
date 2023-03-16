const express = require('express')
const driver_course_controller = require('../../controllers/service_personne/driver_course.controller')

const driver_course_routes = express.Router()

driver_course_routes.get('/ecommerce_commandes/:ID_PARTENAIRE_SERVICE', driver_course_controller.getEcommerceLivreurCommande)
driver_course_routes.get('/restaurant_commandes/:ID_PARTENAIRE_SERVICE', driver_course_controller.getRestoLivreurCommande)

module.exports = driver_course_routes