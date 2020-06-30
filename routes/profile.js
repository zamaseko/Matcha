const express = require('express')
const router = express.Router()
const profileController = require('../controllers/profileController')
const userController = require('../controllers/userController')
const upload = require('../models/imageModel')


router.get('/', userController.auth, profileController.formProfile)

router.post('/', userController.auth, profileController.registerProfile)

router.get('/upload', userController.auth, profileController.formPhotos)

router.post('/upload', userController.auth, upload.single('photos'), profileController.uploadPhotos)

router.get('/u', profileController.auth, profileController.userProfile)

router.post('/block', profileController.auth, profileController.block)

router.post('/like', profileController.auth, profileController.likeTweaked)

router.get('/admin', profileController.auth, userController.createAdmin)

router.post('/va', profileController.auth, userController.vAdmin)

router.post('/stat-l', profileController.auth, profileController.likeStatus)

router.post('/stat-b', profileController.auth, profileController.blockStatus)

router.get('/:match', profileController.auth, profileController.matchProfile)

module.exports = router
