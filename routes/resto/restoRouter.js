const express = require('express')
const restaurant_commandes_routes = require('./restaurant_commandes.routes')
const restaurant_menus_routes = require('./restaurant_menus.routes')
const restaurant_menus_wishlist_routes=require('./restaurant_menus_wishlist_routes')
const restaurant_menus_notes_routes=require('./restaurant_menus_notes.routes')
const restoRouter = express.Router()

restoRouter.use('/restaurant_menus', restaurant_menus_routes)
restoRouter.use('/restaurant_commandes',restaurant_commandes_routes)
restoRouter.use('/restaurant_menus_wishlist',restaurant_menus_wishlist_routes)
restoRouter.use('/restaurant_menus_notes',restaurant_menus_notes_routes)
module.exports = restoRouter