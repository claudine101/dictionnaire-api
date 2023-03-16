const { query } = require("../../utils/db");

const findAllmenu = async (q, category, subCategory, partenaireService, limit = 10, offset = 0, userId, min_prix, max_prix, order_by) => {
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
                                  SELECT menu.*,
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
                                  resc.NOM NOM_CATEGORIE,
                                  rwm.ID_WISHLIST,
                                  AVG(rmn.NOTE) AS MOYENNE`
                if (order_by == ORDERBY.PLUS_ACHETE) {
                        sqlQuery += ' ,COUNT(resD.ID_COMMANDE_DETAIL) AS COMMANDES '
                }

                sqlQuery += ` FROM restaurant_menus menu
                                
                                LEFT JOIN  restaurant_menus_notes rmn  ON rmn.ID_RESTAURANT_MENU =menu.ID_RESTAURANT_MENU
                                  LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = menu.ID_PARTENAIRE_SERVICE
                                  LEFT JOIN partenaires par ON par.ID_PARTENAIRE = ps.ID_PARTENAIRE
                                  LEFT JOIN restaurant_categorie_menu resc ON resc.ID_CATEGORIE_MENU = menu.ID_CATEGORIE_MENU
                                  LEFT JOIN restaurant_wishlist_menu rwm ON rwm.ID_RESTAURANT_MENU=menu.ID_RESTAURANT_MENU AND rwm.ID_USER=?`

                if (order_by == ORDERBY.PLUS_ACHETE) {
                        sqlQuery += ' LEFT JOIN restaurant_commandes_details resD ON menu.ID_RESTAURANT_MENU=resD.ID_RESTAURANT_MENU'
                }

                sqlQuery += ' WHERE menu.DATE_SUPPRESSION IS NULL '
                if (q && q != "") {
                        sqlQuery +=
                                "AND  menu.NOM  LIKE ?";
                        binds.push(`%${q}%`);
                }
                if (category) {
                        sqlQuery += " AND menu.ID_CATEGORIE_MENU=? "
                        binds.push(category)
                }
                if (partenaireService) {
                        sqlQuery += " AND menu.ID_PARTENAIRE_SERVICE = ? "
                        binds.push(partenaireService)
                }
                if (min_prix && !max_prix) {
                        sqlQuery += " AND menu.PRIX >=? "
                        binds.push(min_prix)
                }
                else if (!min_prix && max_prix) {
                        sqlQuery += " AND menu.PRIX <=? "
                        binds.push(max_prix)
                }
                else if (min_prix && max_prix) {
                        sqlQuery += "AND menu.PRIX BETWEEN ? AND ?"
                        binds.push(min_prix, max_prix)

                }
                sqlQuery += " GROUP BY menu.ID_RESTAURANT_MENU, rmn.ID_RESTAURANT_MENU, rwm.ID_WISHLIST, rmn.ID_NOTE "
                if (order_by == ORDERBY.MOINS_CHER) {
                        sqlQuery += ` ORDER BY menu.PRIX ASC `;
                } else if (order_by == ORDERBY.PLUS_CHER) {
                        sqlQuery += ` ORDER BY menu.PRIX DESC `;
                } else if (order_by == ORDERBY.NOUVEAUTES) {
                        sqlQuery += ` ORDER BY menu.DATE_INSERTION DESC `;
                }
                // else if(order_by==ORDERBY.PLUS_ACHETE){
                //         sqlQuery += ` ORDER BY COMMANDES DESC `;
                // }
                else {
                        sqlQuery += ` ORDER BY menu.DATE_INSERTION DESC `;
                }
                sqlQuery += ` LIMIT ${offset}, ${limit}`
                return query(sqlQuery, binds);
        }
        catch (error) {
                throw error

        }
}
const findNotes = async (ID_RESTAURANT_MENU, limit = 10, offset = 0,) => {
        try {
                var binds = [ID_RESTAURANT_MENU]
                var sqlQuery = `
                  SELECT rmn.NOTE,rmn.COMMENTAIRE,u.NOM,u.PRENOM,rmn.DATE_INSERTION FROM restaurant_menus_notes rmn 
                  LEFT JOIN users u ON rmn.ID_USER=u.ID_USER WHERE 1 AND rmn.ID_RESTAURANT_MENU=?
                  `
                sqlQuery += ` ORDER BY rmn.DATE_INSERTION DESC LIMIT ${offset}, ${limit}`;
                return query(sqlQuery, binds)
        } catch (error) {
                throw error
        }
}
const finduserNotes = async (ID_RESTAURANT_MENU) => {
        try {
                var binds = [ID_RESTAURANT_MENU]
                var sqlQuery = `
                SELECT rmn.ID_NOTE,rmn.NOTE,rmn.ID_USER,rmn.COMMENTAIRE,u.NOM,u.PRENOM,rmn.DATE_INSERTION FROM restaurant_menus_notes rmn LEFT 
                JOIN users u ON rmn.ID_USER=u.ID_USER WHERE 1 AND rmn.ID_RESTAURANT_MENU=?
                  `

                return query(sqlQuery, binds)
        } catch (error) {
                throw error
        }
}
const changeNote = async (NOTE, COMMENTAIRE, ID_NOTE) => {

        try {

                var sqlQuery = `UPDATE  restaurant_menus_notes SET NOTE=?,COMMENTAIRE=? WHERE ID_NOTE=?`
                return query(sqlQuery, [NOTE, COMMENTAIRE, ID_NOTE])
        } catch (error) {
                throw error
        }
}
const findwishlistmenu = async (limit = 10, offset = 0, userId) => {
        try {
                var binds = [userId]
                var sqlQuery = `
                                SELECT menu.*,
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
                                resc.NOM NOM_CATEGORIE,
                                rwm.ID_WISHLIST
                        FROM restaurant_menus menu
                                LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = menu.ID_PARTENAIRE_SERVICE
                                LEFT JOIN partenaires par ON par.ID_PARTENAIRE = ps.ID_PARTENAIRE
                                LEFT JOIN restaurant_categorie_menu resc ON resc.ID_CATEGORIE_MENU = menu.ID_CATEGORIE_MENU
                                LEFT JOIN restaurant_wishlist_menu rwm ON rwm.ID_RESTAURANT_MENU=menu.ID_RESTAURANT_MENU 
                        WHERE 1 AND  rwm.ID_USER=?
                        `

                sqlQuery += ` ORDER BY menu.DATE_INSERTION DESC LIMIT ${offset}, ${limit}`;
                return query(sqlQuery, binds);
        }
        catch (error) {
                throw error

        }
}
const createMenu = (ID_CATEGORIE_MENU, ID_PARTENAIRE_SERVICE, PRIX, NOM, DESCRIPTION, IMAGE_1, IMAGE_2, IMAGE_3) => {
        try {
                var sqlQuery = "INSERT INTO restaurant_menus (ID_CATEGORIE_MENU, ID_PARTENAIRE_SERVICE,PRIX,NOM,DESCRIPTION,IMAGE_1,IMAGE_2,IMAGE_3)";
                sqlQuery += "values (?,?,?,?,?,?,?,?)";
                return query(sqlQuery, [ID_CATEGORIE_MENU, ID_PARTENAIRE_SERVICE, PRIX, NOM, DESCRIPTION, IMAGE_1, IMAGE_2, IMAGE_3])
        } catch (error) {
                throw error
        }
};
const createnotes = async (ID_USER, ID_RESTAURANT_MENU, NOTE, COMMENTAIRE) => {
        try {
                var sqlQuery = `
                  INSERT INTO  restaurant_menus_notes(ID_USER,ID_RESTAURANT_MENU,NOTE,COMMENTAIRE)
                  VALUES (?,?,?,?)
                  `
                return query(sqlQuery, [ID_USER, ID_RESTAURANT_MENU, NOTE, COMMENTAIRE])
        } catch (error) {
                throw error
        }
}
const createwishlist = async (ID_RESTAURANT_MENU, ID_USER, id) => {
        try {
                var sqlQuery = `
                  INSERT INTO   restaurant_wishlist_menu(ID_RESTAURANT_MENU,ID_USER)
                  VALUES (?,?)
                  `
                return query(sqlQuery, [ID_RESTAURANT_MENU, ID_USER, id])
        }
        catch (error) {
                throw error
        }
}

const updateMenu = (ID_CATEGORIE_MENU, ID_PARTENAIRE_SERVICE, PRIX, NOM, DESCRIPTION, IMAGE_1, IMAGE_2, IMAGE_3, ID_RESTAURANT_MENU) => {
        try {
                var sqlQuery = "UPDATE restaurant_menus SET ID_CATEGORIE_MENU=?, ID_PARTENAIRE_SERVICE=?,PRIX=?,NOM=?,DESCRIPTION=?,IMAGE_1=?,IMAGE_2=?,IMAGE_3=? WHERE ID_RESTAURANT_MENU=?";
                return query(sqlQuery, [ID_CATEGORIE_MENU, ID_PARTENAIRE_SERVICE, PRIX, NOM, DESCRIPTION, IMAGE_1, IMAGE_2, IMAGE_3, ID_RESTAURANT_MENU])
        } catch (error) {
                throw error
        }
};

const findpartenaireNotes = async (ID_PARTENAIRE_SERVICE) => {
        try {
                var binds = [ID_PARTENAIRE_SERVICE]
                var sqlQuery = `SELECT rn.*,
                u.NOM,
                u.PRENOM
        FROM restaurant_menus_notes rn
                LEFT JOIN restaurant_menus rm ON rn.ID_RESTAURANT_MENU = rm.ID_RESTAURANT_MENU
                LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = rm.ID_PARTENAIRE_SERVICE
                LEFT JOIN partenaires part ON part.ID_PARTENAIRE = ps.ID_PARTENAIRE
                LEFT JOIN users u ON u.ID_USER = part.ID_USER
        WHERE ps.ID_PARTENAIRE_SERVICE = ?`

                return query(sqlQuery, binds)
        } catch (error) {
                throw error
        }
}

const findOnemenu = async (userId, ID_RESTAURANT_MENU) => {
        try {
                var binds = [userId, ID_RESTAURANT_MENU]
                var sqlQuery = `
                                  SELECT menu.*,
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
                                  resc.NOM NOM_CATEGORIE,
                                  rwm.ID_WISHLIST
                          FROM restaurant_menus menu
                                  LEFT JOIN partenaire_service ps ON ps.ID_PARTENAIRE_SERVICE = menu.ID_PARTENAIRE_SERVICE
                                  LEFT JOIN partenaires par ON par.ID_PARTENAIRE = ps.ID_PARTENAIRE
                                  LEFT JOIN restaurant_categorie_menu resc ON resc.ID_CATEGORIE_MENU = menu.ID_CATEGORIE_MENU
                                  LEFT JOIN restaurant_wishlist_menu rwm ON rwm.ID_RESTAURANT_MENU=menu.ID_RESTAURANT_MENU AND rwm.ID_USER=?
                          WHERE menu.DATE_SUPPRESSION IS NULL AND menu.ID_RESTAURANT_MENU=?
                          `
                sqlQuery += ` ORDER BY menu.DATE_INSERTION DESC`;
                return query(sqlQuery, binds);
        }
        catch (error) {
                throw error

        }
}

module.exports = {
        findAllmenu,
        createMenu,
        createwishlist,
        findwishlistmenu,
        createnotes,
        findNotes,
        finduserNotes,
        changeNote,
        updateMenu,
        findpartenaireNotes,
        findOnemenu
}