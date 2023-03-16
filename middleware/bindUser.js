const jwt = require("jsonwebtoken");

const bindUser = (request, response, next) => {
          const bearer = request.headers.authorization;
          const bearerToken = bearer && bearer.split(" ")[1];
          const token = bearerToken
          if (token) {
                    jwt.verify(token, process.env.JWT_PRIVATE_KEY, (error, user) => {
                              if (error) {
                                        next();
                              } else {
                                        request.userId = user.user;
                                        next();
                              }
                    });
          } else {
                    next();
          }
};
module.exports = bindUser;