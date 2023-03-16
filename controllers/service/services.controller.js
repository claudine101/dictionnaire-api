
const jwt = require("jsonwebtoken");
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES');
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const generateToken = require('../../utils/generateToken');
const PartenaireUpload = require("../../class/uploads/PartenaireUpload");
const path = require("path");
const getReferenceCode = require('../../utils/getReferenceCode');
const express = require('express');
const IDS_COMMANDES_STATUTS = require('../../constants/IDS_COMMANDES_STATUTS');
const services_model = require('../../models/service/services.model');
const { query } = require("../../utils/db");

/**
 * Permet de récuper tous les services
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const findAll = async (req, res) => {
          try {
                    const { ID_SERVICE_CATEGORIE } = req.query
                    const services = await services_model.findAll(ID_SERVICE_CATEGORIE)
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "succès",
                              result: services
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

const findServicesCategories = async (req, res) => {
          try {
                    const service = await services_model.findAllCategories()
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "succès",
                              result: service
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

const getEcommerceServiceCounts = async (req, res) => {
          try {
                    const { ID_PARTENAIRE_SERVICE } = req.params
                    const items = (await query('SELECT COUNT(ep.ID_PARTENAIRE_SERVICE) AS items FROM ecommerce_produits ep WHERE ep.DATE_SUPPRESSION IS NULL AND ep.ID_PARTENAIRE_SERVICE= ?', [ID_PARTENAIRE_SERVICE]))[0]
                    const commandes = (await query(`SELECT COUNT(ID_COMMANDE) commandes FROM ecommerce_commandes WHERE ID_PARTENAIRE_SERVICE = ? AND ID_STATUT NOT IN (${IDS_COMMANDES_STATUTS.ETTENTE_PAIEMENET}, ${IDS_COMMANDES_STATUTS.LIVRE})`, [ID_PARTENAIRE_SERVICE]))[0]
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Les counts sur le service de ecommerce",
                              result: {
                                        ...items,
                                        ...commandes
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
const getRestoServiceCounts = async (req, res) => {
          try {
                    const { ID_PARTENAIRE_SERVICE } = req.params
                    const items = (await query('SELECT COUNT(ep.ID_PARTENAIRE_SERVICE) AS items FROM restaurant_menus ep WHERE ep.DATE_SUPPRESSION IS NULL AND ep.ID_PARTENAIRE_SERVICE= ?', [ID_PARTENAIRE_SERVICE]))[0]
                    const commandes = (await query(`SELECT COUNT(ID_COMMANDE) commandes FROM restaurant_commandes WHERE ID_PARTENAIRE_SERVICE = ? AND ID_STATUT NOT IN (${IDS_COMMANDES_STATUTS.ETTENTE_PAIEMENET}, ${IDS_COMMANDES_STATUTS.LIVRE})`, [ID_PARTENAIRE_SERVICE]))[0]
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Les counts sur le service de restauration",
                              result: {
                                        ...items,
                                        ...commandes
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

module.exports = {
          findServicesCategories,
          getEcommerceServiceCounts,
          getRestoServiceCounts,
          findAll
}