const { query } = require("../../utils/db");
const findAll = async (ID_SERVICE_CATEGORIE) => {
          try {
                    var binds = []
                    var sqlQuery = "SELECT * FROM services WHERE 1 "
                    if(ID_SERVICE_CATEGORIE) {
                              sqlQuery += " AND ID_SERVICE_CATEGORIE = ? "
                              binds.push(ID_SERVICE_CATEGORIE)
                    }
                    return query(sqlQuery, binds);
          }
          catch (error) {
                    console.log(error)
                    throw error
          }

}

const findAllCategories = () => {
          try {

                    var sqlQuery = "SELECT * FROM services_categories WHERE 1 "
                    return query(sqlQuery);
          }
          catch (error) {
                    console.log(error)
                    throw error
          }
}
const findById = async (ID_USER, ID_SERVICE) => {
          try {

                    var sqlQuery = "SELECT * FROM partenaires par LEFT JOIN "
                    sqlQuery += " partenaire_service ser ON ser.ID_PARTENAIRE=par.ID_PARTENAIRE  "
                    sqlQuery += " LEFT JOIN  services srv on srv.ID_SERVICE=ser.ID_SERVICE "
                    sqlQuery += " WHERE par.ID_USER=? AND srv.ID_SERVICE=? "
                    return query(sqlQuery, [ID_USER, ID_SERVICE]);
          }
          catch (error) {
                    console.log(error)
                    throw error
          }

}

/**
 * Permet de récuperer les services du partenaire qlq
 * @param { Number } idPartenaire L'id du partenaire
 * @returns 
 */
const findPartenaireServices = async (idPartenaire) => {
          try {
                    var sqlQuery = " SELECT * FROM partenaire_service WHERE DATE_SUPPRESSION IS NULL AND ID_PARTENAIRE = ?"
                    return query(sqlQuery, [idPartenaire]);
          }catch (error) {
                    throw error
          }

}
const createOne = async (ID_PARTENAIRE_SERVICE, ID_SERVICE, MODE_ID = 1, NUMERO, TXNI_D,) => {
          try {
                    return query('INSERT INTO service_payement(ID_PARTENAIRE_SERVICE,ID_SERVICE, MODE_ID, NUMERO,  TXNI_D)VALUES(?, ?, ?, ?, ?)', [
                              ID_PARTENAIRE_SERVICE, ID_SERVICE, MODE_ID = 1, NUMERO, TXNI_D,])
          } catch (error) {
                    throw error
          }
}

const findbycategorieResto = async (id) => {
  try {

            var sqlQuery = `SELECT res.DESCRIPTION,
                            res_c.NOM AS NOM,
                            COUNT(res.ID_RESTAURANT_MENU) NOMBRE_MENUS
                    FROM restaurant_menus res
                            LEFT JOIN restaurant_categorie_menu res_C ON res_C.ID_CATEGORIE_MENU = res.ID_CATEGORIE_MENU
                    WHERE res.ID_PARTENAIRE_SERVICE = ?
                    GROUP BY res.ID_PARTENAIRE_SERVICE`

            return query(sqlQuery, [id]);
  }
  catch (error) {
            throw error
  }
}
module.exports = {
          createOne,
          findAll,
          findById,
          findPartenaireServices,
          findbycategorieResto,
          findAllCategories
}



