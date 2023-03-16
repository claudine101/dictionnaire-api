const { query } = require("../../utils/db");

const createDetailLivraison = async (ID_USER, NOM, PRENOM, ADRESSE, TELEPHONE, AVENUE, ID_COUNTRY) => {
          try {
                    var sqlQuery = "INSERT  INTO driver_details_livraison(ID_USER, NOM,PRENOM,ADRESSE,TELEPHONE,AVENUE,ID_COUNTRY)";
                    sqlQuery += "VALUES(?, ?,?,?,?,?,?)"
                    return query(sqlQuery, [ID_USER, NOM, PRENOM, ADRESSE, TELEPHONE, AVENUE, ID_COUNTRY]);
          } catch (error) {
                    throw error
          }

}

module.exports = {
          createDetailLivraison
}