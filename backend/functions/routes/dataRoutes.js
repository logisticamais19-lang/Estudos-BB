const router = require('express').Router();
const ctrl   = require('../controllers/dataController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get  ('/',       ctrl.getAll);
router.post ('/save',   ctrl.saveDoc);
router.post ('/batch',  ctrl.saveBatch);

module.exports = router;
