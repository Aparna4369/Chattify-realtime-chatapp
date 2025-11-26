import express from 'express'
import { loginUser, registerUser,logoutUser,getAllUsers } from '../controllers/userControllers.js'



const router=express.Router()
router.route('/').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(logoutUser)
router.route('/').get(getAllUsers)


export default router