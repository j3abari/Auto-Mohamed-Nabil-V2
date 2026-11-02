const router = require('express').Router();
const {
    createInquiry, inquiryValidation,
    adminGetInquiries, adminGetInquiry, updateInquiryStatus, verifyInquiryRef
} = require('../controllers/inquiries.controller');
const { protect }    = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { validate }   = require('../middlewares/validate.middleware');
const { auditLog }   = require('../middlewares/audit.middleware');

// ── Public: submit inquiry ───────────────────────────────────
router.post('/', inquiryValidation, validate, createInquiry);

// ── Admin ────────────────────────────────────────────────────
const adminAuth = [protect, restrictTo('admin', 'staff')];

router.post('/verify-ref', ...adminAuth, auditLog('VERIFY_INQUIRY_REF', 'inquiries'), verifyInquiryRef);
router.get('/',            ...adminAuth, adminGetInquiries);
router.get('/:id',         ...adminAuth, adminGetInquiry);
router.patch('/:id/status', ...adminAuth, auditLog('UPDATE_INQUIRY_STATUS','inquiries'), updateInquiryStatus);

module.exports = router;
