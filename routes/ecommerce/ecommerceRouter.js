const express = require('express')
const ecommerce_commandes_routes = require('./ecommerce_commandes.routes')
const ecommerce_produits_routes = require('./ecommerce_produits.routes')
const ecommerce_wishlist_produit_routes=require('./ecommerce_wishlist_produit.routes')
const ecommerce_produits_notes_routes=require('./ecommerce_produits_notes.routes')
const ecommerceRouter = express.Router()

ecommerceRouter.use('/ecommerce_wishlist_produit',ecommerce_wishlist_produit_routes)
ecommerceRouter.use('/ecommerce_commandes', ecommerce_commandes_routes)
ecommerceRouter.use('/ecommerce_produits', ecommerce_produits_routes)
ecommerceRouter.use('/ecommerce_produits_notes',ecommerce_produits_notes_routes)
module.exports = ecommerceRouter