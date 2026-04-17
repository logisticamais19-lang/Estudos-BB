const router = require('express').Router();
const ctrl   = require('../controllers/planController');
const { authenticate } = require('../middleware/auth');

router.get    ('/', authenticate, ctrl.getPlan);
// Webhook de pagamento — NÃO requer token de usuário, requer webhookSecret
router.post   ('/upgrade', ctrl.upgradePlan);

module.exports = router;
