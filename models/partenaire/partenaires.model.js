const { query } = require("../../utils/db");

/**
 * Permet d'enregistre un utilisateur comme partenaire
 * @param { Number } ID_USER - l'ID utilisateur à enregistrer
 */
const createOnePartenaire = (ID_USER) => {
          try {
                    var sqlQuery = "INSERT INTO partenaires (ID_USER)";
                    sqlQuery += "values (?)";
                    return query(sqlQuery, [ID_USER])
          }
          catch (error) {

                    throw error
          }
}

const createBoutiqueSuivis = async (ID_PARTENAIRE_SERVICE, ID_USER) => {
        try {
                  var sqlQuery = `
            INSERT INTO ecommerce_boutique_suivis(ID_PARTENAIRE_SERVICE,ID_USER)
            VALUES (?,?)
            `
                  return query(sqlQuery, [ID_PARTENAIRE_SERVICE, ID_USER])
        } catch (error) {
                  throw error
        }
}

module.exports = {
          createOnePartenaire,
          createBoutiqueSuivis
}