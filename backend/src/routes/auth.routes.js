const router = require('express').Router();
const { login, refresh, logout, me, loginValidation } = require('../controllers/auth.controller');
const { validate }  = require('../middlewares/validate.middleware');
const { protect }   = require('../middlewares/auth.middleware');

router.post('/login',   loginValidation, validate, login);
router.post('/refresh', refresh);
router.post('/logout',  protect, logout);
router.get('/me',       protect, me);

module.exports = router;
