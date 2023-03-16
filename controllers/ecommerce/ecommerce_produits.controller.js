const ProductUpload = require("../../class/uploads/ProductUpload")
const Validation = require("../../class/Validation")
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const ecommerce_produits_model = require("../../models/ecommerce/ecommerce_produits.model")
const { query } = require("../../utils/db")
const moment = require("moment")

/**
 * Controller pour afficher les produits et produits par fitre faites par un utilisateur
 * @author Innocent <ndayikengurukiye.innocent@mediabox.bi>
 **/
const getAllProducts = async (req, res) => {
    try {
        const { q, category, subCategory, partenaireService, limit, offset, order_by,min_prix, max_prix} = req.query
        const allProducts = await ecommerce_produits_model.findproducts(q, category, subCategory, partenaireService, limit, offset, req.userId,min_prix, max_prix,order_by)
        const products = allProducts.map(product => {
            return {
                produit: {
                    ID_PRODUIT: product.ID_PRODUIT,
                    NOM: product.NOM,
                    ID_PRODUIT_PARTENAIRE: product.ID_PRODUIT_PARTENAIRE,
                    IMAGE: product.IMAGE_1,
                    ID_WISHLIST: product.ID_WISHLIST,
                    ID_NOTE: product.ID_NOTE,
                    AVG: product.MOYENNE,
                    COMMANDES:product.COMMANDES
                },
                partenaire: {
                    NOM_ORGANISATION: product.NOM_ORGANISATION,
                    ID_PARTENAIRE: product.ID_PARTENAIRE,
                    ID_TYPE_PARTENAIRE: product.ID_TYPE_PARTENAIRE,
                    NOM: product.NOM_USER,
                    PRENOM: product.PRENOM,
                    ADRESSE_COMPLETE: product.ADRESSE_COMPLETE,
                    ID_SERVICE: product.ID_SERVICE,
                    LOGO: product.LOGO,
                    BACKGROUND_IMAGE: product.BACKGROUND_IMAGE,
                    EMAIL: product.EMAIL,
                    TELEPHONE: product.TELEPHONE,
                    ID_PARTENAIRE_SERVICE: product.ID_PARTENAIRE_SERVICE,
                },
                produit_partenaire: {
                    ID_PARTENAIRE_SERVICE: product.ID_PARTENAIRE_SERVICE,
                    NOM_ORGANISATION: product.NOM_ORGANISATION,
                    NOM: product.NOM_PRODUIT_PARTENAIRE,
                    DESCRIPTION: product.DESCRIPTION,
                    IMAGE_1: product.IMAGE_1,
                    IMAGE_2: product.IMAGE_2,
                    IMAGE_3: product.IMAGE_3,
                    TAILLE: product.NOM_TAILLE,
                    PRIX: product.PRIX
                },
                categorie: {
                    ID_CATEGORIE_PRODUIT: product.ID_CATEGORIE_PRODUIT,
                    NOM: product.NOM_CATEGORIE
                },
                sous_categorie: {
                    ID_PRODUIT_SOUS_CATEGORIE: product.ID_PRODUIT_SOUS_CATEGORIE,
                    NOM: product.NOM_SOUS_CATEGORIE
                },
                stock: {
                    QUANTITE_TOTAL:product.	QUANTITE_TOTAL
                }
            }
        }
        )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des produits",
            result: products
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

const createProduit = async (req, res) => {
    try {
        const {
            ID_PARTENAIRE_SERVICE,
            ID_CATEGORIE_PRODUIT,
            ID_PRODUIT_SOUS_CATEGORIE,
            NOM,
            DESCRIPTION,
            MONTANT,
            variants: varStr,
            inventories: invStr
        } = req.body
        var variants, inventories
        if (varStr) variants = JSON.parse(varStr)
        if (invStr) inventories = JSON.parse(invStr)
        const { IMAGE_1, IMAGE_2, IMAGE_3 } = req.files || {}
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                IMAGE_1: {
                    required: true,
                    image: 21000000
                },
                ID_CATEGORIE_PRODUIT: {
                    required: true
                },
                IMAGE_2: {
                    image: 21000000
                },
                IMAGE_3: {
                    image: 21000000
                },
                NOM: {
                    required: true,
                    length: [1, 100],
                },
                DESCRIPTION: {
                    length: [1, 3000],
                },
                MONTANT: {
                    required: true,
                },
            },
            {
                IMAGE_1: {
                    required: "Image d'un produit est obligatoire",
                    image: "Veuillez choisir une image valide",
                    size: "L'image est trop volumineux"
                },
                IMAGE_2: {
                    image: "Veuillez choisir une image valide",
                    size: "L'image est trop volumineux"
                },
                IMAGE_3: {
                    image: "Veuillez choisir une image valide",
                    size: "L'image est trop volumineux"
                },
                ID_CATEGORIE_PRODUIT: {
                    exists: "categorie invalide",
                },
                ID_PRODUIT_SOUS_CATEGORIE: {
                    exists: "sous categorie invalide",
                },
                NOM: {
                    required: "nom du produit  est obligatoire",
                    length: "Nom du produit invalide"
                },
                DESCRIPTION: {
                    required: "Vérifier la taille de votre description(max: 3000 caractères)",
                },
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
        const productUpload = new ProductUpload()
        var filename_2
        var filename_3
        const { fileInfo: fileInfo_1, thumbInfo: thumbInfo_1 } = await productUpload.upload(IMAGE_1, false)
        if (IMAGE_2) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await productUpload.upload(IMAGE_2, false)
            filename_2 = fileInfo_2
        }
        if (IMAGE_3) {
            const { fileInfo: fileInfo_3, thumbInfo: thumbInfo_3 } = await productUpload.upload(IMAGE_3, false)
            filename_3 = fileInfo_3
        }
        var quantite_total = 0
        if (inventories && inventories.length > 0) {
            inventories.forEach(inventory => {
                quantite_total += parseInt(inventory.quantity) 
            })
        }
        const { insertId: ID_PRODUIT } = await ecommerce_produits_model.createProduit(
            ID_CATEGORIE_PRODUIT,
            ID_PRODUIT_SOUS_CATEGORIE ? ID_PRODUIT_SOUS_CATEGORIE : null,
            NOM,
            MONTANT,
            DESCRIPTION ? DESCRIPTION : null,
            ID_PARTENAIRE_SERVICE,
            `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.products}/${fileInfo_1.fileName}`,
            filename_2 ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.products}/${filename_2.fileName}` : null,
            filename_3 ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.products}/${filename_3.fileName}` : null,
            quantite_total ? quantite_total : 1
        )
        if (variants && variants.length > 0) {
            await Promise.all(variants.map(async variant => {
                const { insertId: ID_VARIANT } = await query('INSERT INTO ecommerce_produit_variants(ID_PRODUIT, FRONTEND_VARIANT_ID, VARIANT_NAME) VALUES(?, ?, ?)', [
                    ID_PRODUIT, variant.id, variant.variantName
                ])
                const ecommerce_variant_values = []
                variant.options.forEach(option => {
                    ecommerce_variant_values.push([
                        ID_PRODUIT,
                        ID_VARIANT,
                        option.id,
                        option.name
                    ])
                })
                if (ecommerce_variant_values.length > 0) {
                    await query('INSERT INTO ecommerce_variant_values(ID_PRODUIT, ID_VARIANT, FRONTEND_VALUE_ID, VALUE_NAME) VALUES ?', [ecommerce_variant_values])
                }
            }))
        }
        if (inventories && inventories.length > 0) {
            const ecommerce_variant_combination = []
            inventories.forEach(inventory => {
                ecommerce_variant_combination.push([ID_PRODUIT, inventory.quantity, inventory.price, inventory.id])
            })
            if (ecommerce_variant_combination.length > 0) {
                await query('INSERT INTO ecommerce_variant_combination(ID_PRODUIT, QUANTITE, PRIX, FRONTEND_COMBINAISON_ID) VALUES ?', [ecommerce_variant_combination])
            }
            const newCombinaisons = await query('SELECT * FROM ecommerce_variant_combination WHERE ID_PRODUIT = ?', [ID_PRODUIT])
            const values = await query('SELECT * FROM ecommerce_variant_values WHERE ID_PRODUIT = ?', [ID_PRODUIT])
            var ecommerce_variant_combination_values = []

            newCombinaisons.forEach(combinaison => {
                const myInventory = inventories.find(inv => inv.id == combinaison.FRONTEND_COMBINAISON_ID)
                const itemsWithIds = myInventory.items.map(item => {
                    const myValue = values.find(val => val.FRONTEND_VALUE_ID == item.id)
                    return {
                        ...item,
                        ID_VALUE: myValue.ID_VALUE
                    }
                })
                itemsWithIds.forEach(item => {
                    ecommerce_variant_combination_values.push([combinaison.ID_COMBINATION, item.ID_VALUE])
                })
            })
            if (ecommerce_variant_combination_values.length > 0) {
                await query('INSERT INTO ecommerce_variant_combination_values(ID_COMBINATION, ID_VALUE) VALUES ?', [ecommerce_variant_combination_values])
            }
        }
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Enregistrement du produit est fait avec succès",
            result: {
                ID_PRODUIT
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

const getCategories = async (req, res) => {
    try {
        const categories = await query('SELECT * FROM ecommerce_produit_categorie')
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des categories",
            result: categories
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
const createEcommerce_wishlist_produit = async (req, res) => {
    try {

        const { ID_PRODUIT } = req.params
        const wishlist = (await query('SELECT * FROM ecommerce_wishlist_produit WHERE ID_USER = ? AND ID_PRODUIT=?', [req.userId, ID_PRODUIT]))[0]


        if (wishlist) {
            await query('DELETE FROM ecommerce_wishlist_produit WHERE  ID_PRODUIT=? AND ID_USER=? ', [ID_PRODUIT, req.userId])
            res.status(RESPONSE_CODES.CREATED).json({
                statusCode: RESPONSE_CODES.CREATED,
                httpStatus: RESPONSE_STATUS.CREATED,
                message: "La suppression du wishlist",

            })

        } else {
            const { insertId } = await ecommerce_produits_model.createwishlist(
                ID_PRODUIT,
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
const getSousCategories = async (req, res) => {
    try {
        const { ID_CATEGORIE_PRODUIT } = req.params
        const categories = await query('SELECT * FROM ecommerce_produit_sous_categorie WHERE ID_CATEGORIE_PRODUIT = ?', [ID_CATEGORIE_PRODUIT])
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des categories",
            result: categories
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

const getnotesProduit = async (req, res) => {
    try {
        const { ID_PRODUIT, limit, offset } = req.query
        const notes = await ecommerce_produits_model.findNotes(ID_PRODUIT, limit, offset)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des notes et commentaires",
            result: notes
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
const getuserNotes = async (req, res) => {
    try {
        const { ID_PRODUIT } = req.query
        const hasCommande = (await query('SELECT ec.ID_COMMANDE FROM ecommerce_commande_details ecd LEFT JOIN ecommerce_commandes ec ON ec.ID_COMMANDE= ecd.ID_COMMANDE WHERE ecd.ID_PRODUIT = ? AND ec.ID_USER = ? LIMIT 1', [ID_PRODUIT, req.userId]))[0]
        const notes = await ecommerce_produits_model.finduserNotes(ID_PRODUIT)
        const userNote = notes.find(note => note.ID_USER == req.userId)

        var noteGroup = {}
        var moyenne = 0
        for (var i = 1; i <= 5; i++) {
            const revueNote = notes.filter(note => note.NOTE == i)
            moyenne += revueNote.length * i
            noteGroup[i] = {
                nombre: revueNote.length,
                pourcentage: (revueNote.length * 100) / notes.length
            }
        }
        const avg = moyenne / notes.length
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des notes et commentaires",
            result: {
                userNote,
                avg,
                noteGroup,
                total: notes.length,
                hasCommande
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
const getWishilistProduct = async (req, res) => {
    try {
        const { limit, offset } = req.query
        const WishlistProducts = await ecommerce_produits_model.findproductsWishlist(limit, offset, req.userId)
        const products = WishlistProducts.map(product => {
            return {
                produit: {
                    ID_PRODUIT: product.ID_PRODUIT,
                    NOM: product.NOM,
                    ID_PRODUIT_PARTENAIRE: product.ID_PRODUIT_PARTENAIRE,
                    IMAGE: product.IMAGE_1,
                    ID_WISHLIST: product.ID_WISHLIST,
                },
                partenaire: {
                    NOM_ORGANISATION: product.NOM_ORGANISATION,
                    ID_PARTENAIRE: product.ID_PARTENAIRE,
                    ID_TYPE_PARTENAIRE: product.ID_TYPE_PARTENAIRE,
                    NOM: product.NOM_USER,
                    PRENOM: product.PRENOM,
                    ADRESSE_COMPLETE: product.ADRESSE_COMPLETE,
                    ID_SERVICE: product.ID_SERVICE,
                    LOGO: product.LOGO,
                    BACKGROUND_IMAGE: product.BACKGROUND_IMAGE,
                    EMAIL: product.EMAIL,
                    TELEPHONE: product.TELEPHONE,
                    ID_PARTENAIRE_SERVICE: product.ID_PARTENAIRE_SERVICE,
                },
                produit_partenaire: {
                    ID_PARTENAIRE_SERVICE: product.ID_PARTENAIRE_SERVICE,
                    NOM_ORGANISATION: product.NOM_ORGANISATION,
                    NOM: product.NOM_PRODUIT_PARTENAIRE,
                    DESCRIPTION: product.DESCRIPTION,
                    IMAGE_1: product.IMAGE_1,
                    IMAGE_2: product.IMAGE_2,
                    IMAGE_3: product.IMAGE_3,
                    TAILLE: product.NOM_TAILLE,
                    PRIX: product.PRIX
                },
                categorie: {
                    ID_CATEGORIE_PRODUIT: product.ID_CATEGORIE_PRODUIT,
                    NOM: product.NOM_CATEGORIE
                },
                sous_categorie: {
                    ID_PRODUIT_SOUS_CATEGORIE: product.ID_PRODUIT_SOUS_CATEGORIE,
                    NOM: product.NOM_SOUS_CATEGORIE
                },
                stock: {
                    ID_PRODUIT_STOCK: product.ID_PRODUIT_STOCK,
                    QUANTITE_STOCKE: product.QUANTITE_TOTAL,
                    QUANTITE_RESTANTE: product.QUANTITE_RESTANTE,
                    QUANTITE_VENDUE: product.QUANTITE_VENDUS
                }
            }
        }
        )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des produits Wishlist",
            result: products
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

const createnotesProduit = async (req, res) => {
    try {

        const { ID_PRODUIT, NOTE, COMMENTAIRE } = req.body
        const { insertId } = await ecommerce_produits_model.createnotes(
            req.userId,
            ID_PRODUIT,
            NOTE,
            COMMENTAIRE
        )
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Enregistrement est fait avec succès",
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
const updateNote = async (req, res) => {
    try {
        const { ID_NOTE } = req.params
        const { NOTE, COMMENTAIRE } = req.body
        const { insertId } = await ecommerce_produits_model.changeNote(NOTE, COMMENTAIRE, ID_NOTE
        )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Modification avec success",
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
const deleteNote = async (req, res) => {
    try {
        const { ID_NOTE } = req.params
        await query('DELETE FROM ecommerce_produit_notes WHERE ID_NOTE=?', [ID_NOTE])
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Suppression avec success",
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


const getProductVariants = async (req, res) => {
    try {
        const { ID_PRODUIT } = req.params
        const allVariants = await query('SELECT * FROM ecommerce_produit_variants WHERE ID_PRODUIT = ?', [ID_PRODUIT])
        const allOptions = await query('SELECT * FROM ecommerce_variant_values WHERE ID_PRODUIT = ?', [ID_PRODUIT])
        const allCombinaisons = await query('SELECT * FROM ecommerce_variant_combination WHERE DATE_SUPPRESSION IS NULL AND ID_PRODUIT = ?', [ID_PRODUIT])
        const combinaisonsIds = allCombinaisons.map(comb => comb.ID_COMBINATION)
        var allCombinaisonsOptions = []
        if (combinaisonsIds.length > 0) {
            allCombinaisonsOptions = await query('SELECT * FROM ecommerce_variant_combination_values WHERE ID_COMBINATION IN (?)', [combinaisonsIds])
        }
        const variants = allVariants.map(variant => {
            const values = allOptions.filter(option => option.ID_VARIANT == variant.ID_VARIANT)
            return {
                ...variant,
                values
            }
        })
        const combinaisons = allCombinaisons.map(combinaison => {
            const values = allCombinaisonsOptions.filter(comb => comb.ID_COMBINATION == combinaison.ID_COMBINATION)
            return {
                ...combinaison,
                values
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les variantes d'un produit",
            result: {
                variants,
                combinaisons
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

const modifierProduit = async (req, res) => {
    try {
        const {
            ID_PARTENAIRE_SERVICE,
            ID_CATEGORIE_PRODUIT,
            ID_PRODUIT_SOUS_CATEGORIE,
            NOM,
            DESCRIPTION,
            MONTANT,
            invetoryEdit: editStr,
            invetoryDelete: deleteStr,
            IMAGE_1: IMAGE_1_DEFAULT,
            IMAGE_2: IMAGE_2_DEFAULT,
            IMAGE_3: IMAGE_3_DEFAULT
        } = req.body
        const { ID_PRODUCT } = req.params

        var invetoryEdit, invetoryDelete
        if (editStr) invetoryEdit = JSON.parse(editStr)
        if (deleteStr) invetoryDelete = JSON.parse(deleteStr)
        const { IMAGE_1, IMAGE_2, IMAGE_3 } = req.files || {}
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                // IMAGE_1: {
                //     required: true,
                //     image: 21000000
                // },
                ID_CATEGORIE_PRODUIT: {
                    required: true
                },
                // IMAGE_2: {
                //     image: 21000000
                // },
                // IMAGE_3: {
                //     image: 21000000
                // },
                NOM: {
                    required: true,
                    length: [1, 100],
                },
                DESCRIPTION: {
                    length: [1, 3000],
                },
                MONTANT: {
                    required: true,
                },
            },
            {
                // IMAGE_1: {
                //     required: "Image d'un produit est obligatoire",
                //     image: "Veuillez choisir une image valide",
                //     size: "L'image est trop volumineux"
                // },
                // IMAGE_2: {
                //     image: "Veuillez choisir une image valide",
                //     size: "L'image est trop volumineux"
                // },
                // IMAGE_3: {
                //     image: "Veuillez choisir une image valide",
                //     size: "L'image est trop volumineux"
                // },
                ID_CATEGORIE_PRODUIT: {
                    exists: "categorie invalide",
                },
                ID_PRODUIT_SOUS_CATEGORIE: {
                    exists: "sous categorie invalide",
                },
                NOM: {
                    required: "nom du produit  est obligatoire",
                    length: "Nom du produit invalide"
                },
                DESCRIPTION: {
                    required: "Vérifier la taille de votre description(max: 3000 caractères)",
                },
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
        const productUpload = new ProductUpload()
        var filename_1
        var filename_2
        var filename_3
        if (IMAGE_1) {
            const { fileInfo: fileInfo_1, thumbInfo } = await productUpload.upload(IMAGE_1, false)
            filename_1 = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.products}/${fileInfo_1.fileName}`
        } else if (IMAGE_1_DEFAULT) {
            filename_1 = IMAGE_1_DEFAULT
        } else {
            filename_1 = null
        }

        if (IMAGE_2) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await productUpload.upload(IMAGE_2, false)
            filename_2 = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.products}/${fileInfo_2.fileName}`
        } else if (IMAGE_2_DEFAULT) {
            filename_2 = IMAGE_2_DEFAULT
        } else {
            filename_2 = null
        }

        if (IMAGE_3) {
            const { fileInfo: fileInfo_3, thumbInfo: thumbInfo_3 } = await productUpload.upload(IMAGE_3, false)
            filename_3 = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.products}/${fileInfo_3.fileName}`
        } else if (IMAGE_3_DEFAULT) {
            filename_3 = IMAGE_3_DEFAULT
        } else {
            filename_3 = null
        }

        const { insertId: ID_PRODUIT } = await ecommerce_produits_model.updateProduit(
            ID_CATEGORIE_PRODUIT,
            ID_PRODUIT_SOUS_CATEGORIE ? ID_PRODUIT_SOUS_CATEGORIE : null,
            NOM,
            MONTANT,
            DESCRIPTION ? DESCRIPTION : null,
            ID_PARTENAIRE_SERVICE,
            filename_1 ? filename_1 : null,
            filename_2 ? filename_2 : null,
            filename_3 ? filename_3 : null,
            ID_PRODUCT
        )

        if (invetoryEdit && invetoryEdit.length > 0) {
            await Promise.all(invetoryEdit.map(async env => {
                await query("UPDATE ecommerce_variant_combination SET QUANTITE=?, PRIX=? WHERE ID_COMBINATION=? ", [env.quantity, env.price, env.id])
            }))
        }
        if (invetoryDelete && invetoryDelete.length > 0) {
            await query("UPDATE ecommerce_variant_combination SET DATE_SUPPRESSION=? WHERE 	ID_COMBINATION IN(?) ", [moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), invetoryDelete])
        }

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "La modification du produit est fait avec succès",
            result: {
                ID_PRODUIT
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

const deleteProduit = async (req, res) => {
    try {
        const { ID_PRODUCT } = req.params
        await query("UPDATE ecommerce_produits SET DATE_SUPPRESSION=? WHERE ID_PRODUIT=? ", [moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), ID_PRODUCT])

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "La suppression du produit est fait avec succès",
            result: {
                ID_PRODUCT
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

const getpartenairesNotes = async (req, res) => {
    try {
        const { ID_PARTENAIRE_SERVICE } = req.params
        const partenaireNotes = await ecommerce_produits_model.findPartenaireNotes(ID_PARTENAIRE_SERVICE)
        console.log(partenaireNotes)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des notes et commentaires",
            result: partenaireNotes
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

const getOneProduct = async (req, res) => {
    try {
        const { ID_PRODUCT } = req.params
        const product = (await ecommerce_produits_model.findOneproducts(req.userId, ID_PRODUCT))[0]
        const oneProduit = {
            produit: {
                ID_PRODUIT: product.ID_PRODUIT,
                NOM: product.NOM,
                ID_PRODUIT_PARTENAIRE: product.ID_PRODUIT_PARTENAIRE,
                IMAGE: product.IMAGE_1,
                ID_WISHLIST: product.ID_WISHLIST,
            },
            partenaire: {
                NOM_ORGANISATION: product.NOM_ORGANISATION,
                ID_PARTENAIRE: product.ID_PARTENAIRE,
                ID_TYPE_PARTENAIRE: product.ID_TYPE_PARTENAIRE,
                NOM: product.NOM_USER,
                PRENOM: product.PRENOM,
                ADRESSE_COMPLETE: product.ADRESSE_COMPLETE,
                ID_SERVICE: product.ID_SERVICE,
                LOGO: product.LOGO,
                BACKGROUND_IMAGE: product.BACKGROUND_IMAGE,
                EMAIL: product.EMAIL,
                TELEPHONE: product.TELEPHONE,
                ID_PARTENAIRE_SERVICE: product.ID_PARTENAIRE_SERVICE,
            },
            produit_partenaire: {
                ID_PARTENAIRE_SERVICE: product.ID_PARTENAIRE_SERVICE,
                NOM_ORGANISATION: product.NOM_ORGANISATION,
                NOM: product.NOM_PRODUIT_PARTENAIRE,
                DESCRIPTION: product.DESCRIPTION,
                IMAGE_1: product.IMAGE_1,
                IMAGE_2: product.IMAGE_2,
                IMAGE_3: product.IMAGE_3,
                TAILLE: product.NOM_TAILLE,
                PRIX: product.PRIX
            },
            categorie: {
                ID_CATEGORIE_PRODUIT: product.ID_CATEGORIE_PRODUIT,
                NOM: product.NOM_CATEGORIE
            },
            sous_categorie: {
                ID_PRODUIT_SOUS_CATEGORIE: product.ID_PRODUIT_SOUS_CATEGORIE,
                NOM: product.NOM_SOUS_CATEGORIE
            },
            stock: {
                ID_PRODUIT_STOCK: product.ID_PRODUIT_STOCK,
                QUANTITE_STOCKE: product.QUANTITE_TOTAL,
                QUANTITE_RESTANTE: product.QUANTITE_RESTANTE,
                QUANTITE_VENDUE: product.QUANTITE_VENDUS
            }
        }
        
res.status(RESPONSE_CODES.OK).json({
    statusCode: RESPONSE_CODES.OK,
    httpStatus: RESPONSE_STATUS.OK,
    message: "Liste des produits",
    result: oneProduit
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
    getAllProducts,
    createProduit,
    getCategories,
    getCategories,
    getSousCategories,
    getProductVariants,
    createEcommerce_wishlist_produit,
    getWishilistProduct,
    createnotesProduit,
    getnotesProduit,
    getuserNotes,
    updateNote,
    deleteNote,
    modifierProduit,
    deleteProduit,
    getpartenairesNotes,
    getOneProduct
}