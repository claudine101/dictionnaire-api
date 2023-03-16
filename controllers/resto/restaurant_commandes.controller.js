const express = require('express')
const Validation = require("../../class/Validation")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const restaurant_commandes_model = require("../../models/resto/restaurant_commandes.model")
const { query } = require("../../utils/db")
const commandes_payement = require('../../models/payment/commandes_payement.model')
const { createDetailLivraison } = require("../../models/livraison/driver_details_livraison.model")
const getReferenceCode = require("../../utils/getReferenceCode")
const randomInt = require("../../utils/randomInt")

/**
 * Permet de créer une commande dans ecommerce
 * @param {express.Request} req
 * @param {express.Response} res 
 */

const createRestoCommande = async (req, res) => {
          try {
                    const { shipping_info, commandes, numero, service, ID_COMBINATION } = req.body
                    console.log(req.body)
                    const validation = new Validation(
                              shipping_info,
                              {
                                        N0M: {
                                                  required: true,
                                                  length: [0, 255]
                                        },
                                        PRENOM: {
                                                  required: true,
                                                  length: [0, 255]
                                        },
                                        ADRESSE: {
                                                  required: true,
                                                  length: [0, 255]
                                        },
                                        TELEPHONE: {
                                                  required: true,
                                                  length: [8, 8]
                                        },
                                        AVENUE: {
                                                  length: [0, 255]
                                        },
                                        ID_COUNTRY: {
                                                  length: [0, 255]
                                        },
                              }, {
                              N0M: {
                                        required: "Nom est obligatoire",
                                        length: "Nom invalide"
                              },
                              PRENOM: {
                                        required: "Prénom est obligatoire",
                                        length: "Prénom est invalide"
                              },
                              ADRESSE: {
                                        required: "L'adresse est obligatoire",
                                        length: "Adresse est invalide"
                              },
                              TELEPHONE: {
                                        required: "Le numéro de téléphone est obligatoire",
                                        length: "Numéro de téléphone invalide"
                              },
                              AVENUE: {
                                        required: "Avenue est obligatoiree",
                                        length: "taille de l'avenue est invalide"
                              },
                              ID_COUNTRY: {
                                        required: "Le pays est obligatoiree",
                                        length: "taille de country est invalide"
                              },
                    }
                    )
                    if (!numero) {
                              validation.setError('numero', "Le numéro ecocash est obligatoire")
                    }
                    let isnum = /^\d+$/.test(numero);
                    let isTel = /^\d+$/.test(shipping_info?.TELEPHONE);
                    if (!isnum || numero.length != 8) {
                              validation.setError('numero', "Numéro ecocash invalide")
                    }
                    if (!isTel) {
                              validation.setError('TELEPHONE', "Numéro de téléphone invalide")
                    }
                    await validation.run()
                    const isValid = await validation.isValidate()
                    if (!isValid) {
                              const erros = await validation.getErrors()
                              return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                                        statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                                        httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                                        message: "Probleme de validation de donnees",
                                        result: erros
                              })
                    }



                    const DATE_LIVRAISON = null

                    var TOTAL = 0
                    commandes.forEach(commande => {
                              TOTAL += commande.QUANTITE * commande.PRIX
                    })

                    if (false) {
                              const econnetResponse = await axios.post('http://app.mediabox.bi/api_ussd_php/Api_client_ecocash', {
                                        VENDEUR_PHONE: "79839653",
                                        AMOUNT: TOTAL,
                                        CLIENT_PHONE: numero,
                                        INSTANCE_TOKEN: "2522"
                              })
                              const ecoData = econnetResponse.data
                    }
                    if (true) {

                              const TXNI_D = await getReferenceCode()
                              const restaurant_commande_details = []
                              var TOTAL = 0
                              const groups = {};
                              commandes.forEach(commande => {
                                        TOTAL += commande.PRIX * commande.QUANTITE
                                        if (!groups[commande.ID_PARTENAIRE_SERVICE]) {
                                                  groups[commande.ID_PARTENAIRE_SERVICE] = {
                                                            ID_PARTENAIRE_SERVICE: commande.ID_PARTENAIRE_SERVICE,
                                                            products: []
                                                  };
                                        }
                                        groups[commande.ID_PARTENAIRE_SERVICE].products.push(commande);
                              });
                              const grouped = Object.values(groups);
                              const { insertId: PAYEMENT_ID } = await commandes_payement.createOne(service, 1, numero, null, TOTAL, TXNI_D, 0)
                              const { insertId: ID_DETAILS_LIVRAISON } = await createDetailLivraison(req.userId, shipping_info.N0M, shipping_info.PRENOM, shipping_info.ADRESSE, shipping_info.TELEPHONE, shipping_info.AVENUE, shipping_info.ID_COUNTRY)
                              const livreursQuery = `
                              SELECT pl.ID_LIVREUR,
                                        p.ID_USER
                              FROM personne_livreurs pl
                                        LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = pl.ID_PARTENAIRE_SERVICE
                                        LEFT JOIN partenaires p ON p.ID_PARTENAIRE = ps.ID_PARTENAIRE
                              `
                              const livreurs = await query(livreursQuery)
                              const livreur = livreurs[randomInt(0, livreurs.length-1)]
                              const partenaireService = (await query('SELECT ps.ADRESSE_COMPLETE, ps.ID_PARTENAIRE, p.ID_USER FROM partenaire_service ps LEFT JOIN partenaires p ON p.ID_PARTENAIRE = ps.ID_PARTENAIRE WHERE ID_PARTENAIRE_SERVICE = ?', [grouped[0].ID_PARTENAIRE_SERVICE]))[0]
                              var sqlQuery = `
                              INSERT INTO driver_course(
                                        ID_CATEGORIE_COURSE,
                                        ID_LIVREUR,
                                        ADDRESSE_PICKER,
                                        ADRESSE_DEST
                              )
                              VALUES(?, ?, ?, ?)
                              `
                              const { insertId: ID_DRIVER_COURSE } = await query(sqlQuery, [1, livreur.ID_LIVREUR, partenaireService.ADRESSE_COMPLETE, shipping_info.ADRESSE])
                              const commandesIds = []
                              await Promise.all(grouped.map(async (commande) => {
                                        const CODE_UNIQUE = await getReferenceCode()
                                        var TOTAL = 0
                                        commande.products.forEach(c => {
                                                  TOTAL += c.PRIX * c.QUANTITE
                                        })
                                        const { insertId } = await restaurant_commandes_model.createCommandesResto(
                                                  PAYEMENT_ID,
                                                  commande.ID_PARTENAIRE_SERVICE,
                                                  req.userId,
                                                  DATE_LIVRAISON,
                                                  CODE_UNIQUE,
                                                  TOTAL,
                                                  ID_DETAILS_LIVRAISON,
                                                  1,
                                                  ID_DRIVER_COURSE
                                        )
                                        commandesIds.push(insertId)
                                        commande.products.forEach(commande => {
                                                  restaurant_commande_details.push([
                                                            insertId,
                                                            commande.ID_RESTAURANT_MENU,
                                                            commande.QUANTITE,
                                                            commande.PRIX,
                                                            commande.QUANTITE * commande.PRIX,
                                                            commande.ID_COMBINATION
                                                  ])
                                        })
                              }))
                              await restaurant_commandes_model.createCommandeDetailsResto(restaurant_commande_details);
                              res.status(RESPONSE_CODES.CREATED).json({
                                        statusCode: RESPONSE_CODES.CREATED,
                                        httpStatus: RESPONSE_STATUS.CREATED,
                                        message: "Enregistrement reussi avec succès",
                                        result: {
                                                  ID_COMMANDE: commandesIds[0]
                                        }
                              })
                    } else {
                              return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                                        statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                                        httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                                        message: ecoData.message || 'Erreur inconnue, réessayer plus tard',
                              })
                    }
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

const getRestoCommandes = async (req, res) => {
          try {
                    const { ID_PARTENAIRE_SERVICE, ID_USER } = req.query
                    var commandesIds = []
                    const commandes = await restaurant_commandes_model.findAllCommandes(ID_PARTENAIRE_SERVICE, ID_USER)
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
                                        details: myDetails.map(detail => ({
                                                  ...detail
                                        }))
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

const updateRestoStatus = async (req, res) => {
          try {
                    const { ID_COMMANDE } = req.params
                    const { ID_STATUT } = req.body
                    const updateStatus = await query("UPDATE restaurant_commandes SET ID_STATUT = ? WHERE ID_COMMANDE=?", [ID_STATUT, ID_COMMANDE]);
                    await restaurant_commandes_model.saveStatusResto(ID_COMMANDE, req.userId, ID_STATUT)
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "succès",
                              result: {
                                        ID_STATUT
                              }
                    })
          } catch (error) {
                    console.log(error)
                    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                              statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                              httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                              message: "Erreur interne du serveur, réessayer plus tard",

                    })
          }
}

/**
 * Permet de récuperer les details de livraison et du livreur d'une commande
 * @author Vanny Boy <vanny@mediabox.bi>
 * @date 8/02/2023
 * @param {express.Request} req 
 * @param {express.Response} res
 */
const getLivraisonDetails = async (req, res) => {
        try {
                  const { ID_COMMANDE } = req.params
                  const livraisonSqlQuery = `
                  SELECT d.*,
                            u.NOM CLIENT_NOM,
                            u.PRENOM CLIENT_PRENOM,
                            c.ID_DRIVER_COURSE
                  FROM restaurant_commandes c
                            LEFT JOIN driver_details_livraison d ON d.ID_DETAILS_LIVRAISON = c.ID_DETAILS_LIVRAISON
                            LEFT JOIN users u ON u.ID_USER = c.ID_USER
                  WHERE c.ID_COMMANDE = ?
                  `
                  const livraison = (await query(livraisonSqlQuery, [ID_COMMANDE]))[0]
                  const livreurSqlQuery = `
                  SELECT pl.*,
                            dc.ADDRESSE_PICKER
                  FROM driver_course dc
                            LEFT JOIN personne_livreurs pl ON pl.ID_LIVREUR = dc.ID_LIVREUR
                  WHERE ID_DRIVER_COURSE = ?
                  `
                  const livreur = (await query(livreurSqlQuery, [livraison.ID_DRIVER_COURSE]))[0]
                  res.status(RESPONSE_CODES.OK).json({
                            statusCode: RESPONSE_CODES.OK,
                            httpStatus: RESPONSE_STATUS.OK,
                            message: "Livraison et livreur de la commannde",
                            result: {
                                      livraison,
                                      livreur
                            }
                  })
        } catch (error) {
                  console.log(error)
                  res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                            message: "Erreur interne du serveur, réessayer plus tard",
                  })
        }
}

/**
 * Permet de récuperer les historiques de statut d'une commande
 * @author Vanny Boy <vanny@mediabox.bi>
 * @date 8/02/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getCommandeStatusHistory = async (req, res) => {
        try {
                  const { ID_COMMANDE } = req.params
                  const status = await query("SELECT * FROM restaurant_commande_statut ORDER BY ID_STATUT")
                  const commandesStatus = await query("SELECT * FROM restaurant_commande_statut_historiques WHERE ID_COMMANDE = ? ORDER BY DATE_INSERTION ASC", [ID_COMMANDE])

                  const details = commandesStatus.map(history => {
                            const stt = status.find(hist => hist.ID_STATUT == history.ID_STATUT)
                            return {
                                      ...history,
                                      ...stt
                            }
                  })
                  const uncompletedStatus = status.filter(stt => details.filter(stt2 => stt.ID_STATUT == stt2.ID_STATUT).length == 0)
                  res.status(RESPONSE_CODES.OK).json({
                            statusCode: RESPONSE_CODES.OK,
                            httpStatus: RESPONSE_STATUS.OK,
                            message: "Historiques des status d'une commande",
                            result: [
                                      ...details.map(t => ({ ...t, completed: true })),
                                      ...uncompletedStatus.map(t => ({ ...t, completed: false }))
                            ]
                  })
        } catch (error) {
                  console.log(error)
                  res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                            message: "Erreur interne du serveur, réessayer plus tard",
                  })
        }
}

module.exports = {
          getRestoCommandes,
          updateRestoStatus,
          createRestoCommande,
          getLivraisonDetails,
          getCommandeStatusHistory
}