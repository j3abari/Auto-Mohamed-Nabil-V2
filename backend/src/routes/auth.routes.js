const router = require('express').Router();
const { login, refresh, logout, me, loginValidation, createStaffUser, listStaffUsers, toggleStaffStatus } = require('../controllers/auth.controller');
const { validate }   = require('../middlewares/validate.middleware');
const { protect }    = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const adminOnly = [protect, restrictTo('admin')];

router.post('/login',        loginValidation, validate, login);
router.post('/refresh',      refresh);
router.post('/logout',       protect, logout);
router.get('/me',            protect, me);

// Staff user management (admin only)
router.get('/users',         ...adminOnly, listStaffUsers);
router.post('/users',        ...adminOnly, createStaffUser);
router.patch('/users/:id',   ...adminOnly, toggleStaffStatus);

module.exports = router;
