const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const ecommerce_commandes = require("../../models/ecommerce/ecommerce_commandes.model")
const restaurant_commandes_model = require("../../models/resto/restaurant_commandes.model")
const { query } = require("../../utils/db")

/**
 * fonction pour recuperer les commandes pret a etre livre par le livreur
 * @author Vanny Boy <vanny@mediabox.bi>
 * @date 31/1/2023
 * @param {*} req 
 * @param {*} res 
 */
const getEcommerceLivreurCommande = async (req, res) => {
          try {
                    const { ID_PARTENAIRE_SERVICE } = req.params
                    const serviceLivreur = (await query("SELECT ID_LIVREUR FROM personne_livreurs WHERE ID_PARTENAIRE_SERVICE=?", [ID_PARTENAIRE_SERVICE]))[0]
                    const driverCourse = (await query("SELECT ID_DRIVER_COURSE FROM driver_course WHERE ID_LIVREUR=?", [serviceLivreur.ID_LIVREUR]))
                    const idDriverCourse = driverCourse.map(d => d.ID_DRIVER_COURSE)
                    var commandesIds = []
                    const commandes = await ecommerce_commandes.getCommandesByIdsDriverCourses(idDriverCourse)
                    commandes.forEach(commande => commandesIds.push(commande.ID_COMMANDE))
                    var details = 0
                    if (commandesIds.length > 0) {
                              details = await ecommerce_commandes.getManyCommandesDetails(commandesIds)
                    }
                    const commandesDetails = commandes.map(commande => {
                              var TOTAL_COMMANDE = 0
                              const myDetails = details.filter(d => d.ID_COMMANDE == commande.ID_COMMANDE)
                              myDetails.forEach(detail => TOTAL_COMMANDE += detail.QUANTITE * detail.PRIX)
                              return {
                                        ...commande,
                                        ITEMS: myDetails.length,
                                        TOTAL: TOTAL_COMMANDE,
                                        details: myDetails
                              }
                    })
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "succès",
                              result: commandesDetails
                    })
          }
          catch (error) {
                    console.log(error)
                    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                              statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                              httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                              message: "Erreur interne du serveur, réessayer plus tard",

                    })
          }

}

const getRestoLivreurCommande = async (req, res) => {
          try {
                    const { ID_PARTENAIRE_SERVICE } = req.params
                    const serviceLivreur = (await query("SELECT ID_LIVREUR FROM personne_livreurs WHERE ID_PARTENAIRE_SERVICE=?", [ID_PARTENAIRE_SERVICE]))[0]
                    const driverCourse = (await query("SELECT ID_DRIVER_COURSE FROM driver_course WHERE ID_LIVREUR=?", [serviceLivreur.ID_LIVREUR]))
                    const idDriverCourse = driverCourse.map(d => d.ID_DRIVER_COURSE)
                    var commandesIds = []
                    const commandes = await restaurant_commandes_model.getCommandesByIdsDriverCourses(idDriverCourse)
                    commandes.forEach(commande => commandesIds.push(commande.ID_COMMANDE))
                    var details = 0
                    if (commandesIds.length > 0) {
                              details = await restaurant_commandes_model.getManyCommandesRestaurantDetails(commandesIds)
                    }
                    const commandesDetails = commandes.map(commande => {
                              var TOTAL_COMMANDE = 0
                              const myDetails = details.filter(d => d.ID_COMMANDE == commande.ID_COMMANDE)
                              myDetails.forEach(detail => TOTAL_COMMANDE += detail.QUANTITE * detail.PRIX)
                              return {
                                        ...commande,
                                        ITEMS: myDetails.length,
                                        details: myDetails
                              }
                    })
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "succès",
                              result: commandesDetails
                    })
          }
          catch (error) {
                    console.log(error)
                    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                              statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                              httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                              message: "Erreur interne du serveur, réessayer plus tard",

                    })
          }

}
module.exports = {
          getEcommerceLivreurCommande,
          getRestoLivreurCommande
}