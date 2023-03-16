const express = require('express')

const restaurant_menus_controller = require('../../controllers/resto/restaurant_menus.controller')
const restaurant_menus_wishlist_routes = express.Router()

restaurant_menus_wishlist_routes.put('/:ID_RESTAURANT_MENU',restaurant_menus_controller.createRestaurant_wishlist_menu)

module.exports =restaurant_menus_wishlist_routes