const express = require('express');
const router = express.Router();
const passport = require('passport');

const checkRole = require('../middleware/checkRole')

const {registerUser,loginUser,getUserProfile,logoutUser,updateNotificationPreferences,createTeam,addMemberToTeam,getTeamMembers} = require("../controllers/userController");
const { generalRateLimiter, loginRateLimiter } = require('../middleware/rateLimiter');

router.post('/register',loginRateLimiter, registerUser);
router.get('/login',loginRateLimiter,loginUser);
router.get('/getprofile',passport.authenticate("jwt", { session: false }),generalRateLimiter,getUserProfile);
router.post('/logout',passport.authenticate("jwt", { session: false }),generalRateLimiter,logoutUser);
router.post('/createTeam',passport.authenticate("jwt", { session: false }), checkRole(['Admin', 'Manager']),generalRateLimiter, createTeam);
router.post('/addMember',passport.authenticate("jwt", { session: false }), checkRole(['Admin','Manager']),generalRateLimiter, addMemberToTeam);
router.get('/getAllMembers',passport.authenticate("jwt", { session: false }), checkRole(['Admin','Manager']),generalRateLimiter,getTeamMembers);
router.put('/updatePreference',passport.authenticate("jwt", { session: false }),generalRateLimiter,updateNotificationPreferences);


module.exports = router;