const { query } = require("../../utils/db");

const findproducts = async (q, category, subCategory, partenaireService, limit = 10, offset = 0, userId, min_prix, max_prix, order_by) => {
        try {
                const ORDERBY = {
                        MOINS_CHER: 1,
                        PLUS_CHER: 2,
                        PLUS_ACHETE: 3,
                        AVUES: 4,
                        NOUVEAUTES: 5
                }
                var binds = [userId]
                var sqlQuery = `
                    SELECT ep.*,
                              ps.NOM_ORGANISATION,
                              ps.ID_TYPE_PARTENAIRE,
                              ps.ID_PARTENAIRE,
                              ps.ID_PARTENAIRE_SERVICE,
                              ps.ADRESSE_COMPLETE,
                              ps.ID_SERVICE,
                              ps.LOGO,
                              ps.BACKGROUND_IMAGE,
                              ps.EMAIL,
                              ps.TELEPHONE,
                              epc.NOM NOM_CATEGORIE,
                              epsc.NOM NOM_SOUS_CATEGORIE,
                              ewp.ID_WISHLIST,
                              epn.NOTE,
                              epn.ID_NOTE,
                              AVG(epn.NOTE) AS MOYENNE `

                if (order_by == ORDERBY.PLUS_ACHETE) {
                        sqlQuery += ' ,COUNT(ecoD.ID_COMMANDE_DETAIL) AS COMMANDES '
                }
                sqlQuery += ` FROM ecommerce_produits ep
                        LEFT JOIN ecommerce_produit_notes epn ON epn.ID_PRODUIT= ep.ID_PRODUIT
                        LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = ep.ID_PARTENAIRE_SERVICE
                        LEFT JOIN partenaires par ON par.ID_PARTENAIRE = ps.ID_PARTENAIRE
                        LEFT JOIN ecommerce_produit_categorie epc ON epc.ID_CATEGORIE_PRODUIT = ep.ID_CATEGORIE_PRODUIT
                        LEFT JOIN ecommerce_produit_sous_categorie epsc ON epsc.ID_PRODUIT_SOUS_CATEGORIE = ep.ID_PRODUIT_SOUS_CATEGORIE
                        LEFT JOIN ecommerce_wishlist_produit ewp ON ewp.ID_PRODUIT=ep.ID_PRODUIT AND ewp.ID_USER=?`

                if (order_by == ORDERBY.PLUS_ACHETE) {
                        sqlQuery += ' LEFT JOIN ecommerce_commande_details ecoD ON ep.ID_PRODUIT=ecoD.ID_PRODUIT'
                }
                sqlQuery += ' WHERE ep.DATE_SUPPRESSION IS NULL '


                if (q && q != "") {
                        sqlQuery +=
                                "AND  ep.NOM  LIKE ?";
                        binds.push(`%${q}%`);
                }
                if (category) {
                        sqlQuery += " AND ep.ID_CATEGORIE_PRODUIT=? "
                        binds.push(category)
                }
                if (subCategory) {
                        sqlQuery += " AND ep.ID_PRODUIT_SOUS_CATEGORIE = ? "
                        binds.push(subCategory)
                }
                if (partenaireService) {
                        sqlQuery += " AND ep.ID_PARTENAIRE_SERVICE = ? "
                        binds.push(partenaireService)
                }
                if (min_prix && !max_prix) {
                        sqlQuery += " AND ep.PRIX >= ? "
                        binds.push(min_prix)
                } else if (!min_prix && max_prix) {
                        sqlQuery += " AND ep.PRIX <= ? "
                        binds.push(max_prix)

                } else if (min_prix && max_prix) {

                        sqlQuery += "AND ep.PRIX BETWEEN ? AND ?"
                        binds.push(min_prix, max_prix)
                }
                sqlQuery += " GROUP BY epn.ID_PRODUIT, ep.ID_PRODUIT, ewp.ID_WISHLIST, epn.ID_NOTE "
                if (order_by == ORDERBY.MOINS_CHER) {
                        sqlQuery += ` ORDER BY ep.PRIX ASC `;
                } else if (order_by == ORDERBY.PLUS_CHER) {
                        sqlQuery += ` ORDER BY ep.PRIX DESC `;
                } else if (order_by == ORDERBY.NOUVEAUTES) {
                        sqlQuery += ` ORDER BY ep.DATE_INSERTION DESC `;
                } else if (order_by == ORDERBY.PLUS_ACHETE) {
                        sqlQuery += ` ORDER BY COMMANDES DESC `;
                }else if(order_by == ORDERBY.AVUES){
                        sqlQuery += ` ORDER BY MOYENNE DESC `;
                }else {
                        sqlQuery += ` ORDER BY ep.DATE_INSERTION DESC `;
                }

                sqlQuery += ` LIMIT ${offset}, ${limit}`
                return query(sqlQuery, binds);
        }
        catch (error) {
                throw error

        }
}

const createProduit = async (ID_CATEGORIE_PRODUIT, ID_PRODUIT_SOUS_CATEGORIE = null, NOM, PRIX, DESCRIPTION, ID_PARTENAIRE_SERVICE, IMAGE_1, IMAGE_2, IMAGE_3, QUANTITE_TOTAL) => {
        try {
                var sqlQuery = `
                    INSERT INTO ecommerce_produits(
                              ID_CATEGORIE_PRODUIT,
                              ID_PRODUIT_SOUS_CATEGORIE,
                              NOM,
                              PRIX,
                              DESCRIPTION,
                              ID_PARTENAIRE_SERVICE,
                              IMAGE_1,
                              IMAGE_2,
                              IMAGE_3,
                              QUANTITE_TOTAL
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? , ?)
                    `
                return query(sqlQuery, [ID_CATEGORIE_PRODUIT, ID_PRODUIT_SOUS_CATEGORIE = null, NOM, PRIX, DESCRIPTION, ID_PARTENAIRE_SERVICE, IMAGE_1, IMAGE_2, IMAGE_3, QUANTITE_TOTAL])
        }
        catch (error) {
                throw error
        }
}
const findNotes = async (ID_PRODUIT, limit = 10, offset = 0,) => {
        try {
                var binds = [ID_PRODUIT]
                var sqlQuery = `
            SELECT epn.NOTE,epn.COMMENTAIRE,u.NOM,u.PRENOM,epn.DATE_INSERTION FROM ecommerce_produit_notes epn
            LEFT JOIN users u ON epn.ID_USER=u.ID_USER WHERE 1 AND epn.ID_PRODUIT=?
            `
                sqlQuery += ` ORDER BY epn.DATE_INSERTION DESC LIMIT ${offset}, ${limit}`;
                return query(sqlQuery, binds)
        } catch (error) {
                throw error
        }
}
const finduserNotes = async (ID_PRODUIT) => {
        try {
                var binds = [ID_PRODUIT]
                var sqlQuery = `
            SELECT u.ID_USER,epn.ID_NOTE,epn.NOTE,epn.COMMENTAIRE,u.NOM,u.PRENOM,epn.DATE_INSERTION FROM ecommerce_produit_notes epn
            LEFT JOIN users u ON epn.ID_USER=u.ID_USER WHERE 1 AND epn.ID_PRODUIT=?
            `

                return query(sqlQuery, binds)
        } catch (error) {
                throw error
        }
}
const changeNote = async (NOTE, COMMENTAIRE, ID_NOTE) => {

        try {

                var sqlQuery = `UPDATE ecommerce_produit_notes SET NOTE=?,COMMENTAIRE=? WHERE ID_NOTE=?`
                return query(sqlQuery, [NOTE, COMMENTAIRE, ID_NOTE])
        } catch (error) {
                throw error
        }
}


const findproductsWishlist = async (limit = 10, offset = 0, userId) => {
        try {
                var binds = [userId]
                var sqlQuery = `
              SELECT ep.*,
                        ps.NOM_ORGANISATION,
                        ps.ID_TYPE_PARTENAIRE,
                        ps.ID_PARTENAIRE,
                        ps.ID_PARTENAIRE_SERVICE,
                        ps.ADRESSE_COMPLETE,
                        ps.ID_SERVICE,
                        ps.LOGO,
                        ps.BACKGROUND_IMAGE,
                        ps.EMAIL,
                        ps.TELEPHONE,
                        epc.NOM NOM_CATEGORIE,
                        ewp.ID_WISHLIST
              FROM ecommerce_produits ep
                        LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = ep.ID_PARTENAIRE_SERVICE
                        LEFT JOIN partenaires par ON par.ID_PARTENAIRE = ps.ID_PARTENAIRE
                        LEFT JOIN ecommerce_produit_categorie epc ON epc.ID_CATEGORIE_PRODUIT = ep.ID_CATEGORIE_PRODUIT
                        LEFT JOIN ecommerce_wishlist_produit ewp ON ewp.ID_PRODUIT=ep.ID_PRODUIT 
              WHERE 1 AND ewp.ID_USER=?
              `
                sqlQuery += ` ORDER BY ep.DATE_INSERTION DESC LIMIT ${offset}, ${limit}`;
                return query(sqlQuery, binds);
        }
        catch (error) {
                throw error

        }
}
const createwishlist = async (ID_PRODUIT, ID_USER, id) => {
        try {
                var sqlQuery = `
              INSERT INTO  ecommerce_wishlist_produit(ID_PRODUIT,ID_USER)
              VALUES (?,?)
              `
                return query(sqlQuery, [ID_PRODUIT, ID_USER, id])
        } catch (error) {
                throw error
        }
}
const createnotes = async (ID_USER, ID_PRODUIT, NOTE, COMMENTAIRE) => {
        try {
                var sqlQuery = `
            INSERT INTO  ecommerce_produit_notes(ID_USER,ID_PRODUIT,NOTE,COMMENTAIRE)
            VALUES (?,?,?,?)
            `
                return query(sqlQuery, [ID_USER, ID_PRODUIT, NOTE, COMMENTAIRE])
        } catch (error) {
                throw error
        }
}



const updateProduit = async (ID_CATEGORIE_PRODUIT, ID_PRODUIT_SOUS_CATEGORIE, NOM, PRIX, DESCRIPTION, ID_PARTENAIRE_SERVICE, IMAGE_1, IMAGE_2, IMAGE_3, ID_PRODUCT) => {
        try {
                var sqlQuery = `
                          UPDATE ecommerce_produits
              SET ID_CATEGORIE_PRODUIT = ?,
                      ID_PRODUIT_SOUS_CATEGORIE = ?,
                      NOM = ?,
                      PRIX = ?,
                      DESCRIPTION = ?,
                      ID_PARTENAIRE_SERVICE = ?,
                      IMAGE_1 = ?,
                      IMAGE_2 = ?,
                      IMAGE_3 = ?
              WHERE ID_PRODUIT = ?
            `
                return query(sqlQuery, [ID_CATEGORIE_PRODUIT, ID_PRODUIT_SOUS_CATEGORIE, NOM, PRIX, DESCRIPTION, ID_PARTENAIRE_SERVICE, IMAGE_1, IMAGE_2, IMAGE_3, ID_PRODUCT])
        }
        catch (error) {
                throw error
        }
}

const findPartenaireNotes = async (ID_PARTENAIRE_SERVICE) => {
        try {
                var binds = [ID_PARTENAIRE_SERVICE]
                var sqlQuery = `SELECT en.*,
                  u.NOM,
                  u.PRENOM,
                  u.EMAIL
          FROM ecommerce_produit_notes en
                  LEFT JOIN ecommerce_produits ep ON ep.ID_PRODUIT = en.ID_PRODUIT
                  LEFT JOIN partenaire_service ps ON ep.ID_PARTENAIRE_SERVICE = ps.ID_PARTENAIRE_SERVICE
                  LEFT JOIN partenaires part ON ps.ID_PARTENAIRE = part.ID_PARTENAIRE
                  LEFT JOIN users u ON u.ID_USER = part.ID_USER
          WHERE ps.ID_PARTENAIRE_SERVICE = ?`
                return query(sqlQuery, binds)
        } catch (error) {
                throw error
        }
}

const findOneproducts = async (userId, ID_PRODUCT) => {
        try {
                var binds = [userId, ID_PRODUCT]
                var sqlQuery = `
                    SELECT ep.*,
                              ps.NOM_ORGANISATION,
                              ps.ID_TYPE_PARTENAIRE,
                              ps.ID_PARTENAIRE,
                              ps.ID_PARTENAIRE_SERVICE,
                              ps.ADRESSE_COMPLETE,
                              ps.ID_SERVICE,
                              ps.LOGO,
                              ps.BACKGROUND_IMAGE,
                              ps.EMAIL,
                              ps.TELEPHONE,
                              epc.NOM NOM_CATEGORIE,
                              epsc.NOM NOM_SOUS_CATEGORIE,
                              ewp.ID_WISHLIST
                    FROM ecommerce_produits ep
                              LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = ep.ID_PARTENAIRE_SERVICE
                              LEFT JOIN partenaires par ON par.ID_PARTENAIRE = ps.ID_PARTENAIRE
                              LEFT JOIN ecommerce_produit_categorie epc ON epc.ID_CATEGORIE_PRODUIT = ep.ID_CATEGORIE_PRODUIT
                              LEFT JOIN ecommerce_produit_sous_categorie epsc ON epsc.ID_PRODUIT_SOUS_CATEGORIE = ep.ID_PRODUIT_SOUS_CATEGORIE
                              LEFT JOIN ecommerce_wishlist_produit ewp ON ewp.ID_PRODUIT=ep.ID_PRODUIT AND ewp.ID_USER=?
                    WHERE ep.DATE_SUPPRESSION IS NULL AND ep.ID_PRODUIT=?
                    `
                sqlQuery += ` ORDER BY ep.DATE_INSERTION DESC`;
                return query(sqlQuery, binds);
        }
        catch (error) {
                throw error

        }
}

module.exports = {
        findproducts,
        createProduit,
        createwishlist,
        findproductsWishlist,
        updateProduit,
        createProduit,
        createwishlist,
        findproductsWishlist,
        createnotes,
        findNotes,
        finduserNotes,
        changeNote,
        findPartenaireNotes,
        findOneproducts
}