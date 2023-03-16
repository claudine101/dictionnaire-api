const { query } = require("../../utils/db")
const commandes_payement_model = require('../../models/payment/commandes_payement.model')
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const IDS_SERVICE_CATEGORIES = require("../../constants/IDS_SERVICE_CATEGORIES")
const { saveStatus } = require("../../models/ecommerce/ecommerce_commandes.model")
const { saveStatusResto } = require("../../models/resto/restaurant_commandes.model")
const sendPushNotifications = require("../../utils/sendPushNotifications")

const confirmEcocash = async (req, res) => {
          try {
                    const { txni_d } = req.params
                    const payment = (await commandes_payement_model.findBy('TXNI_D', txni_d))[0]
                    if (payment && payment.ID_SERVICE_CATEGORIE == IDS_SERVICE_CATEGORIES.ecommerce && payment.STATUT_ID == 0) {
                              const commandes = await query("SELECT ID_COMMANDE, ID_USER, ID_PARTENAIRE_SERVICE, ID_DRIVER_COURSE FROM ecommerce_commandes WHERE PAYEMENT_ID = ? ", [payment.PAYEMENT_ID])
                              await query("UPDATE ecommerce_commandes SET ID_STATUT = 2 WHERE PAYEMENT_ID = ?", [payment.PAYEMENT_ID])
                              await Promise.all(commandes.map(async commande => {
                                        await saveStatus(commande.ID_COMMANDE, req.userId, 2)
                                        const partenaireService = (await query('SELECT ps.ADRESSE_COMPLETE, ps.ID_PARTENAIRE, p.ID_USER FROM partenaire_service ps LEFT JOIN partenaires p ON p.ID_PARTENAIRE = ps.ID_PARTENAIRE WHERE ID_PARTENAIRE_SERVICE = ?', [commande.ID_PARTENAIRE_SERVICE]))[0]
                                        const livreursQuery = `
                                        SELECT pl.ID_LIVREUR,
                                                  p.ID_USER
                                        FROM driver_course dc
                                                  LEFT JOIN personne_livreurs pl ON pl.ID_LIVREUR = dc.ID_LIVREUR
                                                  LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = pl.ID_PARTENAIRE_SERVICE
                                                  LEFT JOIN partenaires p ON p.ID_PARTENAIRE = ps.ID_PARTENAIRE
                                        WHERE dc.ID_DRIVER_COURSE = ?
                                        `
                                        const livreur = (await query(livreursQuery, [commande.ID_DRIVER_COURSE]))[0]
                                        const partenaireTokens = await query('SELECT TOKEN, ID_PROFIL FROM notification_tokens WHERE ID_USER = ? AND ID_PROFIL = 2', [partenaireService.ID_USER])
                                        const livreurTokens = await query('SELECT TOKEN, ID_PROFIL FROM notification_tokens WHERE ID_USER = ? AND ID_PROFIL = 2', [livreur.ID_USER])
                                        if(partenaireTokens.length > 0) {
                                                  const tokens = partenaireTokens.map(t => t.TOKEN)
                                                  sendPushNotifications(tokens, "Nouveau commande", "Une commande vient être éffectué dans votre boutique. cliquer pour voir la commande")
                                        }
                                        if(livreurTokens.length > 0) {
                                                  const tokens = partenaireTokens.map(t => t.TOKEN)
                                                  sendPushNotifications(tokens, "Nouvelle course", "Une nouvelle course est disponible pour vous. cliquer pour voir la course")
                                        }
                              }))
                              await commandes_payement_model.changeStatus(txni_d, 1)
                              req.app.io.to(commandes[0].ID_USER).emit("ECOCASH_CONFIRMED", { message: "Hello" })

                              // envoyer une notication au client pour le paiement
                              //          const clientsTokens = await notificationsModel.getClientsTokens(payment.CLIENT_ID_PAYEMENT)
                              //          const tokens = clientsTokens.map(token => token.TOKEN)
                              //          if(tokens.length > 0) {
                              //                    const message = `Vous venez de payer ${payment.MONTANT.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") } BIF avec succès pour une commande`
                              //                    sendPushNotifications(tokens, 'Paiement de la commade' , message, { command: commande, url: `wasilieats://Orders`, refreshOrders: true })
                              //          }
                              res.status(200).json({ confirmed: true, txni_d })
                    } else if (payment && payment.ID_SERVICE_CATEGORIE == IDS_SERVICE_CATEGORIES.resto && payment.STATUT_ID == 0) {
                              const commandes = await query("SELECT ID_COMMANDE, ID_USER, ID_PARTENAIRE_SERVICE, ID_DRIVER_COURSE  FROM  restaurant_commandes WHERE PAYEMENT_ID = ? ", [payment.PAYEMENT_ID])
                              await query("UPDATE restaurant_commandes SET ID_STATUT = 2 WHERE PAYEMENT_ID = ?", [payment.PAYEMENT_ID])
                              await Promise.all(commandes.map(async commande => {
                                        await saveStatusResto(commande.ID_COMMANDE, req.userId, 2)
                                        const partenaireService = (await query('SELECT ps.ADRESSE_COMPLETE, ps.ID_PARTENAIRE, p.ID_USER FROM partenaire_service ps LEFT JOIN partenaires p ON p.ID_PARTENAIRE = ps.ID_PARTENAIRE WHERE ID_PARTENAIRE_SERVICE = ?', [commande.ID_PARTENAIRE_SERVICE]))[0]
                                        const livreursQuery = `
                                        SELECT pl.ID_LIVREUR,
                                                  p.ID_USER
                                        FROM driver_course dc
                                                  LEFT JOIN personne_livreurs pl ON pl.ID_LIVREUR = dc.ID_LIVREUR
                                                  LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = pl.ID_PARTENAIRE_SERVICE
                                                  LEFT JOIN partenaires p ON p.ID_PARTENAIRE = ps.ID_PARTENAIRE
                                        WHERE dc.ID_DRIVER_COURSE = ?
                                        `
                                        const livreur = (await query(livreursQuery, [commande.ID_DRIVER_COURSE]))[0]
                                        const partenaireTokens = await query('SELECT TOKEN, ID_PROFIL FROM notification_tokens WHERE ID_USER = ? AND ID_PROFIL = 2', [partenaireService.ID_USER])
                                        const livreurTokens = await query('SELECT TOKEN, ID_PROFIL FROM notification_tokens WHERE ID_USER = ? AND ID_PROFIL = 2', [livreur.ID_USER])
                                        if(partenaireTokens.length > 0) {
                                                  const tokens = partenaireTokens.map(t => t.TOKEN)
                                                  sendPushNotifications(tokens, "Nouveau commande", "Une commande vient être éffectué dans votre restaurant. cliquer pour voir la commande")
                                        }
                                        if(livreurTokens.length > 0) {
                                                  const tokens = partenaireTokens.map(t => t.TOKEN)
                                                  sendPushNotifications(tokens, "Nouvelle course", "Une nouvelle course est disponible pour vous. cliquer pour voir la course")
                                        }
                              }))
                              await commandes_payement_model.changeStatus(txni_d, 1)
                              req.app.io.to(commandes[0].ID_USER).emit("ECOCASH_CONFIRMED", { message: "Hello" })

                              // envoyer une notication au client pour le paiement
                              //          const clientsTokens = await notificationsModel.getClientsTokens(payment.CLIENT_ID_PAYEMENT)
                              //          const tokens = clientsTokens.map(token => token.TOKEN)
                              //          if(tokens.length > 0) {
                              //                    const message = `Vous venez de payer ${payment.MONTANT.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") } BIF avec succès pour une commande`
                              //                    sendPushNotifications(tokens, 'Paiement de la commade' , message, { command: commande, url: `wasilieats://Orders`, refreshOrders: true })
                              //          }
                              res.status(200).json({ confirmed: true, txni_d })
                    } else {
                              res.status(404).json({ confirmed: false, 'error': "Impossible de trouver le paiement" })
                    }
          } catch (error) {
                    console.log(error)
                    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                              statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                              httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                              message: "Erreur interne du serveur, réessayer plus tard"
                    })
          }
}

module.exports = {
          confirmEcocash
}