const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const {gettransaction_history,adminpost, admget,getdashboard,updpass,profileget,profilepost,recoverypost,registerget,baseget, loginget, loginpost, logoutget, registerpost, recoveryget} = require('./handler');
dotenv.config();
const router = express.Router();
const raw = path.join(__dirname);
router.use(express.static(raw));
router.use(cookieParser());
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


router.get('/', baseget);
router.get('/login', loginget);
router.post('/login', loginpost);
router.get('/logout', logoutget);
router.get('/register',registerget);
router.post('/register', registerpost);
router.get(`/recovery`,recoveryget);
router.post(`/recovery`,recoverypost);
router.get(`/profile`,profileget);
router.post(`/profile`,profilepost);
router.post(`/update-password`,updpass);
router.get(`/dashboard`,getdashboard);
router.get(`/admlog`,admget);
router.post(`/admin-dashboard`,adminpost);
router.get(`/trans_history`,gettransaction_history);
router.get(``,);
router.get(``,);
module.exports = router;
