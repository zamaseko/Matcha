const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/', userController.formSignup)

router.post('/', userController.registerUser)

module.exports = router

