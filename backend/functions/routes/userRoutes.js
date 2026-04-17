const router  = require('express').Router();
const ctrl    = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

router.use(authenticate);

router.get   ('/',        ctrl.getProfile);
router.post  ('/',        validate('profile'), ctrl.createProfile);
router.put   ('/',        validate('profile'), ctrl.updateProfile);
router.delete('/',        ctrl.deleteAccount);

module.exports = router;
