const { query } = require("../../utils/db");

const insertLivreur = (ID_PARTENAIRE_SERVICE, NOM, PRENOM, NUMERO_PLAQUE, MODELE, MARQUE, NOMBRE_PLACE, IMAGE_1, IMAGE_2, IMAGE_3) => {
          try {
                    var sqlQuery = "INSERT INTO personne_livreurs (ID_PARTENAIRE_SERVICE,NOM,PRENOM,NUMERO_PLAQUE,MODELE,MARQUE,NOMBRE_PLACE,IMAGE_1,IMAGE_2,IMAGE_3)";
                    sqlQuery += "values (?,?,?,?,?,?,?,?,?,?)";
                    return query(sqlQuery, [
                              ID_PARTENAIRE_SERVICE, NOM, PRENOM, NUMERO_PLAQUE, MODELE, MARQUE, NOMBRE_PLACE, IMAGE_1, IMAGE_2, IMAGE_3])
          }
          catch (error) {

                    throw error
          }
}

module.exports = {
          insertLivreur
}