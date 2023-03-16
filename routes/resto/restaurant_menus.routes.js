const express = require('express')
const ecommerce_produits_controller = require('../../controllers/ecommerce/ecommerce_produits.controller')
const restaurant_menus_controller = require('../../controllers/resto/restaurant_menus.controller')

const restaurant_menus_routes = express.Router()
restaurant_menus_routes.get('/', restaurant_menus_controller.getAllmenu) 
restaurant_menus_routes.get('/one/:ID_RESTAURANT_MENU', restaurant_menus_controller.getOnemenu) 
restaurant_menus_routes.put('/:ID_RESTAURANT_MENU', restaurant_menus_controller.modifierMenu) 
restaurant_menus_routes.delete('/:ID_RESTAURANT_MENU', restaurant_menus_controller.deleteMenu) 

restaurant_menus_routes.get('/wishlistmenu', restaurant_menus_controller.WishlistMenu)
restaurant_menus_routes.post('/', restaurant_menus_controller.createMenu)
restaurant_menus_routes.get('/restaurant_categorie_menu', restaurant_menus_controller.getCategories)
restaurant_menus_routes.get('/restaurant_menu_variants/:ID_RESTAURANT_MENU', restaurant_menus_controller.getMenuVariants)

module.exports = restaurant_menus_routes