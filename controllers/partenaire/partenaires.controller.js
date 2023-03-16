const express = require('express')
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS')
const { query } = require('../../utils/db')
const partenaires_model = require("../../models/partenaire/partenaires.model")
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const findPartenairesTypes = async (req, res) => {
          try {
                    const types = await query('SELECT * FROM partenaires_types')
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Les services d'un partenaire",
                              result: types
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

const createEcommerce_boutique_suivis = async (req, res) => {
        try {
    
            const { ID_PARTENAIRE_SERVICE } = req.params
            const suivis = (await query('SELECT * FROM ecommerce_boutique_suivis WHERE ID_USER = ? AND ID_PARTENAIRE_SERVICE=?', [req.userId, ID_PARTENAIRE_SERVICE]))[0]
    
    
            if (suivis) {
                await query('DELETE FROM ecommerce_boutique_suivis WHERE ID_PARTENAIRE_SERVICE=? AND ID_USER=? ', [ID_PARTENAIRE_SERVICE, req.userId])
                res.status(RESPONSE_CODES.CREATED).json({
                    statusCode: RESPONSE_CODES.CREATED,
                    httpStatus: RESPONSE_STATUS.CREATED,
                    message: "La suppression de suivis",
    
                })
    
            } else {
                const { insertId } = await partenaires_model.createBoutiqueSuivis(
                    ID_PARTENAIRE_SERVICE,
                    req.userId
                )
                res.status(RESPONSE_CODES.CREATED).json({
                    statusCode: RESPONSE_CODES.CREATED,
                    httpStatus: RESPONSE_STATUS.CREATED,
                    message: "Enregistrement est fait avec succès",
                })
            }
    
    
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
          findPartenairesTypes,
          createEcommerce_boutique_suivis
}