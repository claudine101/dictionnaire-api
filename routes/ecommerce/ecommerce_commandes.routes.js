const express = require('express')
const ecommerce_commandes_controller = require('../../controllers/ecommerce/ecommerce_commandes.controller')

const ecommerce_commandes_routes = express.Router()

/**
 * Une route pour enregistrer une commande dans ecommerce
 *@method POST
 * @url /ecommerce/ecommerce_commandes
 */
ecommerce_commandes_routes.post('/', ecommerce_commandes_controller.create)
ecommerce_commandes_routes.get('/', ecommerce_commandes_controller.getPartenaireCommandes)
ecommerce_commandes_routes.get('/livraison/:ID_COMMANDE', ecommerce_commandes_controller.getLivraisonDetails)
ecommerce_commandes_routes.get('/status_historiques/:ID_COMMANDE', ecommerce_commandes_controller.getCommandeStatusHistory)
ecommerce_commandes_routes.put('/update_status/:ID_COMMANDE', ecommerce_commandes_controller.updateStatus)
ecommerce_commandes_routes.get('/commandes_counts', ecommerce_commandes_controller.getCountCommandes)

module.exports = ecommerce_commandes_routes