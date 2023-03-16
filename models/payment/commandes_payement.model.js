const { query } = require("../../utils/db")

const createOne = async (ID_SERVICE_CATEGORIE, MODE_ID = 1, NUMERO, EMAIL_PAYE, MONTANT, TXNI_D, STATUT_ID = 0, COMPTE_SIBLE = null, CLIENT_ID_PAYEMENT = null, INVOICE_ID = null, CARTE_TYPE = null, DEVISE = null) => {
          try {
                    return query('INSERT INTO commandes_payement(ID_SERVICE_CATEGORIE, MODE_ID, NUMERO, EMAIL_PAYE, MONTANT, TXNI_D, STATUT_ID, COMPTE_SIBLE, CLIENT_ID_PAYEMENT, INVOICE_ID, CARTE_TYPE, DEVISE)  VALUES(?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?,?)', [
                              ID_SERVICE_CATEGORIE, MODE_ID, NUMERO, EMAIL_PAYE, MONTANT, TXNI_D, STATUT_ID, COMPTE_SIBLE, CLIENT_ID_PAYEMENT, INVOICE_ID, CARTE_TYPE, DEVISE
                    ])
          } catch (error) {
                    throw error
          }
}

const changeStatus = async (txni_d, status) => {
          try {
                    return query('UPDATE commandes_payement SET STATUT_ID = ? WHERE TXNI_D = ?', [status, txni_d])
          } catch  (error) {
                    throw error
          }
}


const findBy = async (column, value) => {
          try {
                    return query(`SELECT * FROM commandes_payement WHERE ${column} = ?`, [value])
          } catch (error) {
                    throw error
          }
}

module.exports = {
          createOne,
          findBy,
          changeStatus
}