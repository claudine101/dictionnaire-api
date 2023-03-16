const jwt = require("jsonwebtoken");

const generateToken = (data, maxAge) => {
          return jwt.sign(data, process.env.JWT_PRIVATE_KEY, {
                    expiresIn: maxAge,
          });
};
module.exports = generateToken;
