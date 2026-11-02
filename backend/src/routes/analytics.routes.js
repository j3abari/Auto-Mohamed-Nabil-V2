const router = require('express').Router();
const { getOverview } = require('../controllers/analytics.controller');
const { protect }    = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.get('/overview', protect, restrictTo('admin', 'staff'), getOverview);

module.exports = router;
