const express = require('express')

const restaurant_menus_controller = require('../../controllers/resto/restaurant_menus.controller')
const restaurant_menus_notes_routes = express.Router()

restaurant_menus_notes_routes.post('/',restaurant_menus_controller.createNotes)
restaurant_menus_notes_routes.get('/',restaurant_menus_controller.getnotesMenus)
restaurant_menus_notes_routes.get('/notes', restaurant_menus_controller.getuserNotes)
restaurant_menus_notes_routes.put('/:ID_NOTE',restaurant_menus_controller.updateNote)
restaurant_menus_notes_routes.delete('/:ID_NOTE',restaurant_menus_controller.deleteNote)
restaurant_menus_notes_routes.get('/notes/:ID_PARTENAIRE_SERVICE', restaurant_menus_controller.getpartenaireNotes)
module.exports =restaurant_menus_notes_routes