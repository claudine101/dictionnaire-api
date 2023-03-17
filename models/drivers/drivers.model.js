
const { query } = require("../../utils/db");
/**
 * Permet de récuper l'utilisateur comme drivers
 * @param { string } email 
 * @returns 
 */
const findUserLogin = async (email) => {
      try {
                var sqlQuery = 'SELECT ID_DRIVER,NOM,PRENOM,EMAIL,USERNAME,MOT_DE_PASSE FROM drivers WHERE USERNAME = ?';
                return query(sqlQuery, [email]);
      } catch (error) {
                throw error;
      }
};
const searchEmail = async (id,EMAIL) => {
      try {
                var sqlQuery = 'SELECT ID_DRIVER  FROM drivers WHERE ID_DRIVER != ? AND EMAIL=?';
                return query(sqlQuery, [id,EMAIL]);
      } catch (error) {
                throw error;
      }
};
const createOne = ( NOM,PRENOM, USERNAME ,EMAIL ,MOT_DE_PASSE,DATE_NAISSANCE ,IMAGE) => {
          try {
                    var sqlQuery =`
                    INSERT INTO drivers (
                        NOM,
                        PRENOM,
                        USERNAME,
                        EMAIL,
                        MOT_DE_PASSE,
                        DATE_NAISSANCE,
                        IMAGE
                    )
                values (?, ?, ?, ?, ?, ?, ?)`;
                    return query(sqlQuery, [ NOM,PRENOM, USERNAME ,EMAIL ,MOT_DE_PASSE,DATE_NAISSANCE ,IMAGE])
          }
          catch (error) {

                    throw error
          }
}
const updateOne = ( NOM,PRENOM, USERNAME ,EMAIL ,MOT_DE_PASSE,DATE_NAISSANCE ,IMAGE,ID_DRIVER) => {
      try {
                var sqlQuery =`
                UPDATE drivers SET 
                    NOM=?,
                    PRENOM=?,
                    USERNAME=?,
                    EMAIL=?,
                    MOT_DE_PASSE=?,
                    DATE_NAISSANCE=?,
                    IMAGE=?
                WHERE ID_DRIVER=?`;
                return query(sqlQuery, [ NOM,PRENOM, USERNAME ,EMAIL ,MOT_DE_PASSE,DATE_NAISSANCE ,IMAGE,ID_DRIVER])
      }
      catch (error) {

                throw error
      }
}
const findById = async (id) => {
          try {
                    return query("SELECT * FROM drivers WHERE ID_DRIVER  = ?", [id]);
          } catch (error) {
                    throw error;
          }
};
module.exports = {
          createOne,
          findById,
          findUserLogin,
          updateOne,
          searchEmail
       
}