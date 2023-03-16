const randomBytes = require('randombytes');
const { query } = require('./db');

const getReferenceCode = async () => {
          var CODE_UNIQUE = randomBytes(3).toString('hex').toUpperCase()
          var alreadyExists = true
          while (alreadyExists) {
                    alreadyExists = (await query('SELECT ID_COMMANDE FROM ecommerce_commandes WHERE CODE_UNIQUE = ?', [CODE_UNIQUE]))[0] ? true : false
                    CODE_UNIQUE = randomBytes(3).toString('hex').toUpperCase()
          }
          return CODE_UNIQUE
}
module.exports = getReferenceCode