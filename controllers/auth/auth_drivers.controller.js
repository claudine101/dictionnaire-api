const express = require('express');
const Validation = require('../../class/Validation');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES');
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const drivers_model = require('../../models/drivers/drivers.model');
// const drivers_model = require('../../models/app/users.model');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5');
const UserUpload = require('../../class/uploads/UserUpload');
const moment = require("moment")


/**
 * Permet de vérifier la connexion d'un rider
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @param {express.Request} res 
 * @param {express.Response} res 
 */
const login = async (req, res) => {
          try {
                    const { USERNAME, MOT_DE_PASSE } = req.body;
                    const validation = new Validation(
                              req.body,
                              {
                                        USERNAME: "required,email",
                                        MOT_DE_PASSE:
                                        {
                                                  required: true,
                                        },
                              },
                              {
                                        MOT_DE_PASSE:
                                        {
                                                  required: "Mot de passe est obligatoire",
                                        },
                                        email: {
                                                  required: "L'email est obligatoire",
                                                  email: "Email invalide"
                                        }
                              }
                    );
                    await validation.run();
                    const isValid = await validation.isValidate()
                    const errors = await validation.getErrors()
                    if (!isValid) {
                              return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                                        statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                                        httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                                        message: "Probleme de validation des donnees",
                                        result: errors
                              })
                    }
                    var user = (await drivers_model.findUserLogin(USERNAME))[0];
                    if (user) {
                              if (user.MOT_DE_PASSE == md5(MOT_DE_PASSE)) {
                                        const token = generateToken({ user: user.ID_USER }, 3 * 12 * 30 * 24 * 3600)
                                        const { MOT_DE_PASSE, USERNAME, ...other } = user
                                        res.status(RESPONSE_CODES.CREATED).json({
                                                  statusCode: RESPONSE_CODES.CREATED,
                                                  httpStatus: RESPONSE_STATUS.CREATED,
                                                  message: "Vous êtes connecté avec succès",
                                                  result: {
                                                            ...other,
                                                            token
                                                  }
                                        })
                              } else {
                                        validation.setError('main', 'Identifiants incorrects')
                                        const errors = await validation.getErrors()
                                        res.status(RESPONSE_CODES.NOT_FOUND).json({
                                                  statusCode: RESPONSE_CODES.NOT_FOUND,
                                                  httpStatus: RESPONSE_STATUS.NOT_FOUND,
                                                  message: "Utilisateur n'existe pas",
                                                  result: errors
                                        })
                              }
                    } else {
                              validation.setError('main', 'Identifiants incorrects')
                              const errors = await validation.getErrors()
                              res.status(RESPONSE_CODES.NOT_FOUND).json({
                                        statusCode: RESPONSE_CODES.NOT_FOUND,
                                        httpStatus: RESPONSE_STATUS.NOT_FOUND,
                                        message: "Utilisateur n'existe pas",
                                        result: errors
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

/**
 * Permet de créer un drivers lors de l'authentification
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @param {express.Request} res 
 * @param {express.Response} res 
 */
const createDrivers = async (req, res) => {
          try {
                    const { NOM, PRENOM, EMAIL, USERNAME,MOT_DE_PASSE , DATE_NAISSANCE } = req.body
                    const { IMAGE } = req.files || {}
                    const validation = new Validation({ ...req.body, ...req.files },
                              {
                                        NOM:
                                        {
                                                  required: true,
                                        },
                                        PRENOM:
                                        {
                                                  required: true,
                                        },
                                        MOT_DE_PASSE:
                                        {
                                                  required: true,
                                        },
                                        IMAGE: {
                                                  image: 21000000
                                        },
                                       
                                        EMAIL:
                                        {
                                                  email: true,
                                                  unique: "drivers,EMAIL"
                                        }

                              },
                              {
                                        IMAGE: {
                                                  IMAGE: "La taille invalide"
                                        },
                                        NOM: {
                                                  required: "Le nom est obligatoire"
                                        },
                                        PRENOM: {
                                                  required: "Le prenom est obligatoire"
                                        },
                                        EMAIL: {
                                                  email: "Email invalide",
                                                  unique: "Email déjà utilisé"
                                        },
                                        MOT_DE_PASSE: {
                                                  required: "Le mot de passe est obligatoire"
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
                    const usersUpload=new UserUpload()
                    var filename
                    if (IMAGE) {
                              const { fileInfo } = await usersUpload.upload(IMAGE, false)
                              filename = fileInfo.fileName
                    }
                    const { insertId: ID_DRIVER } = await drivers_model.createOne(
                              NOM,
                              PRENOM,
                              USERNAME ?  USERNAME :null,
                              EMAIL ? EMAIL :null,
                              md5(MOT_DE_PASSE),
                              DATE_NAISSANCE ? moment(DATE_NAISSANCE).format("YYYY-MM-DD HH:mm:ss") :null,
                              filename ? filename : null
                    )
                    const drivers= await drivers_model.findById(ID_DRIVER)
                    res.status(RESPONSE_CODES.CREATED).json({
                              statusCode: RESPONSE_CODES.CREATED,
                              httpStatus: RESPONSE_STATUS.CREATED,
                              message: "Enregistrement est fait avec succès",
                              result: {
                                drivers: drivers,
                              }
                    })
          }
          catch (error) {
                    console.log(error)
                    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                              statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                              httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                              message: "Enregistrement echoue",
                    })
          }
}

/**
 * Permet de modifier un drivers 
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @param {express.Request} res 
 * @param {express.Response} res 
 */
const updateDrivers = async (req, res) => {
    try {
        const { ID_DRIVER } = req.params
     
              const { NOM, PRENOM, EMAIL, USERNAME,MOT_DE_PASSE , DATE_NAISSANCE } = req.body
              const { IMAGE } = req.files || {}
              const validation = new Validation({ ...req.body, ...req.files },
                        {
                                  NOM:
                                  {
                                            required: true,
                                  },
                                  PRENOM:
                                  {
                                            required: true,
                                  },
                                  MOT_DE_PASSE:
                                  {
                                            required: true,
                                  },
                                  IMAGE: {
                                            image: 21000000
                                  },
                                 
                                  EMAIL:
                                  {
                                            email: true,
                                            // unique: "drivers,EMAIL"
                                  }

                        },
                        {
                                  IMAGE: {
                                            IMAGE: "La taille invalide"
                                  },
                                  NOM: {
                                            required: "Le nom est obligatoire"
                                  },
                                  PRENOM: {
                                            required: "Le prenom est obligatoire"
                                  },
                                  EMAIL: {
                                            email: "Email invalide",
                                            // unique: "Email déjà utilisé"
                                  },
                                  MOT_DE_PASSE: {
                                            required: "Le mot de passe est obligatoire"
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
              var emailSeach = (await drivers_model.searchEmail(ID_DRIVER,EMAIL));
              if(emailSeach.length==0){
                 
              const usersUpload=new UserUpload()
              var filename
              if (IMAGE) {
                        const { fileInfo } = await usersUpload.upload(IMAGE, false)
                        filename = fileInfo.fileName
              }
              const { insertId } = await drivers_model.updateOne(
                        NOM,
                        PRENOM,
                        USERNAME ?  USERNAME :null,
                        EMAIL ? EMAIL :null,
                        md5(MOT_DE_PASSE),
                        DATE_NAISSANCE ? moment(DATE_NAISSANCE).format("YYYY-MM-DD HH:mm:ss") :null,
                        filename ? filename : null,
                        ID_DRIVER
              )
              const drivers= await drivers_model.findById(ID_DRIVER)
              res.status(RESPONSE_CODES.CREATED).json({
                        statusCode: RESPONSE_CODES.CREATED,
                        httpStatus: RESPONSE_STATUS.CREATED,
                        message: "modification  est fait avec succès",
                        result: {
                          drivers: drivers,
                        }
              })
              }
              else {
                validation.setError('main', 'Email existe')
                const errors = await validation.getErrors()
                res.status(RESPONSE_CODES.NOT_FOUND).json({
                          statusCode: RESPONSE_CODES.NOT_FOUND,
                          httpStatus: RESPONSE_STATUS.NOT_FOUND,
                          message: "Email existe",
                          result: errors
                })
      }

    }
    catch (error) {
              console.log(error)
              res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                        statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                        message: "modification echoue",
              })
    }
}

module.exports = {
          login,
          createDrivers,
          updateDrivers
}