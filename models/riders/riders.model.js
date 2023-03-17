
const { query } = require("../../utils/db");
/**
 * Permet de récuper l'utilisateur comme riders
 * @param { string } email 
 * @returns 
 */
const findUserLogin = async (email) => {
      try {
                var sqlQuery = 'SELECT ID_RIDER,NOM,PRENOM,EMAIL,USERNAME,MOT_DE_PASSE FROM riders WHERE email = ?';
                return query(sqlQuery, [email]);
      } catch (error) {
                throw error;
      }
};
const searchEmail = async (id,EMAIL) => {
      try {
                var sqlQuery = 'SELECT ID_RIDER  FROM riders WHERE ID_RIDER != ? AND EMAIL=?';
                return query(sqlQuery, [id,EMAIL]);
      } catch (error) {
                throw error;
      }
};
const createOne = ( NOM,PRENOM, USERNAME ,EMAIL ,MOT_DE_PASSE,DATE_NAISSANCE ,IMAGE) => {
          try {
                    var sqlQuery =`
                    INSERT INTO riders (
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
const updateOne = ( NOM,PRENOM, USERNAME ,EMAIL ,MOT_DE_PASSE,DATE_NAISSANCE ,IMAGE,ID_RIDER) => {
      try {
                var sqlQuery =`
                UPDATE riders SET 
                    NOM=?,
                    PRENOM=?,
                    USERNAME=?,
                    EMAIL=?,
                    MOT_DE_PASSE=?,
                    DATE_NAISSANCE=?,
                    IMAGE=?
                WHERE ID_RIDER=?`;
                return query(sqlQuery, [ NOM,PRENOM, USERNAME ,EMAIL ,MOT_DE_PASSE,DATE_NAISSANCE ,IMAGE,ID_RIDER])
      }
      catch (error) {

                throw error
      }
}
const findById = async (id) => {
          try {
                    return query("SELECT * FROM riders WHERE ID_RIDER  = ?", [id]);
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