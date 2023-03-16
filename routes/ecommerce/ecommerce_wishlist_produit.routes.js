const express = require('express')
const ecommerce_produits_controller = require('../../controllers/ecommerce/ecommerce_produits.controller')

const ecommerce_wishlist_produit_routes = express.Router()

ecommerce_wishlist_produit_routes.put('/:ID_PRODUIT',ecommerce_produits_controller.createEcommerce_wishlist_produit)


module.exports = ecommerce_wishlist_produit_routes