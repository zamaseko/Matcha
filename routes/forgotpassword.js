const express = require('express')
const router = express.Router()
const passwordController = require('../controllers/passwordController')

router.get('/', passwordController.forgotDisplay)

router.post('/', passwordController.forgotPassword)

router.get('/:token', passwordController.resetForm)

router.post('/:token', passwordController.resetPassword)

module.exports = router
