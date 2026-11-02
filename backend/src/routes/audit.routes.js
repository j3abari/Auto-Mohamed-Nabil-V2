const router = require('express').Router();
const { getAuditLogs, createAuditLog } = require('../controllers/audit.controller');
const { protect }    = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const adminAuth = [protect, restrictTo('admin', 'staff')];

router.get('/',  ...adminAuth, getAuditLogs);
router.post('/', ...adminAuth, createAuditLog);

module.exports = router;
