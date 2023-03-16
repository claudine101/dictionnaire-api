const express = require('express')
const auth_partenaires_routes = require('./auth_partenaires.routes')
const auth_users_routes = require('./auth_users.routes')
const authRouter = express.Router()

authRouter.use('/users', auth_users_routes)
authRouter.use('/partenaires', auth_partenaires_routes)

module.exports = authRouter