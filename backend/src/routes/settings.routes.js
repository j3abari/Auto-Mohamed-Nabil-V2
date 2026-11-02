const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, syncAllToSheets } = require('../controllers/settings.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public route to fetch settings (announcement bar, contact info, maintenance status)
router.get('/', getSettings);

// Protected routes (Admin only)
router.put('/', protect, updateSettings);
router.post('/sheets/sync-all', protect, syncAllToSheets);

module.exports = router;
