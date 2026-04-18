const express = require('express')
const router = express.Router()
const authenticate = require('../middleware/auth')
const adminCtrl = require('../controllers/adminController')

const ADMIN_UIDS = ['2WKwdCPEJoMocxRv8cOdZn31kjn2']

function checkAdmin(req, res, next) {
  if (!ADMIN_UIDS.includes(req.uid)) {
    return res.status(403).json({ error: 'Acesso negado.' })
  }
  next()
}

router.use(authenticate)
router.use(checkAdmin)

router.get('/users',        adminCtrl.listUsers)
router.post('/:uid/plan',   adminCtrl.changePlan)
router.delete('/:uid',      adminCtrl.deleteUser)

module.exports = router
