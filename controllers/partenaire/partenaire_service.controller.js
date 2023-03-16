const express = require('express')
const PartenaireUpload = require('../../class/uploads/PartenaireUpload')
const Validation = require('../../class/Validation')
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS')
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const services_model = require('../../models/service/services.model')
const partenaire_service_model = require('../../models/partenaire/partenaire_service.model')
const { query } = require('../../utils/db')
const moment = require("moment")

/**
 * Permet de trouver les services d'un partenaire
 * @param { express.Request } req 
 * @param { express.Response } res 
 */
const findPartenaireServices = async (req, res) => {
        try {
                const { ID_PARTENAIRE } = req.params
                const services = await services_model.findPartenaireServices(ID_PARTENAIRE)
                res.status(RESPONSE_CODES.OK).json({
                        statusCode: RESPONSE_CODES.OK,
                        httpStatus: RESPONSE_STATUS.OK,
                        message: "Les services d'un partenaire",
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

/**
 * Permet de créer un nouveau service de ecommerce ou de resto d'un partenaire
 * @param { express.Request } req 
 * @param { express.Response } res 
 */
const createPartenaireService = async (req, res) => {
        try {
                const { ID_TYPE_PARTENAIRE, NOM_ORGANISATION, TELEPHONE, NIF, EMAIL, ADRESSE_COMPLETE, LATITUDE, LONGITUDE, ID_SERVICE } = req.body
                const { LOGO, BACKGROUND_IMAGE } = req.files || {}
                const partenaire = (await query('SELECT * FROM partenaires WHERE ID_USER = ?', [req.userId]))[0]
                if (!partenaire) throw new Error("Partenaire not found")
                const validation = new Validation({ ...req.body, ...req.files },
                        {
                                LOGO: {
                                        image: 21000000,
                                        required: true
                                },
                                BACKGROUND_IMAGE: {
                                        image: 21000000
                                },
                        },
                        {
                                LOGO: {
                                        image: "La taille invalide"
                                },
                                BACKGROUND_IMAGE: {
                                        image: "La taille invalide"
                                },
                        }
                )
                await validation.run();
                const isValide = await validation.isValidate()
                const errors = await validation.getErrors()
                if (!isValide) {
                        return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                                message: "Probleme de validation des donnees",
                                result: errors
                        })
                }
                const partenaireUpload = new PartenaireUpload()
                var backgoundImage = null
                const { fileInfo: fileInfo_1 } = await partenaireUpload.upload(LOGO, false)
                const logoImage = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.partenaires}/${fileInfo_1.fileName}`;
                if (BACKGROUND_IMAGE) {
                        const { fileInfo: fileInfo_2 } = await partenaireUpload.upload(BACKGROUND_IMAGE, false)
                        backgoundImage = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.partenaires}/${fileInfo_2.fileName}`;
                }
                const { insertId } = await partenaire_service_model.createPartenaireService(
                        partenaire.ID_PARTENAIRE,
                        ID_SERVICE,
                        ID_TYPE_PARTENAIRE,
                        NOM_ORGANISATION,
                        TELEPHONE,
                        ID_TYPE_PARTENAIRE == 2 ? NIF : null,
                        EMAIL,
                        logoImage,
                        backgoundImage,
                        ID_TYPE_PARTENAIRE == 2 ? ADRESSE_COMPLETE : null,
                        LATITUDE,
                        LONGITUDE
                )
                res.status(RESPONSE_CODES.CREATED).json({
                        statusCode: RESPONSE_CODES.CREATED,
                        httpStatus: RESPONSE_STATUS.CREATED,
                        message: "Enregistrement est fait avec succès",
                        result: {
                                ...req.body,
                                ID_PARTENAIRE_SERVICE: insertId
                        }
                })
        } catch (error) {
                console.log(error)
                res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                        statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                        message: "Enregistrement echoue",
                })
        }
}
const findAll = async (req, res) => {
        try {
                const { ID_SERVICE_CATEGORIE, q, limit, offset } = req.query
                const partenaires = await partenaire_service_model.findAll(ID_SERVICE_CATEGORIE, q, limit, offset)
                res.status(RESPONSE_CODES.OK).json({
                        statusCode: RESPONSE_CODES.OK,
                        httpStatus: RESPONSE_STATUS.OK,
                        message: "Liste des partenaires",
                        result: partenaires
                })
        } catch (error) {
                console.log(error)
                res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                        statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                        message: "Enregistrement echoue",
                })
        }
}

const modifierPartenaireService = async (req, res) => {
        try {
                const { NOM_ORGANISATION,
                        TELEPHONE,
                        NIF,
                        EMAIL,
                        ADRESSE_COMPLETE,
                        LATITUDE,
                        LONGITUDE,
                        ID_SERVICE,
                        LOGO:LOGO_DEFAULT,
                        BACKGROUND_IMAGE:BACKGROUND_IMAGE_DEFAULT
                } = req.body
                const { ID_PARTENAIRE_SERVICE } = req.params
                const { LOGO, BACKGROUND_IMAGE } = req.files || {}
                const partenaire = (await query('SELECT * FROM partenaires WHERE ID_USER = ?', [req.userId]))[0]
                if (!partenaire) throw new Error("Partenaire not found")
                const validation = new Validation({ ...req.body, ...req.files },
                        {
                                // LOGO: {
                                //         image: 21000000,
                                //         required: true
                                // },
                                // BACKGROUND_IMAGE: {
                                //         image: 21000000
                                // },
                        },
                        {
                                // LOGO: {
                                //         image: "La taille invalide"
                                // },
                                // BACKGROUND_IMAGE: {
                                //         image: "La taille invalide"
                                // },
                        }
                )
                await validation.run();
                const isValide = await validation.isValidate()
                const errors = await validation.getErrors()
                if (!isValide) {
                        return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                                message: "Probleme de validation des donnees",
                                result: errors
                        })
                }
                const partenaireUpload = new PartenaireUpload()
                // var backgoundImage = null
                var logoImage
                var backgoundImage
                if(LOGO){
                        const { fileInfo: fileInfo_1 } = await partenaireUpload.upload(LOGO, false)
                        logoImage = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.partenaires}/${fileInfo_1.fileName}`;
                }else if(LOGO_DEFAULT){
                        logoImage=LOGO_DEFAULT
                }else{
                        logoImage=null
                }
                
                if (BACKGROUND_IMAGE) {
                        const { fileInfo: fileInfo_2 } = await partenaireUpload.upload(BACKGROUND_IMAGE, false)
                        backgoundImage = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.partenaires}/${fileInfo_2.fileName}`;
                }else if(BACKGROUND_IMAGE_DEFAULT){
                        backgoundImage=BACKGROUND_IMAGE_DEFAULT
                }else{
                        backgoundImage=null
                }
                const { insertId } = await partenaire_service_model.updatePartenaireService(
                        partenaire.ID_PARTENAIRE,
                        ID_SERVICE,
                        2,
                        NOM_ORGANISATION,
                        TELEPHONE,
                        NIF ? NIF : null,
                        EMAIL,
                        logoImage ? backgoundImage : null,
                        backgoundImage ? backgoundImage : backgoundImage,
                        ADRESSE_COMPLETE ? ADRESSE_COMPLETE : null,
                        LATITUDE,
                        LONGITUDE,
                        2,
                        ID_PARTENAIRE_SERVICE
                )
                res.status(RESPONSE_CODES.CREATED).json({
                        statusCode: RESPONSE_CODES.CREATED,
                        httpStatus: RESPONSE_STATUS.CREATED,
                        message: "Enregistrement est fait avec succès",
                        result: {
                                ...req.body,
                                ID_PARTENAIRE_SERVICE: insertId
                        }
                })
        } catch (error) {
                console.log(error)
                res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                        statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                        message: "Enregistrement echoue",
                })
        }
}

const deletePartenaireService = async (req, res) => {
        try {
            const { ID_PARTENAIRE_SERVICE } = req.params
                await query("UPDATE partenaire_service SET DATE_SUPPRESSION=? WHERE ID_PARTENAIRE_SERVICE=? ",[moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), ID_PARTENAIRE_SERVICE])
    
            res.status(RESPONSE_CODES.CREATED).json({
                statusCode: RESPONSE_CODES.CREATED,
                httpStatus: RESPONSE_STATUS.CREATED,
                message: "La suppression de la boutique est fait avec succès",
                result: {
                        ID_PARTENAIRE_SERVICE
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
        findPartenaireServices,
        createPartenaireService,
        findAll,
        modifierPartenaireService,
        deletePartenaireService
}