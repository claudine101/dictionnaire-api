const { query } = require("../../utils/db");

const findAllCommandes = async (ID_PARTENAIRE_SERVICE, ID_USER, q, limit = 10, offset = 0) => {
          try {
                    var binds = []
                    var sqlQuery = "SELECT co.*, ecs.DESCRIPTION STATUT_DESCRIPTION, ecs.NEXT_STATUS FROM restaurant_commandes co "
                    sqlQuery += " LEFT JOIN restaurant_commande_statut ecs ON ecs.ID_STATUT = co.ID_STATUT "
                    sqlQuery += " WHERE 1 AND co.ID_STATUT != 1 "
                    if(ID_PARTENAIRE_SERVICE) {
                              sqlQuery += " AND co.ID_PARTENAIRE_SERVICE = ?  "
                              binds.push(ID_PARTENAIRE_SERVICE)
                    }
                    if(ID_USER) {
                              sqlQuery += " AND co.ID_USER = ?  "
                              binds.push(ID_USER)
                    }
                    sqlQuery += ` ORDER BY co.DATE_COMMANDE DESC LIMIT ${offset}, ${limit}`
                    return query(sqlQuery, binds)
          }
          catch (error) {
                    throw error;
          }
};

const getManyCommandesRestaurantDetails = async (commandesIds) => {
          try {
                    var binds = [commandesIds]
                    var sqlQuery = " SELECT cd.ID_COMMANDE, cd.ID_COMMANDE_DETAIL, cd.QUANTITE, cd.ID_RESTAURANT_MENU, cd.MONTANT, cd.SOMME, ep.NOM, ep.IMAGE_1 FROM restaurant_commandes_details cd"
                    sqlQuery += "  LEFT JOIN  restaurant_menus ep ON ep.ID_RESTAURANT_MENU=cd.ID_RESTAURANT_MENU WHERE ID_COMMANDE IN (?)"
                    return query(sqlQuery, binds)
          }catch (error) {
                    throw error
          }
  };

  const saveStatusResto = async (ID_COMMANDE, ID_USER, ID_STATUT) => {
          try {
                    return query("INSERT INTO restaurant_commande_statut_historiques(ID_COMMANDE, ID_USER, ID_STATUT) VALUES(?, ?, ?)", [ID_COMMANDE, ID_USER, ID_STATUT])
          } catch (error) {
                    throw error;
          }
  }

  const getCommandesByIdsDriverCourses = async (idDriverCourse) => {
          try {
                  var binds = [idDriverCourse]
                  var sqlQuery = "SELECT co.*, ecs.DESCRIPTION STATUT_DESCRIPTION, ecs.NEXT_STATUS FROM restaurant_commandes co "
                  sqlQuery += " LEFT JOIN restaurant_commande_statut ecs ON ecs.ID_STATUT = co.ID_STATUT "
                  sqlQuery += " WHERE co.ID_DRIVER_COURSE IN (?) AND co.ID_STATUT != 1 ORDER BY co.DATE_COMMANDE DESC "
                  return query(sqlQuery, binds)
          }
          catch (error) {
                    throw error;
          }
  };
  const createCommandesResto = async (PAYEMENT_ID, ID_PARTENAIRE_SERVICE, ID_USER, DATE_LIVRAISON, CODE_UNIQUE, TOTAL, ID_DETAILS_LIVRAISON, ID_STATUT = 1, ID_DRIVER_COURSE) => {
          try {
                  var sqlQuery = "INSERT INTO restaurant_commandes(PAYEMENT_ID, ID_PARTENAIRE_SERVICE, ID_USER, DATE_LIVRAISON, CODE_UNIQUE, TOTAL, ID_DETAILS_LIVRAISON, ID_STATUT, ID_DRIVER_COURSE)";
                  sqlQuery += "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"
                  return query(sqlQuery, [PAYEMENT_ID, ID_PARTENAIRE_SERVICE, ID_USER, DATE_LIVRAISON, CODE_UNIQUE, TOTAL, ID_DETAILS_LIVRAISON, ID_STATUT, ID_DRIVER_COURSE]);
          } catch (error) {
                  throw error
          }
  
  };
  const createCommandeDetailsResto = async (ecommerce_commande_details) => {
          try {
                    var sqlQuery = "INSERT INTO  restaurant_commandes_details(ID_COMMANDE, ID_RESTAURANT_MENU, QUANTITE, MONTANT, SOMME, ID_COMBINATION)";
                    sqlQuery += "VALUES ?"
                    return query(sqlQuery, [ecommerce_commande_details]);
          } catch (error) {
                    throw error
          }
  
  };
  
module.exports = {
          findAllCommandes,
          getManyCommandesRestaurantDetails,
          saveStatusResto,
          getCommandesByIdsDriverCourses,
          createCommandesResto,
          createCommandeDetailsResto
}