const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/', adminController.auth, adminController.adminForm)

router.post('/', adminController.auth, adminController.processForm)

module.exports = router
