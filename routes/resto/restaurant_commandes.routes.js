const express = require('express')
const ecommerce_commandes_controller = require('../../controllers/ecommerce/ecommerce_commandes.controller')
const restaurant_commandes_controller = require('../../controllers/resto/restaurant_commandes.controller')

const restaurant_commandes_routes = express.Router()

/**
 * Une route pour enregistrer une commande dans ecommerce
 *@method POST
 * @url /ecommerce/ecommerce_commandes
 */
restaurant_commandes_routes.post('/', restaurant_commandes_controller.createRestoCommande)
restaurant_commandes_routes.get('/', restaurant_commandes_controller.getRestoCommandes)
restaurant_commandes_routes.get('/livraison/:ID_COMMANDE', restaurant_commandes_controller.getLivraisonDetails)
restaurant_commandes_routes.get('/status_historiques/:ID_COMMANDE', restaurant_commandes_controller.getCommandeStatusHistory)
restaurant_commandes_routes.put('/update_status/:ID_COMMANDE', restaurant_commandes_controller.updateRestoStatus)

module.exports = restaurant_commandes_routes