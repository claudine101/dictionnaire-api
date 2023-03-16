const express = require('express');
const UserUpload = require('../../class/uploads/UserUpload');
const Validation = require('../../class/Validation');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES');
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const partenaires_model = require('../../models/partenaire/partenaires.model');
const users_model = require('../../models/app/users.model');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')

/**
 * Permet de vérifier la connexion d'un partenaire
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @param {express.Request} res 
 * @param {express.Response} res 
 */
const login = async (req, res) => {
          try {
                    const { email, password, PUSH_NOTIFICATION_TOKEN, DEVICE } = req.body;
                    const validation = new Validation(
                              req.body,
                              {
                                        email: "required,email",
                                        password:
                                        {
                                                  required: true,
                                        },
                              },
                              {
                                        password:
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
                    var user = (await users_model.findPartenaireLogin(email))[0];
                    if (user) {
                              if (user.PASSWORD == md5(password)) {
                                        const notification = (await query('SELECT ID_NOTIFICATION_TOKEN FROM notification_tokens WHERE TOKEN = ? AND ID_USER = ?', [PUSH_NOTIFICATION_TOKEN, user.ID_USER]))[0]
                                        if (!notification && PUSH_NOTIFICATION_TOKEN) {
                                                  await query('INSERT INTO notification_tokens(ID_USER, DEVICE, TOKEN, ID_PROFIL) VALUES(?, ?, ?, ?)', [user.ID_USER, DEVICE, PUSH_NOTIFICATION_TOKEN, user.ID_PROFIL]);
                                        }
                                        const token = generateToken({ user: user.ID_USER }, 3 * 12 * 30 * 24 * 3600)
                                        const { PASSWORD, USERNAME, ID_TYPE_PARTENAIRE, COUNTRY_ID, ...other } = user
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
 * Permet de créer un partenaire lors de l'authentification
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @param {express.Request} res 
 * @param {express.Response} res 
 */
const createUser = async (req, res) => {
          try {
                    const { NOM, PRENOM, EMAIL, USERNAME, PASSWORD, SEXE, DATE_NAISSANCE, COUNTRY_ID, ADRESSE, TELEPHONE_1, TELEPHONE_2, PUSH_NOTIFICATION_TOKEN, DEVICE } = req.body
                    const { IMAGE } = req.files || {}
                    const validation = new Validation({ ...req.body, ...req.files },
                              {
                                        NOM:
                                        {
                                                  required: true,
                                        },
                                        IMAGE: {
                                                  image: 21000000
                                        },
                                        PRENOM:
                                        {
                                                  required: true,
                                        },
                                        EMAIL:
                                        {
                                                  required: true,
                                                  email: true,
                                                  unique: "users,EMAIL"
                                        },

                                        PASSWORD:
                                        {
                                                  required: true,
                                        },

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
                                                  required: "L'email est obligatoire",
                                                  email: "Email invalide",
                                                  unique: "Email déjà utilisé"
                                        },
                                        PASSWORD: {
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
                    const userUpload = new UserUpload()
                    var filename
                    if (IMAGE) {
                              const { fileInfo } = await userUpload.upload(IMAGE, false)
                              filename = fileInfo.fileName
                    }
                    const { insertId } = await users_model.createOne(
                              NOM,
                              PRENOM,
                              EMAIL,
                              USERNAME,
                              md5(PASSWORD),
                              2,
                              SEXE,
                              DATE_NAISSANCE,
                              COUNTRY_ID,
                              ADRESSE,
                              TELEPHONE_1,
                              TELEPHONE_2,
                              filename ? filename : null
                    )
                    const { insertId: ID_PARTENAIRE } = await partenaires_model.createOnePartenaire(insertId)
                    const user = (await users_model.findById(insertId))[0]
                    const notification = (await query('SELECT ID_NOTIFICATION_TOKEN FROM notification_tokens WHERE TOKEN = ? AND ID_USER = ?', [PUSH_NOTIFICATION_TOKEN, user.ID_USER]))[0]
                    if (!notification && PUSH_NOTIFICATION_TOKEN) {
                              await query('INSERT INTO notification_tokens(ID_USER, DEVICE, TOKEN, ID_PROFIL) VALUES(?, ?, ?, ?)', [user.ID_USER, DEVICE, PUSH_NOTIFICATION_TOKEN, user.ID_PROFIL]);
                    }
                    const token = generateToken({ user: user.ID_USER }, 3 * 12 * 30 * 24 * 3600)
                    const { PASSWORD: pw, USERNAME: usr, COUNTRY_ID: ctr, ...other } = user
                    res.status(RESPONSE_CODES.CREATED).json({
                              statusCode: RESPONSE_CODES.CREATED,
                              httpStatus: RESPONSE_STATUS.CREATED,
                              message: "Enregistrement est fait avec succès",
                              result: {
                                        ...other,
                                        ID_PARTENAIRE: ID_PARTENAIRE,
                                        token
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

module.exports = {
          login,
          createUser
}