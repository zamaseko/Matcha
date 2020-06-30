const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/', userController.loginForm)

router.post('/', userController.loginUser)

module.exports = router
