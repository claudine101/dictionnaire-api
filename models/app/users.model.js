const PROFILS = require("../../constants/PROFILS");
const { query } = require("../../utils/db");

/**
 * Permet de récuper l'utilisateur comme client
 * @param { string } email 
 * @returns 
 */
const findUserLogin = async (email) => {
          try {
                    var sqlQuery = `
                    SELECT ID_USER,
                              NOM,
                              PRENOM,
                              EMAIL,
                              USERNAME,
                              PASSWORD,
                              ID_PROFIL
                    FROM users
                    WHERE email = ? AND ID_PROFIL = ?
                    `;
                    return query(sqlQuery, [email, PROFILS.client]);
          } catch (error) {
                    throw error;
          }
};

/**
 * Permet de récuper l'utilisateur comme partenaire par email
 * @param { string } email 
 * @returns 
 */
const findPartenaireLogin = async (email) => {
          try {
                    var sqlQuery = `
                    SELECT u.ID_USER,
                              NOM,
                              PRENOM,
                              EMAIL,
                              USERNAME,
                              PASSWORD,
                              ID_PROFIL,
                              p.ID_PARTENAIRE
                    FROM users u
                    LEFT JOIN partenaires p ON p.ID_USER = u.ID_USER
                    WHERE email = ? AND ID_PROFIL = ?
                    `;
                    return query(sqlQuery, [email, PROFILS.partenaire]);
          } catch (error) {
                    throw error;
          }
};

const findBy = async (column, value) => {
          try {
                    var sqlQuery = `SELECT * FROM users  WHERE ${column} = ? `;
                    return query(sqlQuery, [value]);
          } catch (error) {
                    throw error;
          }
};
const createOne = (NOM, PRENOM, EMAIL, USERNAME, PASSWORD, ID_PROFIL, SEXE, DATE_NAISSANCE, COUNTRY_ID, ADRESSE, TELEPHONE_1, TELEPHONE_2, IMAGE) => {
          try {
                    var sqlQuery = "INSERT INTO users (NOM,PRENOM,EMAIL,USERNAME,PASSWORD,ID_PROFIL,SEXE,DATE_NAISSANCE,COUNTRY_ID,ADRESSE,TELEPHONE_1,TELEPHONE_2,IMAGE)";
                    sqlQuery += "values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    return query(sqlQuery, [
                              NOM, PRENOM, EMAIL, USERNAME, PASSWORD, ID_PROFIL, SEXE, DATE_NAISSANCE, COUNTRY_ID, ADRESSE, TELEPHONE_1, TELEPHONE_2, IMAGE])
          }
          catch (error) {

                    throw error
          }
}
const findById = async (id) => {
          try {
                    return query("SELECT * FROM users WHERE ID_USER  = ?", [id]);
          } catch (error) {
                    throw error;
          }
};
module.exports = {
          findBy,
          createOne,
          findById,
          findUserLogin,
          findPartenaireLogin
}