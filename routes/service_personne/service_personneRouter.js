const express = require('express')
const driver_course_routes = require('./driver_course.routes')
const service_personneRouter = express.Router()

service_personneRouter.use('/driver_course', driver_course_routes)

module.exports = service_personneRouter