const router = require('express').Router();
const {
    getCars, getFeaturedCars, searchCars, getCarBySlug,
    adminGetCars, createCar, updateCar, deleteCar, togglePublish, toggleFeature,
    carValidation
} = require('../controllers/cars.controller');
const { protect }     = require('../middlewares/auth.middleware');
const { restrictTo }  = require('../middlewares/role.middleware');
const { validate }    = require('../middlewares/validate.middleware');
const { auditLog }    = require('../middlewares/audit.middleware');

// ── Public routes ───────────────────────────────────────────
router.get('/',          getCars);
router.get('/featured',  getFeaturedCars);
router.get('/search',    searchCars);
router.get('/:slug',     getCarBySlug);

// ── Admin routes ────────────────────────────────────────────
const adminAuth = [protect, restrictTo('admin', 'staff')];

router.get(  '/admin/all',             ...adminAuth, adminGetCars);
router.post( '/admin',                 ...adminAuth, carValidation, validate, auditLog('CREATE_CAR','cars'), createCar);
router.put(  '/admin/:id',             ...adminAuth, auditLog('UPDATE_CAR','cars'), updateCar);
router.delete('/admin/:id',            ...adminAuth, auditLog('DELETE_CAR','cars'), deleteCar);
router.patch('/admin/:id/publish',     ...adminAuth, auditLog('TOGGLE_PUBLISH','cars'), togglePublish);
router.patch('/admin/:id/feature',     ...adminAuth, auditLog('TOGGLE_FEATURE','cars'), toggleFeature);

module.exports = router;
