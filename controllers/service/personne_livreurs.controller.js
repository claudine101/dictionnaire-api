const Validation = require("../../class/Validation");
const express = require('express');
const PartenaireUpload = require("../../class/uploads/PartenaireUpload");
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS");
const partenaire_service_model  = require('../../models/partenaire/partenaire_service.model')
const personne_livreurs_model  = require('../../models/service/personne_livreurs.model');
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS");

/**
 * Permet d'enregistrer un nouveau livreur ou chauffeur
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @returns 
 */
const createLivreur = async (req, res) => {
          try {
                    const { ID_PARTENAIRE, ID_SERVICE, NOM, PRENOM, TELEPHONE, NIF, EMAIL, NUMERO_PLAQUE, MODELE, MARQUE, NOMBRE_PLACE } = req.body
                    const { IMAGE_1, IMAGE_2 } = req.files || {}

                    const validation = new Validation({ ...req.body, ...req.files },
                              {
                                        IMAGE_1: {
                                                  image: 21000000,
                                                  required: true,
                                        },
                                        IMAGE_2: {
                                                  image: 21000000,
                                                  required: true,
                                        },
                                        NOM:
                                        {
                                                  required: true,
                                        },
                                        PRENOM:
                                        {
                                                  required: true,
                                        },
                                        EMAIL:
                                        {
                                                  required: true,
                                        },
                                        NUMERO_PLAQUE:
                                        {
                                                  required: true,
                                        },
                                        MODELE:
                                        {
                                                  required: true,
                                        },
                                        MARQUE:
                                        {
                                                  required: true,
                                        },
                                        NOMBRE_PLACE:
                                        {
                                                  required: true,
                                        },
                                        TELEPHONE: {
                                                  required: true,
                                        },

                              },
                              {
                                        IMAGE_1: {
                                                  image: "La taille invalide"
                                        },
                                        IMAGE_1: {
                                                  image: "La taille invalide"
                                        },
                                        NOM: {
                                                  nom: "Le nom est obligatoire"
                                        },
                                        PRENOM: {
                                                  prenom: "Le prenom est obligatoire"
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
                    var Image3 = null
                    const { fileInfo: fileInfo_1 } = await partenaireUpload.upload(IMAGE_1, false)
                    const Image1 = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.partenaires}/${fileInfo_1.fileName}`;

                    const { fileInfo: fileInfo_2 } = await partenaireUpload.upload(IMAGE_2, false)
                    const Image2 = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.partenaires}/${fileInfo_2.fileName}`;
                    const { insertId } = await partenaire_service_model.createPartenaireService(
                              ID_PARTENAIRE,
                              ID_SERVICE,
                              1,
                              `${NOM} ${PRENOM}`,
                              TELEPHONE,
                              NIF,
                              EMAIL,
                              Image1,
                              Image2
                    )

                    const { insertId: ID_LIVREUR } = await personne_livreurs_model.insertLivreur(
                              insertId,
                              NOM,
                              PRENOM,
                              NUMERO_PLAQUE,
                              MODELE,
                              MARQUE,
                              NOMBRE_PLACE,
                              Image1,
                              Image2,
                              Image3,

                    )
                    res.status(RESPONSE_CODES.CREATED).json({
                              statusCode: RESPONSE_CODES.CREATED,
                              httpStatus: RESPONSE_STATUS.CREATED,
                              message: "Enregistrement est fait avec succès",
                              result: {
                                        ...req.body,
                                        ID_PARTENAIRE_SERVICE: insertId,
                                        ID_LIVREUR: ID_LIVREUR
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

module.exports = {
          createLivreur
}